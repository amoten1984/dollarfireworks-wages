import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";
import { generateWageStatement } from "../utils/generateWageStatement";

export default function Attendance() {
  const { staffId } = useParams();
  const navigate = useNavigate();
  const [attendance, setAttendance] = useState([]);
  const [payment, setPayment] = useState(null);
  const [staffInfo, setStaffInfo] = useState({});
  const [paymentInput, setPaymentInput] = useState("");
  const [helpers, setHelpers] = useState(0);
  const [helpersInput, setHelpersInput] = useState("");
  const [editMode, setEditMode] = useState(false);

  const [workDate, setWorkDate] = useState("");
  const [hoursWorked, setHoursWorked] = useState("");

  useEffect(() => {
    fetchAttendance();
    fetchPayment();
    fetchStaff();
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
      setPaymentInput(data.total_payment);
      setHelpers(data.helpers || 0);
      setHelpersInput(data.helpers || "");
    }
  };

  const fetchStaff = async () => {
    const res = await fetch(`/.netlify/functions/getStaff?staffId=${staffId}`);
    const data = await res.json();
    setStaffInfo(data);
  };

  const savePayment = async () => {
    await fetch("/.netlify/functions/addPayment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        staffId,
        season: determineSeason(),
        totalAmount: parseFloat(paymentInput),
        helpers: parseInt(helpersInput, 10) || 0
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
  const avgPerHour = payment && totalHours > 0 ? (payment.total_payment / totalHours).toFixed(2) : 0;
  const avgPerDay = payment && totalDays > 0 ? (payment.total_payment / totalDays).toFixed(2) : 0;

  const periodStart = attendance.length ? new Date(attendance[0].work_date).toLocaleDateString() : "";
  const periodEnd = attendance.length ? new Date(attendance[attendance.length - 1].work_date).toLocaleDateString() : "";

  const exportPDF = () => {
    const employee = staffInfo.name || "Unknown Employee";
    const location = staffInfo.location_name || "Unknown Location";
    const wagesPaid = payment?.total_payment || 0;
    const ratePerHour = totalHours > 0 ? (wagesPaid / totalHours).toFixed(2) : 0;

    generateWageStatement({
      employeeName: employee,
      location,
      ratePerHour,
      totalHours,
      wagesPaid,
      periodStart,
      periodEnd,
      paymentDate: new Date().toLocaleDateString(),
      attendanceRecords: attendance.map((a) => ({
        date: new Date(a.work_date).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric", weekday: "long" }),
        hours: a.hours_worked
      }))
    });
  };

  const handleAddAttendance = async () => {
    if (!workDate || !hoursWorked) {
      alert("Please enter both date and hours.");
      return;
    }

    await fetch("/.netlify/functions/addAttendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        staffId,
        workDate,
        hoursWorked: parseInt(hoursWorked, 10)
      }),
    });

    setWorkDate("");
    setHoursWorked("");
    fetchAttendance();
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100 text-sm">
      <div className="flex items-center space-x-4 mb-4">
        <button onClick={() => navigate(-1)} className="hover:text-indigo-600"><ArrowLeft size={20} /></button>
        <Link to="/" className="hover:text-indigo-600"><Home size={20} /></Link>
      </div>

      <div className="relative bg-white rounded-xl shadow-md p-4 mb-6 border">
        <div className="flex justify-between items-start">
          <div>
            <div className="font-bold text-indigo-600 mb-2">{determineSeason()}</div>
            <div>Total Hours: <strong>{totalHours}</strong></div>
            <div>Total Days: <strong>{totalDays}</strong></div>
            <div>Wages Paid: <strong>${payment ? payment.total_payment : 0}</strong></div>
            <div>Helpers: <strong>{helpers}</strong></div>
            <div>Avg $/Hour: <strong>${avgPerHour}</strong></div>
            <div>Avg $/Day: <strong>${avgPerDay}</strong></div>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <button 
              onClick={() => setEditMode(!editMode)}
              className="text-xs text-indigo-600 border border-indigo-600 rounded px-2 py-1 hover:bg-indigo-50 transition"
            >
              {editMode ? "Close" : "Edit"}
            </button>
            <button
              onClick={exportPDF}
              className="text-xs text-green-600 border border-green-600 rounded px-2 py-1 hover:bg-green-50 transition"
            >
              Export Statement
            </button>
          </div>
        </div>

        {editMode && (
          <div className="mt-3 flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <label>Wages Paid:</label>
              <input
                type="number"
                value={paymentInput}
                onChange={(e) => setPaymentInput(e.target.value)}
                className="border rounded p-1 w-24 text-right"
              />
            </div>
            <div className="flex items-center space-x-2">
              <label>Helpers:</label>
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

        {/* Add Attendance form */}
        <div className="mt-4 p-4 border rounded bg-white shadow-sm">
          <h4 className="font-bold mb-2">Add Attendance</h4>
          <div className="flex flex-col space-y-2">
            <label>
              Date:
              <input type="date" value={workDate} onChange={(e) => setWorkDate(e.target.value)} className="border p-1 rounded ml-2" />
            </label>
            <label>
              Hours Worked:
              <input type="number" value={hoursWorked} onChange={(e) => setHoursWorked(e.target.value)} className="border p-1 rounded ml-2 w-20" />
            </label>
            <button
              onClick={handleAddAttendance}
              className="mt-2 px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700"
            >
              Save Attendance
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
