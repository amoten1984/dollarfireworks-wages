import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

export default function Staff() {
  const { locationId } = useParams();
  const [staff, setStaff] = useState([]);

  useEffect(() => {
    const fetchStaff = async () => {
      const res = await fetch(`/.netlify/functions/getStaff?locationId=${locationId}`);
      const data = await res.json();
      setStaff(data);
    };
    fetchStaff();
  }, [locationId]);

  const addStaff = async () => {
    const name = prompt("Enter staff name:");
    if (name && name.trim() !== "") {
      const res = await fetch("/.netlify/functions/addStaff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), locationId }),
      });
      const data = await res.json();
      setStaff((prev) => [...prev, data]);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Staff for Location</h1>

      <button
        onClick={addStaff}
        className="px-5 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow hover:bg-indigo-700 transition"
      >
        + Add Staff
      </button>

      <div className="mt-6 grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {staff.length === 0 ? (
          <div className="text-gray-500 italic">No staff yet.</div>
        ) : (
          staff.map((s) => (
            <Link
              key={s.id}
              to={`/locations/${locationId}/staff/${s.id}/attendance`}
              className="block bg-white rounded-xl shadow-md p-4 hover:bg-gray-50 transition cursor-pointer border border-gray-200"
            >
              <div className="text-lg font-semibold text-gray-800 capitalize">{s.name}</div>
            </Link>
          ))
        )}
      </div>

      <div className="mt-6 space-x-4">
        <Link to="/" className="text-blue-600 hover:underline">← Back to Home</Link>
        <Link to="/locations" className="text-blue-600 hover:underline">← Back to Locations</Link>
      </div>
    </div>
  );
}
