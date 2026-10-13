export interface GeodeticPosition {
  longitude: number;
  latitude: number;
  height: number;
}

export interface GeodeticVelocity {
  longitude: number;
  latitude: number;
  height: number;
}

export interface GeodeticState {
  pos: GeodeticPosition;
  vel: GeodeticVelocity;
}
