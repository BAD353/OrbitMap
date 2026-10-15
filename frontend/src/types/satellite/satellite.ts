import type { Elset } from "../elset/elset";
import type { SatelliteInfo } from "./satelliteInfo";
import type { GeodeticState } from "../coordinates/geodetic";

export interface Satellite {
  noradID: string;
  info: SatelliteInfo;
  launchDate: Date;
  decayDate: Date | undefined;
  latestElset: Elset | undefined;
  latestGeodeticPositions: GeodeticState[];
};