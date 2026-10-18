import type { Satellite } from "../types/satellite/satellite";
import type { PropagateWorkerRequest } from "../types/worker/propagateWorkerRequest";
import { propagateSatellite } from "./propagation/propagate";
import { createPropagateWrapper } from "./propagation/propagateWrapper";
import { loadElsetData } from "./storage/loadElsetData";
import { loadSatelliteData } from "./storage/loadSatelliteData";

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
      satelliteList[id].latestGeodeticPositions = [];
      continue;
    }
    satelliteList[id].latestGeodeticPositions.push(update.state);
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

  for (let i = 0; i < satelliteList.length; i++) {
    while (
      satelliteList[i].latestGeodeticPositions.length > 2 &&
      satelliteList[i].latestGeodeticPositions[3].epoch < new Date()
    ) {
      satelliteList[i].latestGeodeticPositions.shift();
    }
    let lastDate =
      satelliteList[i].latestGeodeticPositions.length == 0
        ? undefined
        : satelliteList[i].latestGeodeticPositions[satelliteList[i].latestGeodeticPositions.length - 1].epoch.getTime();
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
