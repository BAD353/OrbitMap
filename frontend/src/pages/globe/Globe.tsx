import { useEffect, useRef, useState } from "react";
import {
  Viewer as CesiumViewer,
  ImageryLayer,
  IonImageryProvider,
} from "cesium";
import { Cesium3DTileset as CesiumTileset } from "cesium";
import { Viewer, type CesiumComponentRef, useCesium } from "resium";
import {
  getSatelliteByID,
  launchPropagation,
} from "../../services";
import type { Satellite } from "../../types/satellite/satellite";
import { SatelliteLayer } from "./SatelliteLayer";
import SatelliteSidebar from "./SatelliteSidebar";

const MAX_ZOOM_DISTANCE: number = 1000_000_000;
const MIN_ZOOM_DISTANCE: number = 100_000;

const MIN_TRACKING_ZOOM_DISTANCE: number = 70_000;

function IonTileset({isSatelliteTracked}:{isSatelliteTracked: boolean}) {
  const { viewer } = useCesium();

  useEffect(()=>{
    if (!viewer) return;
    if (isSatelliteTracked) {
      // viewer.scene.screenSpaceCameraController.minimumZoomDistance = MIN_TRACKING_ZOOM_DISTANCE;
    } else { 
      // viewer.scene.screenSpaceCameraController.minimumZoomDistance = MIN_ZOOM_DISTANCE;
    }
  },[isSatelliteTracked]);

  useEffect(() => {
    if (!viewer) return;
    let dayLayer: ImageryLayer;
    let nightLayer: ImageryLayer;
    let cancelled = false;

    viewer.scene.debugShowFramesPerSecond = true;

    viewer.scene.globe.enableLighting = true;
    
    viewer.scene.screenSpaceCameraController.enableTranslate = false;
    viewer.scene.screenSpaceCameraController.enableTilt = false;
    viewer.scene.screenSpaceCameraController.maximumZoomDistance = MAX_ZOOM_DISTANCE;
    viewer.scene.screenSpaceCameraController.minimumZoomDistance = MIN_ZOOM_DISTANCE;

    async function loadTileset() {
      if (!viewer) return;
      try {
        if (cancelled) {
          dayLayer.destroy();
          nightLayer.destroy();
          return;
        }

        const layers = viewer.imageryLayers;
        layers.removeAll(); //base layer

        dayLayer = ImageryLayer.fromProviderAsync(
          IonImageryProvider.fromAssetId(
            3830182
          )
        );
        dayLayer.dayAlpha = 1.0;
        dayLayer.nightAlpha = 0.0;

        nightLayer = ImageryLayer.fromProviderAsync(
          IonImageryProvider.fromAssetId(
            3812
          )
        );
        nightLayer.dayAlpha = 0.0;
        nightLayer.nightAlpha = 1.0;
        nightLayer.brightness = 2.0;

        layers.add(dayLayer);
        layers.add(nightLayer);

        await viewer.zoomTo(dayLayer);
      } catch (error) {
        console.error("Failed to load ion tileset:", error);
      }
    }

    loadTileset();

    return () => {
      cancelled = true;
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
        <IonTileset isSatelliteTracked={selectedSatellite !== undefined} />
        <SatelliteLayer
          onSelect={(id: string) => {
            selectedSatelliteIDRef.current = id;
            setSelectedSatellite(getSatelliteByID(id));
          }}
          selectedSatelliteID={selectedSatelliteIDRef.current}
        />
      </Viewer>
      {selectedSatellite && (
        <SatelliteSidebar satellite={selectedSatellite} onClose={()=>{
          selectedSatelliteIDRef.current = undefined;
          setSelectedSatellite(undefined);
        }}/>
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
