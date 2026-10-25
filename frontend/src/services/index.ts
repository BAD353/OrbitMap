import { Cartesian3 } from "cesium";
import type { Satellite } from "../types/satellite/satellite";
import type { PropagateWorkerRequest } from "../types/worker/propagateWorkerRequest";
import { createPropagateWrapper } from "./propagation/propagateWrapper";
import { loadElsetData } from "./storage/loadElsetData";
import { loadSatelliteData } from "./storage/loadSatelliteData";
import { interpolateECEF } from "../util/interpolateECEF";

let satelliteList: Satellite[] = [];
let satelliteIDMap: Map<string, number> = new Map();

let hasLoaded: boolean = false;

export async function loadLocalData() {
  await loadSatelliteData().then((satellites) => {
    satelliteList = satellites;
    satelliteIDMap.clear();
    for (let i = 0; i < satelliteList.length; i++) {
      satelliteIDMap.set(satelliteList[i].noradID, i);
    }
  });
  await loadElsetData().then((elsets) => {
    const elsetMap = new Map(elsets.map((elset) => [elset.noradID, elset]));
    satelliteList.forEach((satellite, index) => {
      satelliteList[index].latestElset = elsetMap.get(satellite.noradID);
    });
  });
  hasLoaded = true;
}

const propagateWrapper = createPropagateWrapper((res) => {
  if (res.success == false) return;
  for (let update of res.updates) {
    const id = satelliteIDMap.get(update.noradID);
    if (id == undefined) continue;
    if (update.state == undefined) {
      satelliteList[id].latestECEFPositions = [];
      continue;
    }
    satelliteList[id].latestECEFPositions.push(update.state);
  }
});

export function propagateWorkerInit() {
  let request: PropagateWorkerRequest = {
    type: "setElements",
    satelliteList: satelliteList,
  };
  propagateWrapper.send(request);
}

export function propagateSatellites() {
  let request: PropagateWorkerRequest = {
    type: "propagateSelected",
    propagateList: [],
  };

  const now = (new Date()).getTime();

  for (let i = 0; i < satelliteList.length; i++) {
    while (
      satelliteList[i].latestECEFPositions.length > 2 &&
      satelliteList[i].latestECEFPositions[2].epoch < now
    ) {
      satelliteList[i].latestECEFPositions.shift();
    }
    let lastDate =
      satelliteList[i].latestECEFPositions.length == 0
        ? undefined
        : satelliteList[i].latestECEFPositions[satelliteList[i].latestECEFPositions.length - 1].epoch;
    while (lastDate == undefined || lastDate <= Date.now() + 2 * 5000) {
      //update every 5 seconds with a 2x buffer
      lastDate = lastDate ? lastDate + 5000 : Date.now();
      request.propagateList.push({
        satelliteID: satelliteList[i].noradID,
        time: lastDate,
      });
    }
  }
  propagateWrapper.send(request);
}

export function getSatellites() {
  return satelliteList;
}

export function getSatelliteByID(satelliteID: string): Satellite | undefined {
  return satelliteList.find(sat=>sat.noradID === satelliteID);
}

let hasLaunchedPropagation = false;

function continiousPropagation(onUpdate: Function) {
  setInterval(() => {
    propagateSatellites();
    onUpdate();
  }, 2500); //about half the span, to distribute load more evenly
}

export function launchPropagation(onUpdate: Function) {
  if (!hasLaunchedPropagation && hasLoaded) {
    hasLaunchedPropagation = true;
    propagateWorkerInit();
    continiousPropagation(onUpdate);
  }
}

export function getSatellitePosition(id: number | string, 
  time: number, 
  result?: Cartesian3,
): Cartesian3 | undefined {
  let pos: number | undefined = undefined;
  let i = typeof(id) === "string"? satelliteIDMap.get(id): id;
  if (i === undefined) return undefined;
  for (let j = 0; j < satelliteList[i].latestECEFPositions.length-1; j++) {
    if (
      satelliteList[i].latestECEFPositions[j].epoch <= time 
      && time <= satelliteList[i].latestECEFPositions[j+1].epoch
    ) {
      pos = j;
      break;
    }
  }
  if (pos === undefined) {
    return undefined;
  }
  const state = interpolateECEF(
    satelliteList[i].latestECEFPositions[pos], 
    satelliteList[i].latestECEFPositions[pos+1], 
    time
  );
  if (!state) {
    return undefined;
  }
  if(!result) result = new Cartesian3();
  result.x = state.pos.x*1000;
  result.y = state.pos.y*1000;
  result.z = state.pos.z*1000;
  // if (id === 0) console.log("running", result);
  return result;
}