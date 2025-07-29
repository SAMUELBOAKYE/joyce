// src/Location.jsx
import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "./Location.css";
import { koforiduaAreas } from "./koforiduaAreas";
import { useMap } from "./useMap";

// ✅ Fix default Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const Location = () => {
  const koforiduaCoords = [6.0941, -0.2606];
  const { mapRef, mapReady } = useMap();
  const [locationInput, setLocationInput] = useState("");
  const [message, setMessage] = useState("");

  const handleCheck = () => {
    const normalized = locationInput.trim().toLowerCase();
    if (koforiduaAreas.includes(normalized)) {
      setMessage(`✅ We deliver to ${locationInput}`);
    } else {
      setMessage(
        "❌ Sorry, we only deliver within Koforidua and nearby areas."
      );
    }
  };

  return (
    <div className="map-wrapper" style={{ padding: "2rem" }}>
      <h2 className="map-heading">📍 Delivery Location Checker (Koforidua)</h2>

      {/* 🔍 Search and Validation */}
      <div style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="Enter location (e.g., Oyoko)"
          value={locationInput}
          onChange={(e) => setLocationInput(e.target.value)}
          style={{
            padding: "10px",
            fontSize: "16px",
            marginRight: "10px",
            borderRadius: "6px",
          }}
        />
        <button
          onClick={handleCheck}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            background: "#4CAF50",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Check Delivery
        </button>
        <p style={{ marginTop: "1rem", fontWeight: "bold" }}>{message}</p>
      </div>

      {/* 🗺️ Map */}
      <div className="map-container">
        {mapReady && (
          <MapContainer
            center={koforiduaCoords}
            zoom={13}
            scrollWheelZoom={false}
            className="leaflet-map"
            ref={mapRef}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='© <a href="https://osm.org/copyright">OpenStreetMap</a>'
            />
            <Marker position={koforiduaCoords}>
              <Popup>
                🚚 Delivery zone: <strong>Koforidua central</strong>.
              </Popup>
            </Marker>
          </MapContainer>
        )}
      </div>
    </div>
  );
};

export default Location;
