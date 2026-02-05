import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  GeoJSON,
  useMap,
} from "react-leaflet";
import * as turf from "@turf/turf";
import { useEffect, useState, memo } from "react";

/** Re-center control component */
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
        className="map-control m-3 px-4 py-2 font-medium text-gray-700 hover:text-gray-900 smooth-transition focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Re-center map to current location"
        title="Re-center map"
      >
        📍 Re-center
      </button>
    </div>
  );
});

function MapView({ location }) {
  const [parcels, setParcels] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentParcel, setCurrentParcel] = useState(null);

  /** Fetch parcels from backend */
  useEffect(() => {
    const controller = new AbortController();
    
    fetch("http://localhost:4000/api/parcels", { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!data?.features?.length) {
          setError("No land parcels available");
        }
        setParcels(data);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setError("Failed to load land parcels. Please check the backend connection.");
          console.error("Failed to load parcels:", err);
        }
        setLoading(false);
      });

    return () => controller.abort();
  }, []);

  /** Point-in-polygon detection to find current parcel */
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

  /** Add interactive popup to each parcel */
  const onEachParcel = (feature, layer) => {
    const { parcelId, owner, status } = feature.properties;
    const html = `
      <div class="p-2">
        <strong class="text-lg block mb-1">${parcelId}</strong>
        <div class="text-sm space-y-1">
          <p><strong>Owner:</strong> ${owner}</p>
          <p><strong>Status:</strong> <span class="inline-block px-2 py-1 rounded text-xs font-medium ${
            status === 'available' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
          }">${status}</span></p>
        </div>
      </div>
    `;
    layer.bindPopup(html);
    layer.on('mouseover', function() { this.openPopup(); });
    layer.on('mouseout', function() { this.closePopup(); });
  };

  /** Style parcels based on whether they're the current location */
  const parcelStyle = (feature) => {
    const isCurrentParcel = currentParcel && 
      feature.properties.parcelId === currentParcel.parcelId;
    
    return {
      color: isCurrentParcel ? "#059669" : "#2563eb",
      weight: isCurrentParcel ? 3 : 2,
      fillOpacity: isCurrentParcel ? 0.6 : 0.3,
      fillColor: isCurrentParcel ? "#10b981" : "#3b82f6",
      dashArray: isCurrentParcel ? "5, 5" : "none",
    };
  };

  return (
    <div className="space-y-4">
      <div className="card overflow-hidden">
        <MapContainer
          center={location ? [location.lat, location.lng] : [22.9734, 78.6569]}
          zoom={16}
          style={{ height: "calc(70vh - 2px)", width: "100%" }}
          className="rounded-lg"
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <RecenterButton location={location} />

          {parcels?.type === "FeatureCollection" && parcels.features?.length > 0 && (
            <GeoJSON
              data={parcels}
              style={parcelStyle}
              onEachFeature={onEachParcel}
            />
          )}

          {location && (
            <Marker position={[location.lat, location.lng]}>
              <Popup>
                <div className="text-center">
                  <p className="font-semibold">📍 Your Location</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Lat: {location.lat.toFixed(4)}, Lng: {location.lng.toFixed(4)}
                  </p>
                </div>
              </Popup>
            </Marker>
          )}

          {loading && (
            <div
              className="map-control absolute top-4 left-4 z-10 px-4 py-3 flex items-center gap-2"
              role="status"
              aria-live="polite"
            >
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <span className="text-sm font-medium text-gray-700">Loading parcels…</span>
            </div>
          )}

          {error && (
            <div
              className="map-control absolute top-4 left-4 z-10 px-4 py-3 max-w-xs bg-red-50 border border-red-200"
              role="alert"
              aria-live="polite"
            >
              <p className="text-sm font-medium text-red-900">Error</p>
              <p className="text-xs text-red-800 mt-1">{error}</p>
            </div>
          )}
        </MapContainer>
      </div>

      {/* Parcel Info Panel */}
      <div className="card p-6">
        {currentParcel ? (
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-xl">🧾</span>
              Current Land Parcel
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Parcel ID
                </p>
                <p className="text-lg font-bold text-gray-900 mt-1">
                  {currentParcel.parcelId}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Owner
                </p>
                <p className="text-lg font-bold text-gray-900 mt-1">
                  {currentParcel.owner}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Status
                </p>
                <div className="mt-1">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                    currentParcel.status === 'available'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {currentParcel.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-3xl mb-3">📍</p>
            <p className="text-gray-600 font-medium">
              You are not inside any registered parcel
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Move to a registered area to see parcel details
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default MapView;
