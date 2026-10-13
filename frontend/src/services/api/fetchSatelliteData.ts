export async function fetchSatelliteData(begin_date?: number): Promise<string> {
  if (!import.meta.env.VITE_BACKEND_URL) throw "Missing VITE_BACKEND_URL!";
  const response = await fetch(
    import.meta.env.VITE_BACKEND_URL + 
    '/latest/satellites/'+
    (begin_date ?
      (begin_date/1000).toString()
      : ""
    )
  );

  if (response.ok) {
    return response.text();
  }
  else {
    return Promise.reject("Fetch error");

  }
}
