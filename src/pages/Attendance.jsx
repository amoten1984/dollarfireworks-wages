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

  return (
    <div className="min-h-screen p-4 bg-gray-50 text-sm">
      <div className="mb-4">
        <span className="inline-block px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-semibold">
          {determineSeason()}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        <div className="bg-white rounded-xl shadow p-3 text-center">
          <div className="text-xs text-gray-500">Total Hours</div>
          <div className="font-bold text-lg">{totalHours}</div>
        </div>
        <div className="bg-white rounded-xl shadow p-3 text-center">
          <div className="text-xs text-gray-500">Total Days</div>
          <div className="font-bold text-lg">{totalDays}</div>
        </div>
        <div className="bg-white rounded-xl shadow p-3 text-center">
          <div className="text-xs text-gray-500">Total Payment</div>
          <div className="font-bold text-lg">${payment ? payment.total_amount : 0}</div>
        </div>
        <div className="bg-white rounded-xl shadow p-3 text-center">
          <div className="text-xs text-gray-500">Avg $/Hour</div>
          <div className="font-bold text-lg">${avgPerHour}</div>
        </div>
        <div className="bg-white rounded-xl shadow p-3 text-center">
          <div className="text-xs text-gray-500">Avg $/Day</div>
          <div className="font-bold text-lg">${avgPerDay}</div>
        </div>
      </div>

      {/* Attendance records hidden from this summary page */}

      <div className="mt-4">
        <Link to="/locations" className="text-blue-600 hover:underline">
          ← Back to Locations
        </Link>
      </div>
    </div>
  );
}
