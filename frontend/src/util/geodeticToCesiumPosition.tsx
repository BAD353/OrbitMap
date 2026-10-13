import { Cartesian3 } from "cesium";
import type { GeodeticPosition } from "../types/coordinates/geodetic";

export function geodeticToCesiumPosition(geodetic: GeodeticPosition): Cartesian3 {
  return Cartesian3.fromDegrees(geodetic.longitude,geodetic.latitude,geodetic.height*1000);
}