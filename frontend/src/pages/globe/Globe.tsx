import { useEffect, useRef, useState } from "react";
import { Cartesian3, Viewer as CesiumViewer, Color, NearFarScalar } from "cesium";
import { Cesium3DTileset as CesiumTileset } from "cesium";
import {
  Viewer,
  type CesiumComponentRef,
  useCesium,
  Entity,
} from "resium";
import { getSatellites, propagateSatellites } from "../../services";
import { geodeticToCesiumPosition } from "../../util/geodeticToCesiumPosition";
import type { Satellite } from "../../types/satellite/satellite";

function IonTileset() {
  const { viewer } = useCesium();

  useEffect(() => {
    if (!viewer) return;
    let tileset: CesiumTileset | undefined;
    let cancelled = false;

    async function loadTileset() {
      if (!viewer) return;
      try {
        const loaded = await CesiumTileset.fromIonAssetId(2275207);

        if (cancelled) {
          loaded.destroy();
          return;
        }

        tileset = loaded;
        viewer.scene.primitives.add(loaded);
        await viewer.zoomTo(loaded);
      } catch (error) {
        console.error("Failed to load ion tileset:", error);
      }
    }

    loadTileset();

    return () => {
      cancelled = true;
      if (tileset && !tileset.isDestroyed()) {
        viewer.scene.primitives.remove(tileset);
      }
    };
  }, [viewer]);

  return null;
}

function Globe() {
  const ref = useRef<CesiumComponentRef<CesiumViewer>>(null);

  const [satellites, setSatellites] = useState<Satellite[]>([]);

  useEffect(()=>{
    propagateSatellites();
    setSatellites(getSatellites());
  }, []);

  return (
    <div style={styles.mapWrapper}>
      <Viewer full timeline={false} ref={ref}>
        <IonTileset />
        {satellites.map(
          satellite => satellite.latestGeodeticposition === undefined?
          <></>:
          <Entity
            name={satellite.info.name}
            position={geodeticToCesiumPosition(satellite.latestGeodeticposition.pos)}
            point={{
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
            }}
          />
        )}
      </Viewer>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  mapWrapper: {
    width: "100vw",
    height: "100vh",
  },
};

export default Globe;
