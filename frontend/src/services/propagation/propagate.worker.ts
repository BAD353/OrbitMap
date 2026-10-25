import {  eciToEcf, gstime, json2satrec, propagate, type OMMJsonObject, type SatRec } from "satellite.js";
import type { PropagateWorkerReturn } from "../../types/worker/propagateWorkerReturn";
import type { PropagateWorkerRequest } from "../../types/worker/propagateWorkerRequest";
import type { ECEFState } from "../../types/coordinates/ecef";

let satList: SatRec[] = [];
let satIDMap: Map<string, number> = new Map();

self.onmessage = (e: MessageEvent<PropagateWorkerRequest>) => {
  if (e.data.type == "setElements") {
    satList = [];
    satIDMap.clear();
    for (let i = 0; i < e.data.satelliteList.length; i++) {
      const satellite = e.data.satelliteList[i];
      if (satellite.latestElset == undefined) continue;
      const omm: OMMJsonObject = {
        OBJECT_NAME: satellite.info.name,
        OBJECT_ID: satellite.info.intlDesignator,
        EPOCH: satellite.latestElset.epoch.toISOString(),
        MEAN_MOTION: satellite.latestElset.meanMotion,
        ECCENTRICITY: satellite.latestElset.eccentricity,
        INCLINATION: satellite.latestElset.inclination,
        RA_OF_ASC_NODE: satellite.latestElset.rightAscension,
        ARG_OF_PERICENTER: satellite.latestElset.perigeeArg,
        MEAN_ANOMALY: satellite.latestElset.meanAnomaly,
        CLASSIFICATION_TYPE:
          satellite.info.objectType == "U" || satellite.info.objectType == "C" ? satellite.info.objectType : undefined,
        NORAD_CAT_ID: satellite.noradID,
        ELEMENT_SET_NO: 999,
        REV_AT_EPOCH: satellite.latestElset.revNumAtEpoch,
        BSTAR: satellite.latestElset.bStar,
        MEAN_MOTION_DOT: satellite.latestElset.meanMotionDot,
        MEAN_MOTION_DDOT: satellite.latestElset.meanMotionDDot,
      };
      satList.push(json2satrec(omm));
      satIDMap.set(satellite.noradID, satList.length-1);
    }
    self.postMessage({success:true, updates: []} as PropagateWorkerReturn);
    return;
  }
  if (e.data.type == "propagateSelected") {
    let response: PropagateWorkerReturn = {
      success: false,
      updates: [],
    };
    const propagateList = e.data.propagateList;
    for (const {satelliteID, time} of propagateList) {
      const id = satIDMap.get(satelliteID);
      if (id == undefined) {
        response.updates.push({noradID:satelliteID, state:undefined});
        continue;
      };

      const propagationEpoch = new Date(time);

      const positionAndVelocity = propagate(satList[id], propagationEpoch);

      if (positionAndVelocity == null) {
        response.updates.push({noradID:satelliteID, state:undefined});
        continue;
      }
      
      const gmst = gstime(new Date(time));

      const ecefPos = eciToEcf(positionAndVelocity.position, gmst);
      const ecefVel = eciToEcf(positionAndVelocity.velocity, gmst);

      const latestSatellitePosition: ECEFState = {
        pos: ecefPos,
        vel: ecefVel,
        epoch: propagationEpoch.getTime(),
      };
      response.updates.push({noradID:satelliteID, state:latestSatellitePosition});
    }
    response.success = true;
    self.postMessage(response);
  }
};
