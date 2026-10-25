import type { Elset } from "../types/elset/elset";
import type { OrbitType } from "../types/elset/orbitType";

export const orbitColors: Record<OrbitType, string> = {
  "LEO": "#0d53c5",
  "MEO": "#22C55E",
  "HEO": "#ffe600",
  "GEO": "#A855F7",
  "NEO": "#FF2D78",
};

export function getOrbitType(elset: Elset): OrbitType {
  if (elset.apoapsis > 38000) return "NEO"; //to avoid classifying too many objects as HEO
  if (elset.eccentricity > 0.25) return "HEO";
  
  if (elset.apoapsis < 2000) return "LEO";
  if (elset.apoapsis < 34000) return "MEO";
  if (elset.periapsis > 34000 && elset.apoapsis < 38000) return "GEO";
  return "NEO";
}