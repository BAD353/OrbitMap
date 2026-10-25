import type { Satellite } from "../../types/satellite/satellite";

export default function SatelliteSidebar({satellite}: {satellite: Satellite}) {
  return (
    <div className="popup-container" style={styles.sidebar}>
      <p className="text heading">{satellite.info.name}</p>
      <p className="text subheading">{satellite.info.country} · NORAD {satellite.noradID}</p>
      
      <div className="divider"/>

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
};