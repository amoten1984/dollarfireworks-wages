import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Locations() {
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    const fetchLocations = async () => {
      const res = await fetch("/.netlify/functions/getLocations");
      const data = await res.json();
      setLocations(data);
    };
    fetchLocations();
  }, []);

  const addLocation = async () => {
    const name = prompt("Enter location name:");
    if (name && name.trim() !== "") {
      const res = await fetch("/.netlify/functions/addLocation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      const data = await res.json();
      setLocations((prev) => [...prev, data]);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Locations</h1>

      <button
        onClick={addLocation}
        className="px-5 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow hover:bg-indigo-700 transition"
      >
        + Add Location
      </button>

      <div className="mt-6 grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {locations.length === 0 ? (
          <div className="text-gray-500 italic">No locations yet.</div>
        ) : (
          locations.map((loc) => (
            <Link
              key={loc.id}
              to={`/locations/${loc.id}/staff`}
              className="block bg-white rounded-xl shadow-md p-4 hover:bg-gray-50 transition cursor-pointer border border-gray-200"
            >
              <div className="text-lg font-semibold text-gray-800">{loc.name}</div>
            </Link>
          ))
        )}
      </div>

      <div className="mt-6">
        <Link to="/" className="text-blue-600 hover:underline">← Back to Home</Link>
      </div>
    </div>
  );
}
