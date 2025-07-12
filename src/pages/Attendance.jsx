import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

export default function Attendance() {
  const { staffId } = useParams();
  const [attendance, setAttendance] = useState([]);
  const [payment, setPayment] = useState(null);

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
    if (data) {
      setPayment(data);
    }
  };

  const addAttendance = async () => {
    const date = prompt("Enter work date (YYYY-MM-DD):");
    const hours = prompt("Enter hours worked:");
    if (date && hours) {
      await fetch("/.netlify/functions/addAttendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          staffId,
          workDate: date,
          hoursWorked: parseInt(hours, 10),
        }),
      });
      fetchAttendance();
    }
  };

  const recordPayment = async () => {
    const amount = prompt("Enter total payment amount:");
    const season = determineSeason();
    if (amount && season) {
      await fetch("/.netlify/functions/addPayment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          staffId,
          season,
          totalAmount: parseFloat(amount),
        }),
      });
      fetchPayment();
    }
  };

  const totalHours = attendance.reduce((sum, rec) => sum + rec.hours_worked, 0);
  const totalDays = new Set(attendance.map((a) => a.work_date)).size;
  const season = determineSeason();
  const avgPerHour = payment && totalHours > 0 ? (payment.total_amount / totalHours).toFixed(2) : 0;
  const avgPerDay = payment && totalDays > 0 ? (payment.total_amount / totalDays).toFixed(2) : 0;

  function determineSeason() {
    if (attendance.length === 0) return "None";
    const firstDate = new Date(attendance[0].work_date);
    const month = firstDate.getMonth();
    if (month === 5 || month === 6) return `July 4th ${firstDate.getFullYear()}`;
    if (month === 11 || month === 0) return `New Year ${firstDate.getFullYear()}`;
    return `${firstDate.getFullYear()}`;
  }

  return (
    <div className="min-h-screen p-4 bg-gray-50 text-sm">
      <h1 className="text-2xl font-bold mb-4">Attendance & Summary</h1>

      <div className="space-x-2 mb-4">
        <button
          onClick={addAttendance}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          + Add Attendance
        </button>
        <button
          onClick={recordPayment}
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          💵 Record Payment
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-md p-4">
          <h2 className="font-semibold text-gray-700 mb-2">Summary</h2>
          <div>Total hours worked: <strong>{totalHours}</strong></div>
          <div>Total days worked: <strong>{totalDays}</strong></div>
          <div>Total payment: <strong>${payment ? payment.total_amount : 0}</strong></div>
          <div>Season: <strong>{payment ? payment.season : season}</strong></div>
          <div>Average pay/hour: <strong>${avgPerHour}</strong></div>
          <div>Average pay/day: <strong>${avgPerDay}</strong></div>
        </div>
      </div>

      <h2 className="font-semibold mb-2">Attendance Records:</h2>
      {attendance.length === 0 ? (
        <div className="italic text-gray-500">No attendance yet.</div>
      ) : (
        <ul className="space-y-1">
          {attendance.map((a) => (
            <li key={a.id} className="border p-2 rounded bg-white shadow-sm">
              {a.work_date} — {a.hours_worked} hours
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4">
        <Link to="/locations" className="text-blue-600 hover:underline">
          ← Back to Locations
        </Link>
      </div>
    </div>
  );
}
