import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function generateWageStatement({
  employeeName,
  location,
  ratePerHour,
  totalHours,
  wagesPaid,
  periodStart,
  periodEnd,
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
  doc.text(`Location: ${location}`, 14, 35);
  doc.text(`Employer: ${companyName}`, 14, 40);
  doc.text(`Address: ${companyAddress}`, 14, 45);
  doc.text(`Phone: ${companyPhone}`, 14, 50);

  doc.text(`Pay Period: ${periodStart} to ${periodEnd}`, 140, 30);
  doc.text(`Rate: $${ratePerHour}/hr`, 140, 35);
  doc.text(`Hours Worked: ${totalHours}`, 140, 40);

  doc.setFontSize(11);
  doc.text(`Net Pay: $${Number(wagesPaid).toFixed(2)}`, 14, 60);

  autoTable(doc, {
    startY: 70,
    head: [['Date', 'Hours Worked']],
    body: attendanceRecords.map((rec) => [rec.date, rec.hours]),
    styles: { fontSize: 10 }
  });

  doc.save(`${employeeName}_${periodStart}_Paystub.pdf`);
}
