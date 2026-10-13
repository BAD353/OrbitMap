import { degreesToRadians, eciToGeodetic, gstime, json2satrec, propagate, radiansToDegrees, type OMMJsonObject } from "satellite.js";
import type { Satellite } from "../../types/satellite/satellite";

export function propagateSatellite(satellite: Satellite) {
  if (!satellite.latestElset || satellite.decayDate) return;
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
      satellite.info.objectType == "U" || satellite.info.objectType == "C" ? 
      satellite.info.objectType : undefined,
    NORAD_CAT_ID: satellite.noradID,
    ELEMENT_SET_NO: 999,
    REV_AT_EPOCH: satellite.latestElset.revNumAtEpoch,
    BSTAR: satellite.latestElset.bStar,
    MEAN_MOTION_DOT: satellite.latestElset.meanMotionDot,
    MEAN_MOTION_DDOT: satellite.latestElset.meanMotionDDot,
  };

  const satrec = json2satrec(omm);

  const positionAndVelocity = propagate(satrec, new Date());

  if (positionAndVelocity == null) return;
  
  const gmst = gstime(new Date());

  const geodeticPos = eciToGeodetic(positionAndVelocity.position, gmst);
  const geodeticVel = eciToGeodetic(positionAndVelocity.velocity, gmst);

  satellite.latestGeodeticposition = {
    pos: {
      longitude: radiansToDegrees(geodeticPos.longitude),
      latitude: radiansToDegrees(geodeticPos.latitude),
      height: geodeticPos.height
    },
    vel: {
      longitude: radiansToDegrees(geodeticVel.longitude),
      latitude: radiansToDegrees(geodeticVel.latitude),
      height: geodeticVel.height
    },
  };
}
