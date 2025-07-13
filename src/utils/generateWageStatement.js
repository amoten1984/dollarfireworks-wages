import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function generateWageStatement({
  employeeName,
  location,
  ratePerHour,
  periodStart,
  periodEnd,
  totalHours,
  grossPay,
  deductions = [],
  netPay,
  paymentDate,
  attendanceRecords
}) {
  const doc = new jsPDF();

  const companyName = 'Dollar Fireworks LLC';
  const companyAddress = '12675 Veterans Memorial Dr, Houston, TX 77014';
  const companyPhone = '832-466-7251';

  // Header
  doc.setFontSize(14);
  doc.text("PAY STUB", 14, 20);
  doc.setFontSize(10);
  doc.text(`Employee: ${employeeName}`, 14, 30);
  doc.text(`Employer: ${companyName}`, 14, 35);
  doc.text(`Address: ${companyAddress}`, 14, 40);
  doc.text(`Phone: ${companyPhone}`, 14, 45);

  doc.text(`Pay Period: ${periodStart} to ${periodEnd}`, 140, 30);
  doc.text(`Rate: $${ratePerHour}/hr`, 140, 35);
  doc.text(`Hours Worked: ${totalHours}`, 140, 40);

  doc.text(`Gross Pay: $${grossPay.toFixed(2)}`, 14, 55);
  let y = 60;
  deductions.forEach(d => {
    doc.text(`${d.label}: -$${d.amount.toFixed(2)}`, 14, y);
    y += 5;
  });
  doc.text(`Net Pay: $${netPay.toFixed(2)}`, 14, y + 5);

  autoTable(doc, {
    startY: y + 15,
    head: [['Date', 'Hours Worked']],
    body: attendanceRecords.map((rec) => [rec.date, rec.hours]),
    styles: { fontSize: 10 }
  });

  doc.save(`${employeeName}_${periodStart}_Paystub.pdf`);
}
