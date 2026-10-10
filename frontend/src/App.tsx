import { useEffect, useRef } from "react";
import { Cartesian3, Viewer as CesiumViewer, Color, NearFarScalar } from "cesium";
import { Cesium3DTileset as CesiumTileset } from "cesium";
import {
  Cesium3DTileset,
  Globe,
  Viewer,
  type CesiumComponentRef,
  useCesium,
  Entity,
} from "resium";

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

function App() {
  const ref = useRef<CesiumComponentRef<CesiumViewer>>(null);

  const position = Cartesian3.fromDegrees(
    2.0, // longitude
    51.0, // latitude
    550_000, // altitude: 550 km
  );
  return (
    <div style={styles.mapWrapper}>
      <Viewer full timeline={false} ref={ref}>
        <IonTileset />
        <Entity
        name="Satellite"
        position={position}
        point={{
          pixelSize: 10,
          color: Color.RED,
          outlineColor: Color.WHITE,
          outlineWidth: 2,
          scaleByDistance: new NearFarScalar(
            100_000,   
            2.0,
            10_000_000,
            0.3
          ),
        }}
      />
      </Viewer>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  mapWrapper: {
    width: "100vw",
    height: "100vh",
    backgroundColor: "red",
  },
};

export default App;
