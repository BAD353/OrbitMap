import type { Satellite } from "../types/satellite/satellite";
import { propagateSatellite } from "./propagation/propagate";
import { loadElsetData } from "./storage/loadElsetData";
import { loadSatelliteData } from "./storage/loadSatelliteData";

let satelliteList: Satellite[] = [];

export async function loadLocalData() {
  await loadSatelliteData().then((satellites) => {
    satelliteList = satellites;
  });
  await loadElsetData().then((elsets) => {
    const elsetMap = new Map(elsets.map((elset) => [elset.noradID, elset]));
    satelliteList.forEach((satellite, index) => {
      satelliteList[index].latestElset = elsetMap.get(satellite.noradID);
    });
  });
}

export function propagateSatellites() {
  const before = Date.now();
  satelliteList.forEach(propagateSatellite);
  const after = Date.now();
  console.log(satelliteList[0]);
  console.log("Time to propagate: ", after-before, " ms");
}

export function getSatellites() {
  return satelliteList;
}

let hasLaunchedPropagation = false;

function continiousPropagation(onUpdate: Function) {
  setInterval(()=>{
    satelliteList.forEach(propagateSatellite);
    console.log("Propagated");
    onUpdate();
  },1000);
}

export function launchPropagation(onUpdate: Function) {
  if (!hasLaunchedPropagation) {
    hasLaunchedPropagation = true;
    continiousPropagation(onUpdate);
  }
}