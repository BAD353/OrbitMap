import type { Elset } from "../elset/elset";
import type { SatelliteInfo } from "./satelliteInfo";
import type { ECEFState } from "../coordinates/ecef";

export interface Satellite {
  noradID: string;
  info: SatelliteInfo;
  launchDate: Date;
  decayDate: Date | undefined;
  latestElset: Elset | undefined;
  // latestGeodeticPositions: GeodeticState[];
  latestECEFPositions: ECEFState[];
};