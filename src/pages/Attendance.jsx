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

  const ratePerHour = 15; // Example rate — replace with real value or fetch from DB if needed
  const standardDeductions = [{ label: "Federal Tax", amount: 50 }]; // Example deductions

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

  const grossPay = totalHours * ratePerHour;
  const totalDeductions = standardDeductions.reduce((sum, d) => sum + d.amount, 0);
  const netPay = grossPay - totalDeductions;

  const periodStart = attendance.length ? new Date(attendance[0].work_date).toLocaleDateString() : "";
  const periodEnd = attendance.length ? new Date(attendance[attendance.length - 1].work_date).toLocaleDateString() : "";

  const exportPDF = () => {
    const employee = staffInfo.name || "Unknown Employee";
    const location = staffInfo.location_name || "Unknown Location";

    generateWageStatement({
      employeeName: employee,
      location,
      ratePerHour,
      periodStart,
      periodEnd,
      totalHours,
      grossPay,
      deductions: standardDeductions,
      netPay,
      paymentDate: new Date().toLocaleDateString(),
      attendanceRecords: attendance.map((a) => ({
        date: new Date(a.work_date).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric", weekday: "long" }),
        hours: a.hours_worked
      }))
    });
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100 text-sm">
      {/* ... (UI code remains unchanged) */}
      <button
        onClick={exportPDF}
        disabled={!staffInfo.name}
        className="text-xs text-green-600 border border-green-600 rounded px-2 py-1 hover:bg-green-50 transition disabled:opacity-50"
      >
        Export Statement
      </button>
      {/* ... */}
    </div>
  );
}
