import type { GeodeticState } from "../types/coordinates/geodetic";

export function interpolateGeodetic(
  a: GeodeticState,
  b: GeodeticState,
  t: number,
): GeodeticState | undefined {
  if (t < a.epoch || t > b.epoch) return undefined;

  t = (t - a.epoch) / (b.epoch - a.epoch);

  if (b.pos.longitude - a.pos.longitude > 180) b.pos.longitude -= 360; 
  if (b.pos.longitude - a.pos.longitude < -180) b.pos.longitude += 360; 

  return {
    pos: {
      height: a.pos.height * (1 - t) + b.pos.height * t,
      longitude: ((a.pos.longitude * (1 - t) + b.pos.longitude * t+180)%360+360)%360-180,
      latitude: a.pos.latitude * (1 - t) + b.pos.latitude * t,
    },
    vel: {
      height: a.vel.height * (1 - t) + b.vel.height * t,
      longitude: a.vel.longitude * (1 - t) + b.vel.longitude * t,
      latitude: a.vel.latitude * (1 - t) + b.vel.latitude * t,
    },
    epoch: t,
  };
}
