import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

export default function Attendance() {
  const { staffId } = useParams();
  const [attendance, setAttendance] = useState([]);
  const [payment, setPayment] = useState(null);
  const [showAttendance, setShowAttendance] = useState(false);

  useEffect(() => {
    fetchAttendance();
    fetchPayment();
  }, [staffId]);

  const fetchAttendance = async () => {
    const res = await fetch(`/.netlify/functions/getAttendance?staffId=${staffId}`);
    const data = await res.json();
    setAttendance(data);
  };

  const fetchPayment = async () => {
    const res = await fetch(`/.netlify/functions/getPayment?staffId=${staffId}`);
    const data = await res.json();
    if (data) setPayment(data);
  };

  const totalHours = attendance.reduce((sum, rec) => sum + rec.hours_worked, 0);
  const totalDays = new Set(attendance.map((a) => a.work_date)).size;
  const avgPerHour = payment && totalHours > 0 ? (payment.total_amount / totalHours).toFixed(2) : 0;
  const avgPerDay = payment && totalDays > 0 ? (payment.total_amount / totalDays).toFixed(2) : 0;

  const determineSeason = () => {
    if (attendance.length === 0) return "No Season";
    const firstDate = new Date(attendance[0].work_date);
    const year = firstDate.getFullYear();
    const month = firstDate.getMonth();
    if (month === 5 || month === 6) return `July 4th ${year} Season`;
    if (month === 11 || month === 0) return `New Year ${year} Season`;
    return `${year} Season`;
  };

  const formatDateWithDay = (dateStr) => {
    const date = new Date(dateStr);
    const options = { year: "numeric", month: "long", day: "numeric" };
    const formattedDate = date.toLocaleDateString(undefined, options);
    const dayOfWeek = date.toLocaleDateString(undefined, { weekday: "long" });
    return `${formattedDate} (${dayOfWeek})`;
  };

  const updateHours = async (id, hours) => {
    await fetch("/.netlify/functions/updateAttendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, hoursWorked: hours }),
    });
    fetchAttendance();
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100 text-sm">
      {/* Breadcrumb */}
      <div className="mb-4 space-x-4">
        <Link to="/" className="text-blue-600 hover:underline">← Back to Home</Link>
        <Link to="/locations" className="text-blue-600 hover:underline">← Back to Locations</Link>
      </div>

      {/* Single summary card */}
      <div
        className="cursor-pointer bg-white rounded-xl shadow-md p-4 mb-6 border hover:bg-gray-50 transition"
        onClick={() => setShowAttendance(!showAttendance)}
      >
        <div className="font-bold text-indigo-600 mb-2">{determineSeason()}</div>
        <div className="space-y-1 text-gray-800">
          <div>Total Hours: <strong>{totalHours}</strong></div>
          <div>Total Days: <strong>{totalDays}</strong></div>
          <div>Total Payment: <strong>${payment ? payment.total_amount : 0}</strong></div>
          <div>Avg $/Hour: <strong>${avgPerHour}</strong></div>
          <div>Avg $/Day: <strong>${avgPerDay}</strong></div>
        </div>
      </div>

      {/* Attendance table (only when expanded) */}
      {showAttendance && (
        <>
          <h2 className="font-semibold mb-2 text-gray-700">Attendance Records:</h2>
          {attendance.length === 0 ? (
            <div className="italic text-gray-500">No attendance yet.</div>
          ) : (
            <ul className="space-y-1">
              {attendance.map((a) => (
                <li key={a.id} className="border p-2 rounded bg-white shadow-sm flex justify-between items-center">
                  <span>{formatDateWithDay(a.work_date)}</span>
                  <input
                    type="number"
                    min="0"
                    value={a.hours_worked}
                    onChange={(e) => updateHours(a.id, parseInt(e.target.value, 10))}
                    className="border rounded p-1 w-20 text-right"
                  />
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
