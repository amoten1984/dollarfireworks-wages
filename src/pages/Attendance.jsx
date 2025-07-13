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
  const [helpersInput, setHelpersInput] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState("");
  const [newAttendance, setNewAttendance] = useState([{ date: "", hours: 0 }]);

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
        season: selectedSeason || determineSeason(),
        totalAmount: parseFloat(paymentInput),
        helpers: parseInt(helpersInput, 10) || 0
      }),
    });
  };

  const handleSaveAll = async () => {
    await fetch("/.netlify/functions/updateAttendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        staffId,
        attendance: attendance.map(a => ({ date: a.work_date, hours: a.hours_worked }))
      })
    });
    await savePayment();
    setEditMode(false);
    fetchAttendance();
  };

const handleSaveMissingAttendance = async () => {
  if (!selectedSeason || newAttendance.length === 0) {
    alert("Please select a season and add at least one attendance record.");
    return;
  }

  const payload = {
    staffId,
    season: selectedSeason,
    records: newAttendance.filter(a => a.date && a.hours > 0)
  };

  await fetch("/.netlify/functions/updatePaymentSeasonAndAttendance", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  await savePayment();
  setEditMode(false);
  setNewAttendance([{ date: "", hours: 0 }]);
  setSelectedSeason("");
  fetchAttendance();
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
      attendanceRecords: attendance.map((a) => ({
        date: new Date(a.work_date).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric", weekday: "long" }),
        hours: a.hours_worked
      }))
    });
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
            <div>Helpers: <strong>{payment ? payment.helpers : 0}</strong></div>
            <div>Avg $/Hour: <strong>${avgPerHour}</strong></div>
            <div>Avg $/Day: <strong>${avgPerDay}</strong></div>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <button onClick={() => setEditMode(!editMode)} className="text-xs text-indigo-600 border border-indigo-600 rounded px-2 py-1 hover:bg-indigo-50 transition">{editMode ? "Close" : "Edit"}</button>
            <button onClick={exportPDF} className="text-xs text-green-600 border border-green-600 rounded px-2 py-1 hover:bg-green-50 transition">Export Statement</button>
          </div>
        </div>

        {editMode && attendance.length > 0 && (
          <div className="mt-4 p-4 border rounded bg-white shadow-sm space-y-3">
            <h4 className="font-bold mb-2">Edit Attendance Records</h4>
            {attendance.map((rec, idx) => (
              <div key={idx} className="flex items-center space-x-2 text-sm">
                <span className="w-40">{new Date(rec.work_date).toLocaleDateString()}</span>
                <input
                  type="number"
                  value={rec.hours_worked}
                  onChange={(e) => {
                    const updated = [...attendance];
                    updated[idx].hours_worked = parseInt(e.target.value, 10) || 0;
                    setAttendance(updated);
                  }}
                  className="border rounded p-1 w-20 text-right"
                />
                <span>hours</span>
              </div>
            ))}
            <div className="flex flex-col space-y-2 mt-4">
              <div className="flex items-center space-x-2">
                <label>Wages Paid:</label>
                <input type="number" value={paymentInput} onChange={(e) => setPaymentInput(e.target.value)} className="border rounded p-1 w-24 text-right" />
              </div>
              <div className="flex items-center space-x-2">
                <label>Helpers:</label>
                <input type="number" value={helpersInput} onChange={(e) => setHelpersInput(e.target.value)} className="border rounded p-1 w-24 text-right" />
              </div>
              <button onClick={handleSaveAll} className="px-3 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700">Save</button>
            </div>
          </div>
        )}

        {editMode && attendance.length === 0 && (
          <div className="mt-4 p-4 border rounded bg-white shadow-sm space-y-3">
            <h4 className="font-bold mb-2">Add Missing Season & Attendance</h4>
            <label className="block mb-2">
              Select Season:
              <select value={selectedSeason} onChange={(e) => setSelectedSeason(e.target.value)} className="border rounded p-1 ml-2">
                <option value="">-- Choose --</option>
                <option value={`July 4th ${new Date().getFullYear()} Season`}>July 4th {new Date().getFullYear()} Season</option>
                <option value={`New Year ${new Date().getFullYear()} Season`}>New Year {new Date().getFullYear()} Season</option>
                <option value="Custom">Custom...</option>
              </select>
            </label>
            {selectedSeason === "Custom" && (
              <input type="text" placeholder="Enter Season Name" value={selectedSeason} onChange={(e) => setSelectedSeason(e.target.value)} className="border p-1 rounded w-full mb-2" />
            )}
            <h5 className="font-semibold mt-2 mb-1">Attendance Records:</h5>
            {newAttendance.map((rec, idx) => (
              <div key={idx} className="flex items-center space-x-2 mb-1">
                <input type="date" value={rec.date} onChange={(e) => {
                  const updated = [...newAttendance];
                  updated[idx].date = e.target.value;
                  setNewAttendance(updated);
                }} className="border rounded p-1" />
                <input type="number" value={rec.hours} onChange={(e) => {
                  const updated = [...newAttendance];
                  updated[idx].hours = parseInt(e.target.value, 10) || 0;
                  setNewAttendance(updated);
                }} className="border rounded p-1 w-20 text-right" placeholder="Hours" />
                <button onClick={() => {
                  const updated = [...newAttendance];
                  updated.splice(idx, 1);
                  setNewAttendance(updated);
                }} className="text-red-500 text-xs">Remove</button>
              </div>
            ))}
            <button onClick={() => setNewAttendance([...newAttendance, { date: '', hours: 0 }])} className="text-xs text-indigo-600 border border-indigo-600 rounded px-2 py-1 hover:bg-indigo-50 transition mt-2">+ Add Date</button>
            <div className="flex flex-col space-y-2 mt-4">
              <div className="flex items-center space-x-2">
                <label>Wages Paid:</label>
                <input type="number" value={paymentInput} onChange={(e) => setPaymentInput(e.target.value)} className="border rounded p-1 w-24 text-right" />
              </div>
              <div className="flex items-center space-x-2">
                <label>Helpers:</label>
                <input type="number" value={helpersInput} onChange={(e) => setHelpersInput(e.target.value)} className="border rounded p-1 w-24 text-right" />
              </div>
              <button onClick={handleSaveMissingAttendance} className="mt-3 w-full px-3 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700">Save Season & Attendance</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
