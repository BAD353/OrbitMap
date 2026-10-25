import type { Satellite } from "../../types/satellite/satellite";

export default function SatelliteSidebar({satellite, onClose}: {satellite: Satellite; onClose: Function}) {
  return (
    <div className="popup-container" style={styles.sidebar}>
      
    <div className="centered-row" style={{gap:"1rem", justifyContent:"space-between"}}>
      <p className="text heading">{satellite.info.name}</p>
      <div style={styles.closeButtonContainer} onClick={() => {onClose();}}>
        <img src="/close.svg" style={styles.closeButton}/>
      </div>
     </div> 
     <p className="text subheading">{satellite.info.country} · NORAD {satellite.noradID}</p>
      
      <div className="divider"/>
      <p className="text subheading">Perigee · {satellite.latestElset?.periapsis}km</p>
      <p className="text subheading">Apogee · {satellite.latestElset?.apoapsis}km</p>
      <p className="text subheading">Semimajor · {satellite.latestElset?.semimajor_axis}km</p>

    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  sidebar: {
    position: "fixed",
    right: "2rem",
    top: "2rem",
    backgroundColor: "var(--panel)",
    minHeight:"400px",
    minWidth:"300px",
  },
  closeButtonContainer: {
    width: "3rem",
    height: "3rem",
  },
  closeButton: {
    width: "3rem",
    height: "3rem",
  }
};