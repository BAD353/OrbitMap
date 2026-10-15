export interface ECIPosition {
  x: number;
  y: number;
  z: number;
}

export interface ECIVelocity {
  x: number;
  y: number;
  z: number;
}

export interface ECIState {
  pos: ECIPosition;
  vel: ECIVelocity;
  epoch: Date;
}
