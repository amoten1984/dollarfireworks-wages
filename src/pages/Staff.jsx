import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

export default function Staff() {
  const { locationId } = useParams();
  const [staff, setStaff] = useState([]);
  const [summaries, setSummaries] = useState({});

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const res = await fetch(`/.netlify/functions/getStaff?locationId=${locationId}`);
        const data = await res.json();
        setStaff(data);

        // Fetch summary for each staff
        const newSummaries = {};
        for (const s of data) {
          const attRes = await fetch(`/.netlify/functions/getAttendance?staffId=${s.id}`);
          const attData = await attRes.json();
          const totalHours = attData.reduce((sum, rec) => sum + rec.hours_worked, 0);
          const uniqueSeasons = [...new Set(attData.map(a => new Date(a.work_date).getFullYear()))];

          const payRes = await fetch(`/.netlify/functions/getPayment?staffId=${s.id}`);
          const payData = await payRes.json();

          newSummaries[s.id] = {
            hours: totalHours,
            payment: payData ? payData.total_amount : 0,
            season: payData ? payData.season : 'None'
          };
        }
        setSummaries(newSummaries);

      } catch (err) {
        console.error("Error fetching staff or summary:", err);
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

      <div className="mt-6 space-y-4">
        {staff.length === 0 ? (
          <div className="text-gray-600 italic">No staff yet.</div>
        ) : (
          staff.map((s) => (
            <div
              key={s.id}
              className="p-4 rounded-lg shadow border bg-white hover:bg-gray-100 transition"
            >
              <Link to={`/locations/${locationId}/staff/${s.id}/attendance`}>
                <div className="text-lg font-semibold">{s.name}</div>
              </Link>
              {summaries[s.id] && (
                <div className="mt-2 rounded-xl bg-gray-50 shadow-md p-3 text-sm space-y-1">
                  <div><span className="font-medium text-gray-700">Total hours:</span> {summaries[s.id].hours}</div>
                  <div><span className="font-medium text-gray-700">Total payment:</span> ${summaries[s.id].payment}</div>
                  <div><span className="font-medium text-gray-700">Season:</span> {summaries[s.id].season}</div>
                </div>
              )}
            </div>
          ))
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
