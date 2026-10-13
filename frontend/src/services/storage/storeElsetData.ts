import { get, set } from "idb-keyval";

export async function addElsetData(newElsetData: (string | number | null)[][]) {
  const oldElsetData = (await get("elsetData")) ?? [];
  let elsetDataMap = new Map<string, (string | number | null)[]>(
    oldElsetData.map((elset: (string | number | null)[]) => [elset[0], elset]),
  );
  for (let elset of newElsetData) {
    if (typeof elset[0] != "string") continue;

    const oldElset = elsetDataMap.get(elset[0]) ?? [];
    if (oldElset.length == 0) {
      // old is empty => new elset => have to write
      elsetDataMap.set(elset[0], elset);
      continue;
    }

    const oldDate = oldElset[oldElset.length - 1];
    const newDate = elset[elset.length - 1];
    if (typeof oldDate != "string" || typeof newDate != "string") continue;

    if (Date.parse(oldDate) < Date.parse(newDate)){ // newer info (newer updated_at) 
      elsetDataMap.set(elset[0], elset);
    }
  }

  const newData = [...elsetDataMap.values()];

  await set("elsetData", newData);
}
