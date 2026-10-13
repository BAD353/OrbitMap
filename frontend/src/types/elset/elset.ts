export interface Elset {
  noradID: string;
  epoch: Date;
  creationDate: Date;
  
  inclination: number;
  rightAscension: number;
  eccentricity: number;
  perigeeArg: number;
  meanAnomaly: number;
  meanMotion: number;
  bStar: number;
  revNumAtEpoch: number;
  
  meanMotionDot: number;
  meanMotionDDot: number;
  gp_id: number;
  
  semimajor_axis: number;
  period: number;
  apoapsis: number;
  periapsis: number;
};