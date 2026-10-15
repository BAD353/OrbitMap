export interface ECEFPosition {
  x: number;
  y: number;
  z: number;
}

export interface ECEFVelocity {
  x: number;
  y: number;
  z: number;
}

export interface ECEFState {
  pos: ECEFPosition;
  vel: ECEFVelocity;
  epoch: Date;
}
