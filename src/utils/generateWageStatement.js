import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import numberToWords from "number-to-words";

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
  const checkNumber = Math.floor(Math.random() * 900000 + 100000);

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

  autoTable(doc, {
    startY: 75,
    head: [['Date', 'Hours Worked']],
    body: attendanceRecords.map((rec) => [rec.date, rec.hours]),
    styles: { fontSize: 10 }
  });

  let y = doc.previousAutoTable.finalY + 20;

  doc.setFontSize(10);
  doc.rect(14, y, 180, 60);

  doc.text(companyName, 18, y + 6);
  doc.text(companyAddress, 18, y + 12);
  doc.text(`Phone: ${companyPhone}`, 18, y + 18);
  doc.text(`Owner: ${owner}`, 18, y + 24);
  doc.text(`Email: ${email}`, 18, y + 30);

  doc.text(`Date: ${paymentDate}`, 150, y + 6);
  doc.text(`Check No: ${checkNumber}`, 150, y + 12);

  doc.text(`Pay to the Order of: ${employeeName}`, 18, y + 40);

  const amountWords = numberToWords.toWords(Math.floor(wagesPaid));
  const cents = Math.round((wagesPaid % 1) * 100).toString().padStart(2, '0');
  const amountInWords = `${amountWords.charAt(0).toUpperCase() + amountWords.slice(1)} and ${cents}/100 dollars`;

  doc.text(`$${Number(wagesPaid).toFixed(2)}`, 190, y + 40, { align: 'right' });
  doc.text(amountInWords, 18, y + 46);

  doc.line(120, y + 56, 190, y + 56);
  doc.setFontSize(12);
  doc.setFont("times", "italic");
  doc.text("Abdul Maqsood", 155, y + 54, { align: "center" });
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text('Authorized Signature', 155, y + 60, { align: "center" });

  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text('NON-NEGOTIABLE', 100, y + 30, { align: 'center' });

  doc.save(`${employeeName}_${season}_Statement.pdf`);
}
