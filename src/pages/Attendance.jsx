import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";

export default function Attendance() {
  const { staffId } = useParams();
  const navigate = useNavigate();
  const [attendance, setAttendance] = useState([]);
  const [payment, setPayment] = useState(null);
  const [paymentInput, setPaymentInput] = useState("");
  const [helpers, setHelpers] = useState(0);
  const [helpersInput, setHelpersInput] = useState("");
  const [editMode, setEditMode] = useState(false);

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
      setPaymentInput(data.total_amount);
      setHelpers(data.helpers || 0);
      setHelpersInput(data.helpers || "");
    }
  };

  const savePayment = async () => {
    const helpersToSave = helpersInput === "" ? 0 : parseInt(helpersInput, 10);

    console.log({
      staffId,
      season: determineSeason(),
      totalAmount: parseFloat(paymentInput),
      helpers: helpersToSave
    });

    await fetch("/.netlify/functions/addPayment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        staffId,
        season: determineSeason(),
        totalAmount: parseFloat(paymentInput),
        helpers: helpersToSave
      }),
    });
    setEditMode(false);
    fetchPayment();
  };

  const determineSeason = () => {
    if (attendance.length === 0) return "No Season";
    const firstDate = new Date(attendance[0].work_date);
    const year = firstDate.getFullYear();
    const month = firstDate.getMonth();
    if (month === 5 || month === 6) return `July 4th ${year} Season`;
    if (month === 11 || month === 0) return `New Year ${year} Season`;
    return `${year} Season`;
  };

  const totalHours = attendance.reduce((sum, rec) => sum + rec.hours_worked, 0);
  const totalDays = new Set(attendance.map((a) => a.work_date)).size;
  const avgPerHour = payment && totalHours > 0 ? (payment.total_amount / totalHours).toFixed(2) : 0;
  const avgPerDay = payment && totalDays > 0 ? (payment.total_amount / totalDays).toFixed(2) : 0;

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

      {/* Navigation */}
      <div className="flex items-center space-x-4 mb-4">
        <button onClick={() => navigate(-1)} className="hover:text-indigo-600"><ArrowLeft size={20} /></button>
        <Link to="/" className="hover:text-indigo-600"><Home size={20} /></Link>
      </div>

      {/* Summary Box */}
      <div className="relative bg-white rounded-xl shadow-md p-4 mb-6 border">
        <div className="flex justify-between items-start">
          <div>
            <div className="font-bold text-indigo-600 mb-2">{determineSeason()}</div>
            <div>Total Hours: <strong>{totalHours}</strong></div>
            <div>Total Days: <strong>{totalDays}</strong></div>
            <div>Wages Paid: <strong>${payment ? payment.total_amount : 0}</strong></div>
            <div>Helpers: <strong>{helpers}</strong></div>
            <div>Avg $/Hour: <strong>${avgPerHour}</strong></div>
            <div>Avg $/Day: <strong>${avgPerDay}</strong></div>
          </div>

          {/* Edit button */}
          <button 
            onClick={() => setEditMode(!editMode)}
            className="text-xs text-indigo-600 border border-indigo-600 rounded px-2 py-1 hover:bg-indigo-50 transition"
          >
            {editMode ? "Close" : "Edit"}
          </button>
        </div>

        {/* Editable fields */}
        {editMode && (
          <div className="mt-3 flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <label>Wages Paid: </label>
              <input
                type="number"
                value={paymentInput}
                onChange={(e) => setPaymentInput(e.target.value)}
                className="border rounded p-1 w-24 text-right"
              />
            </div>
            <div className="flex items-center space-x-2">
              <label>Helpers: </label>
              <input
                type="number"
                value={helpersInput}
                onChange={(e) => setHelpersInput(e.target.value)}
                className="border rounded p-1 w-24 text-right"
              />
            </div>
            <button
              onClick={savePayment}
              className="px-3 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700"
            >
              Save
            </button>
          </div>
        )}
      </div>

      {/* Attendance Records (only when editing) */}
      {editMode && (
        <>
          <h2 className="font-semibold mb-2 text-gray-700">Attendance Records:</h2>
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
        </>
      )}
    </div>
  );
}
