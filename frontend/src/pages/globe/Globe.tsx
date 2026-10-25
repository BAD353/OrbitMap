import { useEffect, useRef, useState } from "react";
import {
  Cartesian3,
  Viewer as CesiumViewer,
  Color,
  NearFarScalar,
} from "cesium";
import { Cesium3DTileset as CesiumTileset } from "cesium";
import { Viewer, type CesiumComponentRef, useCesium, Entity } from "resium";
import {
  getSatelliteByID,
  getSatellites,
  launchPropagation,
  propagateSatellites,
} from "../../services";
import { geodeticToCesiumPosition } from "../../util/geodeticToCesiumPosition";
import type { Satellite } from "../../types/satellite/satellite";
import { SatelliteLayer } from "./SatelliteLayer";
import SatelliteSidebar from "./SatelliteSidebar";

function IonTileset() {
  const { viewer } = useCesium();

  useEffect(() => {
    if (!viewer) return;
    let tileset: CesiumTileset | undefined;
    let cancelled = false;

    async function loadTileset() {
      if (!viewer) return;
      try {
        const loaded = await CesiumTileset.fromIonAssetId(3830182);

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

  const selectedSatelliteIDRef = useRef<
    string | undefined
  >(undefined);

  const [selectedSatellite, setSelectedSatellite] = useState<
    Satellite | undefined
  >(undefined);

  // const [satellites, setSatellites] = useState<Satellite[]>([]);

  useEffect(() => {
    launchPropagation(() => {
      if (selectedSatelliteIDRef.current)
        setSelectedSatellite(getSatelliteByID(selectedSatelliteIDRef.current));
    });
  }, []);

  return (
    <div style={styles.mapWrapper}>
      <Viewer full timeline={false} ref={ref}
        resolutionScale={0.75}
        msaaSamples={1}
        >
        <IonTileset />
        <SatelliteLayer
          onSelect={(id: string) => {
            selectedSatelliteIDRef.current = id;
            setSelectedSatellite(getSatelliteByID(id));
          }}
          selectedSatelliteID={selectedSatelliteIDRef.current}
        />
      </Viewer>
      {selectedSatellite && (
        <SatelliteSidebar satellite={selectedSatellite}/>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  mapWrapper: {
    width: "100vw",
    height: "100vh",
  },
  sidebar: {
    position: "fixed",
    right: "10px",
    top: "10px",
    width: "300px",
    height: "400px",
    backgroundColor: "white",
  },
};

export default Globe;
