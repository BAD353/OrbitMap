import type { Satellite } from "../satellite/satellite";


export interface PropagateWorkerSetElements {
  type: "setElements";
  satelliteList: Satellite[];
}

export interface PropagateWorkerPropagateSelected {
  type: "propagateSelected";
  propagateList: {
    satelliteID: string;
    time: number; //unix, milliseconds
  }[];
}

export type PropagateWorkerRequest = PropagateWorkerSetElements | PropagateWorkerPropagateSelected;
