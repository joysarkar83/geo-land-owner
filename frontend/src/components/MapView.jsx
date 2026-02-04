import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  GeoJSON,
  useMap,
} from "react-leaflet";
import * as turf from "@turf/turf";
import { useEffect, useState } from "react";

/* Re-center control */
function RecenterButton({ location }) {
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
        style={{
          margin: "10px",
          padding: "8px 12px",
          background: "white",
          border: "1px solid #ccc",
          borderRadius: "6px",
          cursor: "pointer",
          boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
        }}
      >
        📍 Re-center
      </button>
    </div>
  );
}

function MapView({ location }) {
  const [parcels, setParcels] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentParcel, setCurrentParcel] = useState(null);

  /* Fetch parcels from backend */
  useEffect(() => {
    fetch("http://localhost:4000/api/parcels")
      .then((res) => res.json())
      .then((data) => {
        console.log("BACKEND PARCELS TYPE:", typeof data);
        console.log("BACKEND PARCELS OBJECT:", data);
        console.log("IS FEATURE COLLECTION:", data?.type);
        console.log("FEATURE COUNT:", data?.features?.length);
        setParcels(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load parcels", err);
        setLoading(false);
      });
  }, []);

  /* Point-in-polygon detection */
  useEffect(() => {
    if (!location || !parcels) return;

    const point = turf.point([location.lng, location.lat]);

    for (let feature of parcels.features) {
      if (turf.booleanPointInPolygon(point, feature)) {
        setCurrentParcel(feature.properties);
        return;
      }
    }

    setCurrentParcel(null);
  }, [location, parcels]);

  const onEachParcel = (feature, layer) => {
    const { parcelId, owner, status } = feature.properties;
    layer.bindPopup(
      `<strong>${parcelId}</strong><br/>
       Owner: ${owner}<br/>
       Status: ${status}`,
    );
  };

  const parcelStyle = (feature) => ({
    color:
      currentParcel && feature.properties.parcelId === currentParcel.parcelId
        ? "green"
        : "blue",
    weight: 2,
    fillOpacity:
      currentParcel && feature.properties.parcelId === currentParcel.parcelId
        ? 0.5
        : 0.3,
  });

  return (
    <>
      <MapContainer
        center={location ? [location.lat, location.lng] : [22.9734, 78.6569]}
        zoom={16}
        style={{ height: "70vh", width: "100%" }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <RecenterButton location={location} />

        {parcels &&
          parcels.type === "FeatureCollection" &&
          parcels.features?.length > 0 && (
            <GeoJSON
              data={parcels}
              style={parcelStyle}
              onEachFeature={onEachParcel}
            />
          )}

        {location && (
          <Marker position={[location.lat, location.lng]}>
            <Popup>You are here</Popup>
          </Marker>
        )}

        {loading && (
          <div
            style={{
              position: "absolute",
              top: "10px",
              left: "10px",
              background: "white",
              padding: "6px 10px",
              borderRadius: "6px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
              fontSize: "14px",
            }}
          >
            Loading land parcels…
          </div>
        )}
      </MapContainer>

      {/* Parcel Info Panel */}
      <div className="mt-4 bg-white border rounded p-4">
        {currentParcel ? (
          <>
            <h3 className="font-semibold text-gray-700 mb-2">
              🧾 Current Land Parcel
            </h3>
            <p>
              <strong>ID:</strong> {currentParcel.parcelId}
            </p>
            <p>
              <strong>Owner:</strong> {currentParcel.owner}
            </p>
            <p>
              <strong>Status:</strong> {currentParcel.status}
            </p>
          </>
        ) : (
          <p className="text-sm text-gray-500">
            You are not inside any registered parcel
          </p>
        )}
      </div>
    </>
  );
}

export default MapView;
