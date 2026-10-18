import { useEffect } from "react";
import { Cartesian3, Color, JulianDate, NearFarScalar, PointPrimitive, PointPrimitiveCollection } from "cesium";
import {
  useCesium,
} from "resium";
import { getSatellites } from "../../services";
import { geodeticToCesiumPosition } from "../../util/geodeticToCesiumPosition";
import type { GeodeticState } from "../../types/coordinates/geodetic";
import { interpolateGeodetic } from "../../util/interpolateGeodetic";


export function SatelliteLayer() {
  const { viewer } = useCesium();

  useEffect(()=>{
    if (!viewer) return;

    const collection = new PointPrimitiveCollection();
    viewer.scene.primitives.add(collection);
    viewer.clock.shouldAnimate = true;

    const satellites = getSatellites();

    const points: PointPrimitive[] = satellites.map(
      (satellite, index) => 
        collection.add({
          id: satellite.noradID,
          position: Cartesian3.ZERO,
          pixelSize: 10,
          color: Color.RED,
          outlineColor: Color.WHITE,
          outlineWidth: 2,
          scaleByDistance: new NearFarScalar(
            100_000,   
            1.0,
            10_000_000,
            0.1
          ),
        })
    );
    
    const removePreRender = viewer.scene.preRender.addEventListener(
      (_scene, time: JulianDate) => {
        const timeMs = JulianDate.toDate(time).getTime();
        
        const satellites = getSatellites();
        for (let i = 0; i < points.length; i++) {
          if (satellites.length > i && satellites[i].latestGeodeticPositions.length > 0) {
            points[i].show = true;
            if (i == 0) {
              // console.log(satellites[i].latestGeodeticPositions);
            }
            let pos: number | undefined = undefined;
            const time = new Date();
            for (let j = 0; j < satellites[i].latestGeodeticPositions.length-1; j++) {
              if (
                satellites[i].latestGeodeticPositions[j].epoch <= time 
                && time <= satellites[i].latestGeodeticPositions[j+1].epoch
              ) {
                pos = j;
                break;
              }
            }
            if (!pos) {
              points[i].show = false;
              continue;
            }
            const state = interpolateGeodetic(
              satellites[i].latestGeodeticPositions[pos], satellites[i].latestGeodeticPositions[pos+1], time
            );
            if (!state) {
              points[i].show = false;
              continue;
            }
            if (i == 0) {
              console.log(satellites[i].latestGeodeticPositions[pos].pos.latitude, state.pos.latitude, satellites[i].latestGeodeticPositions[pos+1].pos.latitude)
            }
            points[i].position = geodeticToCesiumPosition(state.pos);
          }
          else points[i].show = false;

        }

      }
    );

    return () =>{
      removePreRender();
      if (!viewer.isDestroyed()) viewer.scene.primitives.remove(collection); 
    }

  }, [viewer]);

  return null;
}