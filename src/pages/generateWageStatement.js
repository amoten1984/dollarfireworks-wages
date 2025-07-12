import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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

  // Company Header
  doc.setFontSize(18).setFont("helvetica", "bold").setTextColor(33, 37, 41);
  doc.text("Dollar Fireworks LLC", 14, 15);
  doc.setFontSize(10).setFont("helvetica", "normal").setTextColor(100);
  doc.text("12675 Veterans Memorial Dr, Houston, TX 77014", 14, 21);
  doc.text("Phone: 832-466-7251  |  Email: dollarfireworks@gmail.com", 14, 26);

  // Title
  doc.setFontSize(16).setFont("helvetica", "bold").setTextColor(0);
  doc.text("WAGE STATEMENT", 105, 36, { align: "center" });

  // Employee Details (left)
  doc.setFontSize(11).setFont("helvetica", "normal").setTextColor(50);
  doc.text(`Employee: ${employeeName}`, 14, 48);
  doc.text(`Location: ${location}`, 14, 54);
  doc.text(`Season: ${season}`, 14, 60);

  // Summary box (right)
  doc.setFillColor(245, 245, 245).rect(140, 44, 60, 40, "F");
  doc.setTextColor(0).setFontSize(10);
  const summary = [
    `Total Hours: ${totalHours}`,
    `Total Days: ${totalDays}`,
    `Wages Paid: $${wagesPaid}`,
    `Helpers: ${helpers}`,
    `Avg $/Hour: $${avgPerHour}`,
    `Avg $/Day: $${avgPerDay}`,
    `Payment Date: ${paymentDate}`
  ];
  summary.forEach((line, i) => {
    doc.text(line, 142, 49 + i * 5);
  });

  // Attendance Table
  doc.autoTable({
    startY: 70,
    head: [["Date", "Hours Worked"]],
    body: attendanceRecords.map((rec) => [rec.date, rec.hours]),
    theme: "grid",
    styles: { fontSize: 10, cellPadding: 3 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 245, 245] }
  });

  // Check stub at bottom
  const checkY = doc.lastAutoTable.finalY + 20;
  doc.setDrawColor(150).setLineWidth(0.2).line(14, checkY, 200, checkY);
  doc.setFontSize(12).setFont("helvetica", "bold").setTextColor(33, 37, 41);
  doc.text("Pay to the order of:", 14, checkY + 10);
  doc.text(employeeName, 60, checkY + 10);
  doc.setFont("helvetica", "normal").text(`$${wagesPaid}`, 190, checkY + 10, { align: "right" });
  doc.setFontSize(10).text(`Amount in words: ${wagesPaid} dollars`, 14, checkY + 18);
  doc.text("Dollar Fireworks LLC", 14, checkY + 24);
  doc.text(`Paid on: ${paymentDate}`, 14, checkY + 30);
  doc.setFontSize(8).setTextColor(100).text("This check is for informational purposes only and has already been paid.", 14, checkY + 36);

  // Save the PDF
  doc.save(`${employeeName}_Wage_Statement.pdf`);
}
