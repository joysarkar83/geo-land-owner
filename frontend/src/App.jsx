import { useEffect, useState } from "react";
import MapView from "./components/MapView";

function App() {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setLoading(false);
      },
      (err) => {
        const errorMessages = {
          1: "Location permission denied. Please enable location access.",
          2: "Unable to retrieve your location.",
          3: "Location request timed out.",
        };
        setError(errorMessages[err.code] || "Failed to get location");
        setLoading(false);
      }
    );
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
                <span className="text-2xl">🗺️</span>
                Land Registry System
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                GPS-based land ownership verification
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto w-full">
        {error && (
          <div 
            className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3"
            role="alert"
            aria-live="polite"
          >
            <span className="text-2xl flex-shrink-0">⚠️</span>
            <div>
              <h3 className="font-semibold text-red-900">Location Error</h3>
              <p className="text-sm text-red-800 mt-1">{error}</p>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="ml-3 text-gray-600 font-medium">Getting your location...</p>
          </div>
        )}

        {!loading && (
          <MapView location={location} />
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-xs text-gray-500 text-center">
            Data sourced from OpenStreetMap • 
            <span className="ml-1">Powered by Leaflet & React</span>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
