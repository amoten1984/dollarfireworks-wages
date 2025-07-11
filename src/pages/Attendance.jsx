import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";

export default function Attendance() {
  const { staffId } = useParams();
  const [season, setSeason] = useState(null);
  const [enteredHours, setEnteredHours] = useState({});

  const julyDates = Array.from({ length: 21 }, (_, i) => {
    const date = new Date(new Date().getFullYear(), 5, 20 + i);
    return date.toISOString().slice(0, 10);
  });

  const newYearDates = [
    ...Array.from({ length: 12 }, (_, i) => {
      const date = new Date(new Date().getFullYear(), 11, 20 + i);
      return date.toISOString().slice(0, 10);
    }),
    ...Array.from({ length: 5 }, (_, i) => {
      const date = new Date(new Date().getFullYear() + 1, 0, 1 + i);
      return date.toISOString().slice(0, 10);
    }),
  ];

  const setHours = (date, hours) => {
    setEnteredHours((prev) => ({ ...prev, [date]: hours }));
  };

  const saveAttendance = async () => {
    const entries = Object.entries(enteredHours);
    for (let [date, hours] of entries) {
      if (!hours) continue;
      await fetch("/.netlify/functions/addAttendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          staffId,
          workDate: date,
          hoursWorked: parseInt(hours, 10),
        }),
      });
    }
    alert("Attendance saved!");
  };

  const datesToShow = season === "july" ? julyDates : season === "newyear" ? newYearDates : [];

  const formatDateWithDay = (dateStr) => {
    const date = new Date(dateStr);
    const options = { year: "numeric", month: "long", day: "numeric" };
    const formattedDate = date.toLocaleDateString(undefined, options);
    const dayOfWeek = date.toLocaleDateString(undefined, { weekday: "long" });
    return `${formattedDate} (${dayOfWeek})`;
  };

  return (
    <div className="min-h-screen p-4 bg-gray-50 text-sm">
      <h1 className="text-xl font-bold mb-4">Add Attendance</h1>

      {!season && (
        <div className="space-x-2">
          <button
            onClick={() => setSeason("july")}
            className="px-3 py-1 bg-blue-500 text-white rounded"
          >
            July 4th Season
          </button>
          <button
            onClick={() => setSeason("newyear")}
            className="px-3 py-1 bg-green-500 text-white rounded"
          >
            New Year’s Season
          </button>
        </div>
      )}

      {season && (
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="border p-1 text-left">Date</th>
                <th className="border p-1 text-left">Hours Worked</th>
              </tr>
            </thead>
            <tbody>
              {datesToShow.map((date) => (
                <tr key={date}>
                  <td className="border p-1">{formatDateWithDay(date)}</td>
                  <td className="border p-1">
                    <input
                      type="number"
                      min="0"
                      className="border rounded p-1 w-20"
                      value={enteredHours[date] || ""}
                      onChange={(e) => setHours(date, e.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            onClick={saveAttendance}
            className="mt-4 px-3 py-1 bg-purple-500 text-white rounded"
          >
            Save Attendance
          </button>
        </div>
      )}

      <div className="mt-4">
        <Link to="/locations" className="text-blue-600 hover:underline">
          ← Back to Locations
        </Link>
      </div>
    </div>
  );
}
