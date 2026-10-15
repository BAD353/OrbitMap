import { useEffect, useRef, useState } from "react";
import { Cartesian3, Viewer as CesiumViewer, Color, NearFarScalar } from "cesium";
import { Cesium3DTileset as CesiumTileset } from "cesium";
import {
  Viewer,
  type CesiumComponentRef,
  useCesium,
  Entity,
} from "resium";
import { getSatellites, launchPropagation, propagateSatellites } from "../../services";
import { geodeticToCesiumPosition } from "../../util/geodeticToCesiumPosition";
import type { Satellite } from "../../types/satellite/satellite";
import { SatelliteLayer } from "./SatelliteLayer";

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
    launchPropagation(()=>{
      // console.log("Setting");
      // const temp = getSatellites();
      const sats = getSatellites();
      setSatellites(sats);
      // console.log(temp[0].latestGeodeticPositions[temp[0].latestGeodeticPositions.length-1].epoch)
    });
  }, []);

  return (
    <div style={styles.mapWrapper}>
      <Viewer full timeline={false} ref={ref}>
        <IonTileset />
        <SatelliteLayer/>
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
