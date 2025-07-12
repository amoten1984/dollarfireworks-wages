import jsPDF from 'jspdf';
import 'jspdf-autotable';

export function generatePDF({ employeeName, location, season, summary, attendance, companyInfo }) {
  const doc = new jsPDF();

  // Title
  doc.setFontSize(18);
  doc.text('Wage Statement', 14, 20);

  // Employee + Location info
  doc.setFontSize(12);
  doc.text(`Employee: ${employeeName}`, 14, 30);
  doc.text(`Location: ${location}`, 14, 36);
  doc.text(`Season: ${season}`, 14, 42);

  // Summary box
  doc.text(`Total Hours: ${summary.totalHours}`, 150, 30);
  doc.text(`Total Days: ${summary.totalDays}`, 150, 36);
  doc.text(`Wages Paid: $${summary.totalPayment}`, 150, 42);
  doc.text(`Helpers: ${summary.helpers}`, 150, 48);
  doc.text(`Avg $/Hour: $${summary.avgPerHour}`, 150, 54);
  doc.text(`Avg $/Day: $${summary.avgPerDay}`, 150, 60);
  doc.text(`Paid on: ${summary.paymentDate || 'N/A'}`, 150, 66);

  // Attendance Table
  doc.autoTable({
    startY: 70,
    head: [['Date', 'Hours Worked']],
    body: attendance.map((a) => [
      a.dateFormatted,
      a.hours
    ]),
  });

  // Fake check design
  doc.setFontSize(10);
  doc.line(14, 260, 200, 260, 'S'); // dotted line for tear-off
  doc.text('Check: For display only', 14, 266);
  doc.text(`Pay to the Order of: ${employeeName}`, 14, 272);
  doc.text(`Amount: $${summary.totalPayment}`, 14, 278);
  doc.text(companyInfo.name, 14, 284);
  doc.text(companyInfo.address, 14, 290);
  doc.text(`Phone: ${companyInfo.phone}`, 14, 296);

  doc.save(`${employeeName}_${season}_Statement.pdf`);
}
