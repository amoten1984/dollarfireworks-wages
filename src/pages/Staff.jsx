import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

export default function Staff() {
  const { locationId } = useParams();
  const [staff, setStaff] = useState([]);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const res = await fetch(`/.netlify/functions/getStaff?locationId=${locationId}`);
        const data = await res.json();
        setStaff(data);
      } catch (err) {
        console.error("Error fetching staff:", err);
      }
    };

    fetchStaff();
  }, [locationId]);

  const addStaff = async () => {
    const name = prompt("Enter staff name:");
    if (name && name.trim() !== "") {
      try {
        const res = await fetch("/.netlify/functions/addStaff", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: name.trim(), locationId }),
        });
        const data = await res.json();
        setStaff((prev) => [...prev, data]);
      } catch (err) {
        console.error("Error adding staff:", err);
      }
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <h1 className="text-3xl font-bold mb-6">Staff for Location</h1>
      <button
        onClick={addStaff}
        className="px-6 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition"
      >
        + Add Staff
      </button>
      <div className="mt-6">
        {staff.length === 0 ? (
          <div className="text-gray-600 italic">No staff yet.</div>
        ) : (
          <ul className="space-y-2">
            {staff.map((s) => (
              <Link key={s.id} to={`/locations/${locationId}/staff/${s.id}/attendance`}>
                <li className="p-4 rounded-lg shadow border cursor-pointer hover:bg-gray-100">
                  {s.name}
                </li>
              </Link>
            ))}
          </ul>
        )}
      </div>
      <div className="mt-4">
        <Link to="/locations" className="text-blue-600 hover:underline">
          ← Back to Locations
        </Link>
      </div>
    </div>
  );
}
