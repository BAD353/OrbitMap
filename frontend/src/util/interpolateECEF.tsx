import type { ECEFState } from "../types/coordinates/ecef";

export function interpolateECEF(
  a: ECEFState,
  b: ECEFState,
  t: number,
): ECEFState | undefined {
  if (t < a.epoch || t > b.epoch) return undefined;

  t = (t - a.epoch) / (b.epoch - a.epoch);

  return {
    pos: {
      x: a.pos.x * (1-t) + b.pos.x * t,
      y: a.pos.y * (1-t) + b.pos.y * t,
      z: a.pos.z * (1-t) + b.pos.z * t,
    },
    vel: {
      x: a.vel.x * (1-t) + b.vel.x * t,
      y: a.vel.y * (1-t) + b.vel.y * t,
      z: a.vel.z * (1-t) + b.vel.z * t,
    },
    epoch: t,
  };
}
