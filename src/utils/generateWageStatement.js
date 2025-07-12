import jsPDF from "jspdf";
import "jspdf-autotable";  // Correct way for jspdf 2.x + autotable 3.x

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

  doc.autoTable({
    startY: 75,
    head: [['Date', 'Hours Worked']],
    body: attendanceRecords.map((rec) => [rec.date, rec.hours]),
    styles: { fontSize: 10 },
  });

  let y = doc.previousAutoTable.finalY + 20;
  doc.line(14, y, 200, y);
  y += 6;
  doc.text('Non-negotiable: For reference only', 14, y);
  y += 6;
  doc.text(`Pay to the Order of: ${employeeName}`, 14, y);
  y += 6;
  doc.text(`Amount: $${wagesPaid}`, 14, y);
  y += 6;
  doc.text("Dollar Fireworks LLC", 14, y);

  doc.save(`${employeeName}_${season}_Statement.pdf`);
}
