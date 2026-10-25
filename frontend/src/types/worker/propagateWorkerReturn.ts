import type { ECEFState } from "../coordinates/ecef";

export interface PropagateWorkerReturn {
  success: boolean;
  updates: {
    noradID: string;
    state?: ECEFState;
  }[];
}