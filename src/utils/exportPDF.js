import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Utility: convert number to words for check line
function numberToWords(amount) {
  const dollars = Math.floor(amount);
  const cents = Math.round((amount - dollars) * 100);
  const words = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(amount);
  return `${dollars} and ${cents}/100 dollars`;
}

export function generatePDF({ employeeName, location, season, summary, attendance, companyInfo }) {
  const doc = new jsPDF();

  // Header section
  doc.setFontSize(18).text('Wage Statement', 14, 20);
  doc.setFontSize(12);
  doc.text(`Employee: ${employeeName}`, 14, 30);
  doc.text(`Location: ${location}`, 14, 36);
  doc.text(`Season: ${season}`, 14, 42);

  doc.text(`Total Hours: ${summary.totalHours}`, 150, 30);
  doc.text(`Total Days: ${summary.totalDays}`, 150, 36);
  doc.text(`Wages Paid: $${summary.totalPayment}`, 150, 42);
  doc.text(`Helpers: ${summary.helpers}`, 150, 48);
  doc.text(`Avg $/Hour: $${summary.avgPerHour}`, 150, 54);
  doc.text(`Avg $/Day: $${summary.avgPerDay}`, 150, 60);
  doc.text(`Paid on: ${summary.paymentDate || 'N/A'}`, 150, 66);

  // Attendance table
  doc.autoTable({
    startY: 70,
    head: [['Date', 'Hours Worked']],
    body: attendance.map((a) => [a.dateFormatted, a.hours]),
  });

  const checkTopY = doc.previousAutoTable.finalY + 20;
  const amountInWords = numberToWords(summary.totalPayment);
  const paymentDate = summary.paymentDate || new Date().toLocaleDateString();

  // Check box border
  doc.setLineWidth(0.5);
  doc.rect(14, checkTopY, 180, 60);

  // Company info (top-left)
  doc.setFontSize(10);
  doc.text(companyInfo.name, 18, checkTopY + 6);
  doc.text(companyInfo.address, 18, checkTopY + 12);
  doc.text(`Phone: ${companyInfo.phone}`, 18, checkTopY + 18);

  // Check #: hardcoded or dynamic
  doc.text(`Check #: 001234`, 150, checkTopY + 6);
  doc.text(`Date: ${paymentDate}`, 150, checkTopY + 12);

  // Payee line
  doc.text(`Pay to the Order of: ${employeeName}`, 18, checkTopY + 30);
  doc.text(`$${summary.totalPayment.toFixed(2)}`, 160, checkTopY + 30, { align: 'right' });

  // Amount in words
  doc.text(amountInWords, 18, checkTopY + 36);

  // Signature line
  doc.line(18, checkTopY + 50, 80, checkTopY + 50);
  doc.text('Authorized Signature', 18, checkTopY + 54);

  // "Non-Negotiable"
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text('Non-Negotiable', 100, checkTopY + 58, { align: 'center' });

  doc.save(`wage-statement-${employeeName}.pdf`);
}
