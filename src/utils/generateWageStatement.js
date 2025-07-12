import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toWords } from "number-to-words";  // Optional: npm install number-to-words

export function generateWageStatement({
  employeeName,
  location,
  season,
  totalHours,
  totalDays,
  wagesPaid,
  helpers,
  avgPerHour,
  avgPerDay,
  paymentDate,
  attendanceRecords
}) {
  const doc = new jsPDF();

  const companyName = 'Dollar Fireworks LLC';
  const companyAddress = '12675 Veterans Memorial Dr, Houston, TX 77014';
  const companyPhone = '832-466-7251';
  const owner = 'Abdul Maqsood';
  const email = 'dollarfireworks@gmail.com';

  // --- Header section ---
  doc.setFontSize(18);
  doc.text('WAGE STATEMENT', 14, 20);

  doc.setFontSize(12);
  doc.text(`Employee: ${employeeName}`, 14, 30);
  doc.text(`Location: ${location}`, 14, 36);
  doc.text(`Season: ${season}`, 14, 42);

  const rightStart = 140;
  doc.text(`Total Hours: ${totalHours}`, rightStart, 30);
  doc.text(`Total Days: ${totalDays}`, rightStart, 36);
  doc.text(`Wages Paid: $${wagesPaid}`, rightStart, 42);
  doc.text(`Helpers: ${helpers}`, rightStart, 48);
  doc.text(`Avg $/Hour: $${avgPerHour}`, rightStart, 54);
  doc.text(`Avg $/Day: $${avgPerDay}`, rightStart, 60);
  doc.text(`Payment Date: ${paymentDate}`, rightStart, 66);

  // --- Attendance records table ---
  doc.autoTable({
    startY: 75,
    head: [['Date', 'Hours Worked']],
    body: attendanceRecords.map((rec) => [rec.date, rec.hours]),
    styles: { fontSize: 10 }
  });

  // --- Check design ---
  let y = doc.lastAutoTable.finalY + 20;
  doc.setFontSize(10);
  doc.line(14, y, 200, y);  // Divider line
  y += 6;

  doc.text('Non-negotiable: For information only', 14, y);
  y += 6;

  doc.text(`Pay to the Order of: ${employeeName}`, 14, y);
  y += 6;

  const amountInWords = toWords(wagesPaid);
  doc.text(`Amount: $${wagesPaid} (${amountInWords} dollars)`, 14, y);
  y += 6;

  doc.text(companyName, 14, y);
  y += 6;

  doc.text(companyAddress, 14, y);
  y += 6;

  doc.text(`Phone: ${companyPhone}`, 14, y);
  y += 6;

  doc.text(`Owner: ${owner}`, 14, y);
  y += 6;

  doc.text(`Email: ${email}`, 14, y);

  // --- Save ---
  doc.save(`${employeeName}_${season}_Statement.pdf`);
}
