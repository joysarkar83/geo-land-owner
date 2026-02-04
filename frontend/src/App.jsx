import { useEffect, useState } from "react";
import MapView from "./components/MapView";

function App() {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      () => setError("Location permission denied")
    );
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b px-6 py-4">
        <h1 className="text-xl font-semibold text-gray-800">
          🗺 Land Registry System
        </h1>
        <p className="text-sm text-gray-500">
          GPS-based land ownership verification
        </p>
      </header>

      <main className="p-4">
        {error && (
          <p className="text-red-600 text-sm mb-2">{error}</p>
        )}

        <MapView location={location} />
      </main>
    </div>
  );
}

export default App;
