import { get, set } from "idb-keyval";
import type { Elset } from "../../types/elset/elset";
import { fetchElsetData } from "../api/fetchElsetData";
import { addElsetData } from "./storeElsetData";

export async function loadElsetData(): Promise<Elset[]> {
  const metaData = await get("elsetsMetaData");
  if (metaData) {
    if (Date.now()/1000 - metaData.last_fetched_at > 60 * 60) {
      // older than an hour
      const rawData = await fetchElsetData(metaData.last_updated_at - 60 * 60);
      const data = JSON.parse(rawData) as (string | number | null)[][];
      await addElsetData(data);
    }
  } else {
    const rawData = await fetchElsetData();
    const data = JSON.parse(rawData) as (string | number | null)[][];
    await addElsetData(data);
  }

  const elsetData = (await get("elsetData")) ?? [];
  let elsets: Elset[] = elsetData.map(
    (elset: (string | number | null)[]): Elset => ({
      noradID: elset[0] as string,
      epoch: new Date((elset[1] as number)*1000),
      inclination: elset[2] as number,
      rightAscension: elset[3] as number,
      eccentricity: elset[4] as number,
      perigeeArg: elset[5] as number,
      meanAnomaly: elset[6] as number,
      meanMotion: elset[7] as number,
      bStar: elset[8] as number,
      revNumAtEpoch: elset[9] as number,
      meanMotionDot: elset[10] as number,
      meanMotionDDot: elset[11] as number,
      creationDate: new Date((elset[12] as number)*1000),
      gp_id: elset[13] as number,
      semimajor_axis: elset[14] as number,
      period: elset[15] as number,
      apoapsis: elset[16] as number,
      periapsis: elset[17] as number
    }),
  );
  const last_updated_at = Math.max(
    elsetData.map(
      (elset: (string|number|null)[]) => elset[elset.length-1]
    )
  );
  await set("elsetsMetaData", {
    last_fetched_at: Date.now() / 1000, 
    last_updated_at: last_updated_at
  });
  return elsets;
}