import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { StaffAttendanceSummary, TimesheetEntry, StoreProfile } from '../types';

export interface WeeklyReportPdfData {
  reportNumber: string;
  store: StoreProfile;
  weekLabel: string;
  startDate: string;
  endDate: string;
  recipientEmail: string;
  ccEmails: string[];
  kpis: {
    totalStaff: number;
    scheduledHours: number;
    actualHours: number;
    varianceHours: number;
    attendanceRate: number;
    overtimeHours: number;
    discrepanciesCount: number;
    estimatedPayrollCost: number;
  };
  staffSummaries: StaffAttendanceSummary[];
  timesheetEntries: TimesheetEntry[];
  generatedAt: string;
  trackingId: string;
  deliveryMethod?: string;
}

export function generateWeeklyAttendancePdf(data: WeeklyReportPdfData): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 36;
  const contentWidth = pageWidth - margin * 2;

  // --- Top Branding Banner ---
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 60, 'F');

  // App & Document Header
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('SHIFTPULSE', margin, 28);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text('STORE OPERATIONS | AUTOMATED HQ REPORTING DISPATCH', margin + 98, 28);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text(`TRACKING ID: ${data.trackingId}`, pageWidth - margin, 28, { align: 'right' });

  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text(`Official Dispatch to Head Office (HQ)`, pageWidth - margin, 42, { align: 'right' });

  // --- Document Subheader & Store Metadata ---
  let cursorY = 82;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text('Weekly Staff Attendance & Hours Worked Report', margin, cursorY);

  cursorY += 16;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105); // slate-600
  doc.text(`Reporting Period: ${data.weekLabel} (${data.startDate} to ${data.endDate})`, margin, cursorY);

  // Metadata Box (Store, HQ Recipient, Generated date)
  cursorY += 10;
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.roundedRect(margin, cursorY, contentWidth, 54, 4, 4, 'FD');

  const col1X = margin + 12;
  const col2X = margin + 180;
  const col3X = margin + 350;
  const metaY1 = cursorY + 18;
  const metaY2 = cursorY + 38;

  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('STORE OUTLET:', col1X, metaY1);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(data.store.name, col1X, metaY1 + 11);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('HQ RECIPIENT:', col2X, metaY1);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(data.recipientEmail, col2X, metaY1 + 11);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('DISPATCH DATE & TIME:', col3X, metaY1);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(data.generatedAt, col3X, metaY1 + 11);

  cursorY += 66;

  // --- Executive KPI Metric Cards (4 Columns) ---
  const kpiWidth = (contentWidth - 18) / 4;
  const kpiHeight = 44;

  const kpisData = [
    {
      label: 'ATTENDANCE RATE',
      value: `${data.kpis.attendanceRate.toFixed(1)}%`,
      sub: `${data.kpis.totalStaff} staff scheduled`,
      highlight: data.kpis.attendanceRate >= 95 ? '#047857' : '#b45309',
    },
    {
      label: 'TOTAL HOURS WORKED',
      value: `${data.kpis.actualHours.toFixed(1)}h`,
      sub: `Sched: ${data.kpis.scheduledHours.toFixed(1)}h (${data.kpis.varianceHours >= 0 ? '+' : ''}${data.kpis.varianceHours.toFixed(1)}h)`,
      highlight: '#0f172a',
    },
    {
      label: 'OVERTIME LOGGED',
      value: `${data.kpis.overtimeHours.toFixed(1)}h`,
      sub: data.kpis.overtimeHours > 0 ? 'Approved OT' : 'Zero Overtime',
      highlight: data.kpis.overtimeHours > 0 ? '#b45309' : '#047857',
    },
    {
      label: 'EST. PAYROLL COST',
      value: `$${data.kpis.estimatedPayrollCost.toFixed(2)}`,
      sub: `${data.kpis.discrepanciesCount} audit flags flagged`,
      highlight: '#1e293b',
    },
  ];

  kpisData.forEach((kpi, idx) => {
    const kpiX = margin + idx * (kpiWidth + 6);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(kpiX, cursorY, kpiWidth, kpiHeight, 3, 3, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(kpi.label, kpiX + 8, cursorY + 12);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(kpi.highlight);
    doc.text(kpi.value, kpiX + 8, cursorY + 26);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.text(kpi.sub, kpiX + 8, cursorY + 37);
  });

  cursorY += kpiHeight + 14;

  // --- Section 1: Staff Attendance & Hours Summary Table ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('1. Staff Attendance & Hours Breakdown', margin, cursorY);

  cursorY += 6;

  const staffTableHeaders = [
    'Staff Name',
    'Type',
    'Primary Role',
    'Shifts',
    'Sched (h)',
    'Actual (h)',
    'Variance',
    'OT (h)',
    'Punctuality',
    'Status',
    'Est. Wage',
  ];

  const staffTableRows = data.staffSummaries.map((s) => [
    s.staffName,
    s.isAdHoc ? 'Ad-Hoc Casual' : s.employmentType,
    s.role,
    `${s.shiftsAttended}/${s.shiftsScheduled}`,
    `${s.scheduledHours.toFixed(1)}h`,
    `${s.actualHours.toFixed(1)}h`,
    `${s.varianceHours >= 0 ? '+' : ''}${s.varianceHours.toFixed(1)}h`,
    `${s.overtimeHours.toFixed(1)}h`,
    `${s.punctualityRate}%`,
    s.attendanceStatus,
    `$${s.estimatedGrossPay.toFixed(2)}`,
  ]);

  autoTable(doc, {
    startY: cursorY,
    head: [staffTableHeaders],
    body: staffTableRows,
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 7.5,
      cellPadding: 4,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.5,
    },
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.5,
      halign: 'left',
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 80 },
      1: { cellWidth: 60 },
      2: { cellWidth: 55 },
      3: { halign: 'center', cellWidth: 32 },
      4: { halign: 'right', cellWidth: 40 },
      5: { halign: 'right', fontStyle: 'bold', cellWidth: 40 },
      6: { halign: 'right', cellWidth: 38 },
      7: { halign: 'right', cellWidth: 32 },
      8: { halign: 'center', cellWidth: 42 },
      9: { cellWidth: 52 },
      10: { halign: 'right', fontStyle: 'bold', cellWidth: 50 },
    },
    didDrawPage: (hookData) => {
      cursorY = hookData.cursor?.y || cursorY;
    },
    margin: { left: margin, right: margin },
  });

  // Check cursor position after table
  const finalY = (doc as any).lastAutoTable?.finalY || cursorY + 120;
  cursorY = finalY + 14;

  // If running low on page height, add new page for Daily Punch Logs & Signatures
  if (cursorY > pageHeight - 160) {
    doc.addPage();
    cursorY = 40;
  }

  // --- Section 2: Detailed Daily Clock Punches & Audit Flags ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('2. Daily Timesheet Punch Records & Audit Flags', margin, cursorY);

  cursorY += 6;

  const punchHeaders = [
    'Date',
    'Staff Member',
    'Role',
    'Scheduled',
    'Actual In - Out',
    'Break',
    'Net (h)',
    'Audit Notes / Discrepancies',
    'Status',
  ];

  const punchRows = data.timesheetEntries.map((t) => [
    t.date,
    t.staffName,
    t.role,
    `${t.scheduledStart} - ${t.scheduledEnd}`,
    `${t.actualClockIn} - ${t.actualClockOut}`,
    `${t.breakMinutes}m`,
    `${t.totalHours.toFixed(1)}h`,
    t.discrepancyNote || 'Punctual / Verified POS punch',
    t.status === 'approved' ? 'Approved' : 'Pending Review',
  ]);

  autoTable(doc, {
    startY: cursorY,
    head: [punchHeaders],
    body: punchRows,
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 7,
      cellPadding: 3.5,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.5,
    },
    headStyles: {
      fillColor: [51, 65, 85], // slate-700
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7,
    },
    columnStyles: {
      0: { cellWidth: 52 },
      1: { fontStyle: 'bold', cellWidth: 75 },
      2: { cellWidth: 52 },
      3: { cellWidth: 60 },
      4: { cellWidth: 60 },
      5: { halign: 'center', cellWidth: 28 },
      6: { halign: 'right', fontStyle: 'bold', cellWidth: 35 },
      7: { cellWidth: 110 },
      8: { halign: 'center', cellWidth: 50 },
    },
    margin: { left: margin, right: margin },
  });

  const punchFinalY = (doc as any).lastAutoTable?.finalY || cursorY + 120;
  cursorY = punchFinalY + 16;

  // Check if signature fits on current page
  if (cursorY > pageHeight - 95) {
    doc.addPage();
    cursorY = 40;
  }

  // --- Section 3: Manager Sign-off & System Certification ---
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, cursorY, contentWidth, 70, 4, 4, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('STORE MANAGER CERTIFICATION & HQ PAYROLL AUTHORIZATION', margin + 12, cursorY + 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(
    'I certify that all attendance clockings and hours worked reported herein have been audited against POS terminal activity and store roster shifts. Hours are approved for Head Office payroll disbursement.',
    margin + 12,
    cursorY + 28,
    { maxWidth: contentWidth - 140 }
  );

  doc.text(`Digital Sign-off: Store Lead Verification (#${data.trackingId.slice(0, 8)})`, margin + 12, cursorY + 54);
  doc.text(`Timestamp: ${data.generatedAt} | Dispatch Method: ${data.deliveryMethod || 'Automated Weekly Dispatch'}`, margin + 12, cursorY + 64);

  // Signature box
  doc.setDrawColor(148, 163, 184);
  doc.line(pageWidth - margin - 110, cursorY + 48, pageWidth - margin - 10, cursorY + 48);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('Authorized Store Signature', pageWidth - margin - 110, cursorY + 58);

  // --- Footers on all pages ---
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `ShiftPulse Enterprise Ops | Confidential Weekly Attendance & Hours Report | Generated for HQ Payroll`,
      margin,
      pageHeight - 16
    );
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 16, { align: 'right' });
  }

  return doc;
}

export function downloadWeeklyAttendancePdf(data: WeeklyReportPdfData, filename?: string): void {
  const doc = generateWeeklyAttendancePdf(data);
  const cleanName = filename || `Weekly_Attendance_Report_${data.store.name.replace(/[^a-zA-Z0-9]/g, '_')}_${data.startDate}.pdf`;
  doc.save(cleanName);
}
