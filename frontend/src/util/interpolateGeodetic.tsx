import type { GeodeticState } from "../types/coordinates/geodetic";

export function interpolateGeodetic(
  a: GeodeticState,
  b: GeodeticState,
  time: Date,
): GeodeticState | undefined {
  if (time < a.epoch || time > b.epoch) return undefined;

  let t: number = (time.getTime() - a.epoch.getTime()) / (b.epoch.getTime() - a.epoch.getTime());

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
    epoch: time,
  };
}
