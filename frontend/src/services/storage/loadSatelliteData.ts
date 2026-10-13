import { get, set } from "idb-keyval";
import type { Satellite } from "../../types/satellite/satellite";
import { fetchSatelliteData } from "../api/fetchSatelliteData";
import { addSatelliteData } from "./storeSatelliteData";

export async function loadSatelliteData(): Promise<Satellite[]> {
  const metaData = await get("satellitesMetaData");
  if (metaData) {
    if (Date.now()/1000 - metaData.last_fetched_at > 60 * 60) {
      // older than an hour
      const rawData = await fetchSatelliteData(metaData.last_updated_at - 60 * 60);
      const data = JSON.parse(rawData) as (string | number | null)[][];
      await addSatelliteData(data);
    }
  } else {
    const rawData = await fetchSatelliteData();
    const data = JSON.parse(rawData) as (string | number | null)[][];
    await addSatelliteData(data);
  }

  const satelliteData = (await get("satelliteData")) ?? [];
  let satellites: Satellite[] = satelliteData.map(
    (satellite: (string | number | null)[]): Satellite => ({
      noradID: satellite[0] as string,
      info: {
        name: satellite[1] as string,
        intlDesignator: satellite[2] as string,
        country: satellite[3] as string,
        objectType: satellite[4] as string
      },
      launchDate: new Date(satellite[5] as string),
      decayDate: satellite[6] == null ? undefined : new Date(satellite[6] as string),
      latestElset: undefined,
      latestGeodeticposition: undefined,
    }),
  );
  const last_updated_at = Math.max(
    satelliteData.map(
      (satellite: (string|number|null)[]) => satellite[satellite.length-1]
    )
  );
  await set("satellitesMetaData", {
    last_fetched_at: Date.now() / 1000, 
    last_updated_at: last_updated_at
  });
  return satellites;
}
