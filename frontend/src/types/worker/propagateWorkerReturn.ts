import type { ECEFState } from "../coordinates/ecef";
import type { GeodeticState } from "../coordinates/geodetic";

export interface PropagateWorkerReturn {
  success: boolean;
  updates: {
    noradID: string;
    state?: ECEFState;
  }[];
}