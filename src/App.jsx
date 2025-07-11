
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useParams } from "react-router-dom";
import Staff from "./pages/Staff";
import Attendance from "./pages/Attendance";

function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <Link to="/locations">
        <div className="p-12 rounded-3xl shadow-lg bg-blue-600 hover:bg-blue-700 transition text-white text-4xl font-bold flex items-center space-x-4">
          <span className="text-5xl">💸</span>
          <span>Wages</span>
        </div>
      </Link>
    </div>
  );
}

function Locations() {
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await fetch("/.netlify/functions/getLocations");
        const data = await res.json();
        setLocations(data);
      } catch (err) {
        console.error("Error fetching locations:", err);
      }
    };

    fetchLocations();
  }, []);

  const addLocation = async () => {
    const name = prompt("Enter location name:");
    if (name && name.trim() !== "") {
      try {
        const res = await fetch("/.netlify/functions/addLocation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: name.trim() }),
        });
        const data = await res.json();
        setLocations((prev) => [...prev, data]);
      } catch (err) {
        console.error("Error adding location:", err);
      }
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <h1 className="text-3xl font-bold mb-6">Locations</h1>
      <button
        onClick={addLocation}
        className="px-6 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition"
      >
        + Add Location
      </button>
      <div className="mt-6">
        {locations.length === 0 ? (
          <div className="text-gray-600 italic">No locations yet.</div>
        ) : (
          <ul className="space-y-2">
            {locations.map((loc) => (
              <Link key={loc.id} to={`/locations/${loc.id}/staff`}>
                <li className="p-4 rounded-lg shadow border cursor-pointer hover:bg-gray-100">
                  {loc.name}
                </li>
              </Link>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/locations" element={<Locations />} />
        <Route path="/locations/:locationId/staff" element={<Staff />} />
        <Route path="/locations/:locationId/staff/:staffId/attendance" element={<Attendance />} />
      </Routes>
    </Router>
  );
}

export default App;
