import { useEffect, useRef, useState } from "react";

export const useMap = () => {
  const mapRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (!mapRef.current && !mapReady) {
      setMapReady(true);
    }
  }, [mapReady]);

  return { mapRef, mapReady };
};
