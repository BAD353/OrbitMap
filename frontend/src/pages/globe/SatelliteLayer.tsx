import { useEffect } from "react";
import { Cartesian3, Color, JulianDate, NearFarScalar, PointPrimitive, PointPrimitiveCollection } from "cesium";
import {
  useCesium,
} from "resium";
import { getSatellites } from "../../services";
import { geodeticToCesiumPosition } from "../../util/geodeticToCesiumPosition";


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
            points[i].position = geodeticToCesiumPosition(satellites[i].latestGeodeticPositions[satellites[i].latestGeodeticPositions.length-1].pos);
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