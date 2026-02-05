import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  GeoJSON,
  useMap,
} from "react-leaflet";
import * as turf from "@turf/turf";
import { useEffect, useState, memo, useContext } from "react";
import L from "leaflet";
import { DarkModeContext } from "../App";

/* ------------------ ICONS ------------------ */

const createCustomMarkerIcon = () => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%233b82f6" width="38" height="38"><path d="M12 2C7.03 2 3 6.03 3 11c0 5.25 7.5 11 9 11s9-5.75 9-11c0-4.97-4.03-9-9-9zm0 12.5a3.5 3.5 0 110-7 3.5 3.5 0 010 7z"/></svg>`;
  const blob = new Blob([svg], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);

  return L.icon({
    iconUrl: url,
    iconSize: [38, 38],
    iconAnchor: [19, 36],
    popupAnchor: [0, -34],
  });
};

const createPulsingIcon = (color = "#3b82f6") => {
  const html = `<span class="pulse-marker" style="--pulse-color:${color};"></span>`;

  return L.divIcon({
    className: "pulse-marker-container",
    html,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });
};

/* ------------------ RECENTER BUTTON ------------------ */

const RecenterButton = memo(function RecenterButton({ location }) {
  const map = useMap();

  if (!location) return null;

  return (
    <div
      className="leaflet-top leaflet-right"
      style={{ pointerEvents: "auto" }}
    >
      <button
        onClick={() =>
          map.setView([location.lat, location.lng], 17, { animate: true })
        }
        className="m-3 p-3 bg-white dark:bg-gray-700 rounded-full shadow-lg hover:shadow-xl"
        aria-label="Re-center map"
      >
        📍
      </button>
    </div>
  );
});

/* ------------------ MAIN ------------------ */

function MapView({ location }) {
  const { darkMode } = useContext(DarkModeContext);

  const [parcels, setParcels] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentParcel, setCurrentParcel] = useState(null);

  const [markerIcon] = useState(createCustomMarkerIcon());
  const [pulseIcon] = useState(createPulsingIcon());

  /* ------------------ FETCH PARCELS ------------------ */

  useEffect(() => {
    const controller = new AbortController();

    fetch("http://localhost:4000/api/parcels", {
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setParcels(data);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.error(err);
          setError("Failed to load land parcels.");
        }
        setLoading(false);
      });

    return () => controller.abort();
  }, []);

  /* ------------------ POINT IN POLYGON ------------------ */

  useEffect(() => {
    if (!location || !parcels?.features) return;

    const point = turf.point([location.lng, location.lat]);

    for (const feature of parcels.features) {
      if (turf.booleanPointInPolygon(point, feature)) {
        setCurrentParcel(feature.properties);
        return;
      }
    }

    setCurrentParcel(null);
  }, [location, parcels]);

  /* ------------------ PARCEL INTERACTION ------------------ */

  const onEachParcel = (feature, layer) => {
    const { parcelId, owner, status } = feature.properties;

    layer.bindPopup(`
      <strong>${parcelId}</strong><br/>
      Owner: ${owner}<br/>
      Status: ${status}
    `);
  };

  const parcelStyle = (feature) => {
    const active =
      currentParcel &&
      feature.properties.parcelId === currentParcel.parcelId;

    return {
      color: active ? "#059669" : "#2563eb",
      weight: active ? 3 : 2,
      fillOpacity: active ? 0.55 : 0.3,
      fillColor: active ? "#10b981" : "#3b82f6",
      dashArray: active ? "6 6" : null,
    };
  };

  /* ------------------ LAYOUT ------------------ */

  return (
    <div className="flex gap-4 w-full h-screen overflow-hidden p-4">
      {/* MAP */}
      <div className="card flex-[7] h-full overflow-hidden">
        <MapContainer
          center={
            location
              ? [location.lat, location.lng]
              : [22.9734, 78.6569]
          }
          zoom={16}
          style={{ height: "100%", width: "100%" }}
          className="rounded-lg"
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <RecenterButton location={location} />

          {parcels && (
            <GeoJSON
              data={parcels}
              style={parcelStyle}
              onEachFeature={onEachParcel}
            />
          )}

          {/* CURRENT LOCATION */}
          {location && (
            <>
              {/* Pulse */}
              <Marker
                position={[location.lat, location.lng]}
                icon={pulseIcon}
                interactive={false}
              />

              {/* Pin */}
              <Marker
                position={[location.lat, location.lng]}
                icon={markerIcon}
              >
                <Popup>
                  <strong>📍 Your Location</strong>
                  <br />
                  {location.lat.toFixed(4)},{" "}
                  {location.lng.toFixed(4)}
                </Popup>
              </Marker>
            </>
          )}

          {loading && (
            <div className="absolute top-4 left-4 z-[1000] bg-white px-3 py-2 rounded shadow">
              Loading parcels…
            </div>
          )}

          {error && (
            <div className="absolute top-4 left-4 z-[1000] bg-red-100 text-red-800 px-3 py-2 rounded shadow">
              {error}
            </div>
          )}
        </MapContainer>
      </div>

      {/* INFO PANEL */}
      <div className="card flex-[3] h-full overflow-y-auto p-6">
        {currentParcel ? (
          <>
            <h3 className="text-lg font-bold mb-4">
              🧾 Current Parcel
            </h3>

            <div className="space-y-4">
              <div>
                <p className="text-xs uppercase text-gray-500">
                  Parcel ID
                </p>
                <p className="font-semibold">
                  {currentParcel.parcelId}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase text-gray-500">
                  Owner
                </p>
                <p className="font-semibold">
                  {currentParcel.owner}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase text-gray-500">
                  Status
                </p>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    currentParcel.status === "available"
                      ? "bg-green-200 text-green-900"
                      : "bg-yellow-200 text-yellow-900"
                  }`}
                >
                  {currentParcel.status}
                </span>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center mt-12">
            <p className="text-3xl">📍</p>
            <p className="font-medium">
              You are not inside any registered parcel
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default MapView;
