import { get, set } from "idb-keyval";

export async function addSatelliteData(newSatelliteData: (string | number | null)[][]) {
  const oldSatelliteData = (await get("satelliteData")) ?? [];
  let satelliteDataMap = new Map<string, (string | number | null)[]>(
    oldSatelliteData.map((satellite: (string | number | null)[]) => [satellite[0], satellite]),
  );
  for (let satellite of newSatelliteData) {
    if (typeof satellite[0] != "string") continue;

    const oldSatellite = satelliteDataMap.get(satellite[0]) ?? [];
    if (oldSatellite.length == 0) {
      // old is empty => new satellite => have to write
      satelliteDataMap.set(satellite[0], satellite);
      continue;
    }

    const oldDate = oldSatellite[oldSatellite.length - 1];
    const newDate = satellite[satellite.length - 1];
    if (typeof oldDate != "string" || typeof newDate != "string") continue;

    if (Date.parse(oldDate) < Date.parse(newDate)){ // newer info (newer updated_at) 
      satelliteDataMap.set(satellite[0], satellite);
    }
  }

  const newData = [...satelliteDataMap.values()];

  await set("satelliteData", newData);
}
