import { useEffect } from "react";
import { CallbackPositionProperty, Cartesian2, Cartesian3, Color, JulianDate, NearFarScalar, PointPrimitive, PointPrimitiveCollection, ScreenSpaceEventHandler, ScreenSpaceEventType } from "cesium";
import {
  useCesium,
} from "resium";
import { getSatellitePosition, getSatellites } from "../../services";


export function SatelliteLayer(
  {onSelect, selectedSatelliteID} : 
  {onSelect:(id: string) => void, selectedSatelliteID: string | undefined}
) {
  const { viewer } = useCesium();

  const satellites = getSatellites();

  useEffect(()=>{
    if (!viewer) return;
    viewer.scene.debugShowFramesPerSecond = true;
    const collection = new PointPrimitiveCollection();
    viewer.scene.primitives.add(collection);
    viewer.clock.shouldAnimate = true;


    const points: PointPrimitive[] = satellites.map(
      (satellite) => 
        collection.add({
          id: satellite.noradID,
          position: Cartesian3.ZERO,
          pixelSize: 10,
          color: Color.RED,
          outlineColor: Color.WHITE,
          outlineWidth: 2,
          scaleByDistance: new NearFarScalar(
            200_000,   
            1.0,
            10_000_000,
            0.1
          ),
        })
    );
    
    const removePreRender = viewer.scene.preRender.addEventListener(
      (_scene, time: JulianDate) => {
        const datetime = (time?JulianDate.toDate(time):new Date()).getTime();
        let pos: Cartesian3 | undefined;
        for (let i = 0; i < points.length; i++) {
          if (satellites.length > i && satellites[i].latestECEFPositions.length > 0) {
            points[i].show = true;
            
            pos = getSatellitePosition(i, datetime);
            if (!pos) points[i].show = false; 
            else points[i].position = pos;
          }
          else points[i].show = false;
        }

      }
    );

    const handler = new ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction((click: {position: Cartesian2})=> {
      const picked = viewer.scene.pick(click.position);
      if (picked?.primitive instanceof PointPrimitive) onSelect(picked.id);
    }, ScreenSpaceEventType.LEFT_CLICK);

    return () =>{
      removePreRender();
      handler.destroy();
      if (!viewer.isDestroyed()) viewer.scene.primitives.remove(collection); 
    }

  }, [viewer]);

  useEffect(()=>{
    if (!viewer || selectedSatelliteID == undefined) return;

    const entity = viewer.entities.add({
      id: `selected-${selectedSatelliteID}`,
      name: selectedSatelliteID,
      position: new CallbackPositionProperty(
        (time: JulianDate | undefined, result?: Cartesian3) => {
            return getSatellitePosition(
              selectedSatelliteID, 
              (time?JulianDate.toDate(time):new Date()).getTime(), 
              result
            );
          },
        false
      ),
      point: { pixelSize: 12, color: Color.YELLOW, outlineColor: Color.WHITE, outlineWidth: 2 },
      viewFrom: new Cartesian3(-200_000,100_000,200_000),
    });

    viewer.trackedEntity = entity;

    return () => {
      if (viewer.isDestroyed()) return;
      if (viewer.trackedEntity == entity) viewer.trackedEntity = undefined;
      viewer.entities.remove(entity);
    }
  },[viewer, selectedSatelliteID]);

  return null;
}