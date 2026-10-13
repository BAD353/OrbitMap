import { useEffect, useState } from "react";
import Globe from "./pages/globe/Globe";
import LoadingPage from "./pages/loading/loadingPage";
import { loadLocalData } from "./services";

function App() {
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    loadLocalData().finally(() => {
      setLoading(false);
    });
  }, []);

  if (isLoading) return <LoadingPage />;
  else return <Globe />;
}

const styles: Record<string, React.CSSProperties> = {};

export default App;
