export default function LoadingPage() {
  return <div style={styles.loadingPageWrapper}>Loading...</div>;
}

const styles: Record<string, React.CSSProperties> = {
  loadingPageWrapper: {
    width: "100vw",
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
};
