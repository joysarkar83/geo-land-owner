import { useEffect, useState, createContext } from "react";
import MapView from "./components/MapView";
import Sparkles from "./components/Sparkles";

export const DarkModeContext = createContext();

function App() {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  // Dark mode is now permanent
  const darkMode = true;

  useEffect(() => {
    // Ensure dark class is always present
    document.documentElement.classList.add('dark');
  }, []);

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
    <DarkModeContext.Provider value={{ darkMode }}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex flex-col">
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-green-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">G</div>
                  Land Registry System
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  GPS-based land ownership verification
                </p>
              </div>
              {/* dark mode is permanent; no toggle shown */}
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-4">
        {darkMode && <Sparkles />}
        {error && (
          <div 
            className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3"
            role="alert"
            aria-live="polite"
          >
            <span className="text-2xl flex-shrink-0">⚠️</span>
            <div>
              <h3 className="font-semibold text-red-900 dark:text-red-400">Location Error</h3>
              <p className="text-sm text-red-800 dark:text-red-300 mt-1">{error}</p>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="ml-3 text-gray-600 dark:text-gray-400 font-medium">Getting your location...</p>
          </div>
        )}

        {!loading && (
          <MapView location={location} />
        )}
      </main>

      </div>
    </DarkModeContext.Provider>
  );
}

export default App;
