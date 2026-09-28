import React, { useState, useEffect } from 'react';
import { BookingResponse } from '../types';
import {
  CheckCircle2,
  Video,
  ShieldCheck,
  Copy,
  Check,
  Download,
  QrCode,
  FileText,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';

interface Props {
  booking: BookingResponse;
  studentName?: string;
  onBookAnother: () => void;
}

export const ConfirmationStep: React.FC<Props> = ({ booking, studentName, onBookAnother }) => {
  const [copied, setCopied] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const resolvedStudentName = studentName || booking.studentName || booking.parent.name;
  const classUrl = `${window.location.origin}/class/${booking.bookingReference}`;

  // Generate Scannable QR Code Data URL on mount
  useEffect(() => {
    QRCode.toDataURL(classUrl, {
      width: 280,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then((url) => setQrCodeUrl(url))
      .catch((err) => console.warn('QR Code generation error:', err));
  }, [classUrl]);

  const copyRef = () => {
    navigator.clipboard.writeText(booking.bookingReference);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper to convert logo image URL to Base64 for PDF embedding
  const getBase64ImageFromUrl = async (url: string): Promise<string> => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch {
      return '';
    }
  };

  // PDF Token Pass Generator
  const handleDownloadPdf = async () => {
    try {
      setIsGeneratingPdf(true);
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const parentName = booking.parent.name || 'Parent';
      const mentorName = booking.mentor.name || 'Assigned Mentor';
      const registrationCode = booking.bookingReference;
      const classDateDisplay = booking.parent.localTimeDisplay || 'Scheduled Class Time';
      const selectedClassDateOnly = booking.startTimeUtc
        ? new Date(booking.startTimeUtc).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
        : 'Selected Class Date';
      
      const generatedDateStr = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      // Try loading logo.jpeg as Base64 for PDF header
      let logoBase64 = '';
      try {
        logoBase64 = await getBase64ImageFromUrl('/logo.jpeg');
      } catch (e) {
        console.warn('Could not load logo.jpeg for PDF:', e);
      }

      // Generate QR Code data URL for PDF
      const qrPdfDataUrl = await QRCode.toDataURL(classUrl, {
        width: 300,
        margin: 1,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      });

      const pageWidth = doc.internal.pageSize.getWidth();

      // Header Background Banner
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, pageWidth, 48, 'F');

      // Accent Stripe
      doc.setFillColor(249, 115, 22); // coral/orange
      doc.rect(0, 46, pageWidth, 2, 'F');

      // Top-Left Logo Image inside Header
      let titleX = 15;
      if (logoBase64) {
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(15, 8, 30, 30, 4, 4, 'F');
        try {
          doc.addImage(logoBase64, 'JPEG', 16, 9, 28, 28);
          titleX = 52;
        } catch {
          titleX = 15;
        }
      }

      // Title & Subtitle
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.text('CODEYOUNG', titleX, 22);

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(203, 213, 225);
      doc.text('OFFICIAL 1:1 TRIAL CLASS CONFIRMATION PASS', titleX, 29);

      doc.setTextColor(148, 163, 184);
      doc.setFontSize(7.5);
      doc.text(`Issued Date: ${generatedDateStr}`, titleX, 35);

      // Status Badge
      doc.setFillColor(16, 185, 129); // emerald-500
      doc.roundedRect(pageWidth - 52, 16, 37, 9, 2.5, 2.5, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.text('CONFIRMED PASS', pageWidth - 47.5, 22);

      // Main Ticket Box
      doc.setDrawColor(226, 232, 240);
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(15, 56, pageWidth - 30, 195, 5, 5, 'FD');

      // Unique Registration Code Top Banner
      doc.setFillColor(254, 243, 199); // amber-100
      doc.roundedRect(20, 62, pageWidth - 40, 22, 3, 3, 'F');

      doc.setTextColor(180, 83, 9);
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'bold');
      doc.text('UNIQUE REGISTRATION TOKEN CODE:', 25, 70);

      doc.setTextColor(225, 29, 72);
      doc.setFontSize(16);
      doc.setFont('courier', 'bold');
      doc.text(registrationCode, 25, 79);

      // Left Column Details
      let yPos = 96;
      const colX = 25;

      const renderRow = (label: string, value: string, sub?: string) => {
        doc.setTextColor(100, 116, 139);
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'bold');
        doc.text(label.toUpperCase(), colX, yPos);

        doc.setTextColor(15, 23, 42);
        doc.setFontSize(10.5);
        doc.setFont('helvetica', 'bold');
        doc.text(value, colX, yPos + 5);

        if (sub) {
          doc.setTextColor(148, 163, 184);
          doc.setFontSize(7.5);
          doc.setFont('helvetica', 'normal');
          doc.text(sub, colX, yPos + 9.5);
          yPos += 16;
        } else {
          yPos += 13.5;
        }
      };

      renderRow('Student Name', resolvedStudentName);
      renderRow('Parent / Guardian', parentName, `Email: ${booking.parent.email}`);
      renderRow('Assigned 1:1 Mentor', mentorName, `Mentor Timezone: ${booking.mentor.timezone}`);
      renderRow('Selected Class Date', selectedClassDateOnly);
      renderRow('Local Time & Timezone', classDateDisplay, `Student Timezone: ${booking.parent.timezone}`);
      renderRow('Session Format', '30 Minutes Live Interactive 1:1 Class');

      // Right Column QR Code Box
      const qrBoxX = pageWidth - 78;
      const qrBoxY = 96;

      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(qrBoxX, qrBoxY, 58, 85, 4, 4, 'FD');

      // Embed QR Image inside PDF
      doc.addImage(qrPdfDataUrl, 'PNG', qrBoxX + 6, qrBoxY + 6, 46, 46);

      doc.setTextColor(15, 23, 42);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('SCAN TO ACCESS CLASS', qrBoxX + 10, qrBoxY + 58);

      doc.setTextColor(100, 116, 139);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.text('Scan with camera to open', qrBoxX + 10, qrBoxY + 65);
      doc.text('live class or view pass.', qrBoxX + 11, qrBoxY + 69);
      doc.text(`Issued: ${generatedDateStr.split(',')[0]}`, qrBoxX + 10, qrBoxY + 74);

      // Bottom Link Box
      const linkY = 208;
      doc.setFillColor(241, 245, 249);
      doc.roundedRect(20, linkY, pageWidth - 40, 20, 3, 3, 'F');

      doc.setTextColor(71, 85, 105);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('DIRECT CLASSROOM URL LINK:', 25, linkY + 7);

      doc.setTextColor(37, 99, 235);
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.text(classUrl, 25, linkY + 14);

      // Footer
      doc.setTextColor(148, 163, 184);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('Please join 5 minutes prior with your webcam and microphone ready.', 15, 260);
      doc.text(`© 2026 CodeYoung 1:1 Live Trial Platform. Pass Issued ${generatedDateStr}`, 15, 266);

      // Trigger automatic PDF file download!
      doc.save(`CodeYoung_Registration_Token_${registrationCode}.pdf`);
    } catch (err: any) {
      console.error('PDF generation error:', err);
      alert('Failed to generate PDF token. Please try again.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto text-center animate-in zoom-in-95 duration-300">
      {/* Success Badge */}
      <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
        <CheckCircle2 className="w-9 h-9" />
      </div>

      <div>
        <h2 className="text-2xl font-black text-slate-900">Your trial class is confirmed! 🎉</h2>
        <p className="text-xs text-slate-600 mt-1 font-medium">
          Your registration token pass with scannable QR code is ready below.
        </p>
      </div>

      {/* Booking Reference Code Box */}
      <div className="p-4 rounded-2xl bg-gradient-to-b from-coral-50/80 to-amber-50/80 border border-coral-200 space-y-2 shadow-sm">
        <span className="text-[11px] font-bold text-coral-700 uppercase tracking-wider">Unique Registration Code</span>
        <div className="flex items-center justify-center gap-3">
          <span className="font-mono text-2xl font-black text-coral-600 tracking-wider">
            {booking.bookingReference}
          </span>
          <button
            type="button"
            onClick={copyRef}
            className="p-1.5 rounded-lg bg-white text-slate-600 hover:text-coral-600 border border-coral-200 transition-colors shadow-sm"
            title="Copy Reference Code"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Download PDF Pass CTA Button */}
      <button
        type="button"
        onClick={handleDownloadPdf}
        disabled={isGeneratingPdf}
        className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-2xl shadow-xl border border-slate-800 transition-all flex items-center justify-center gap-2.5 active:scale-95 group"
      >
        {isGeneratingPdf ? (
          <span className="animate-pulse flex items-center gap-2">Generating PDF Token Pass...</span>
        ) : (
          <>
            <Download className="w-4 h-4 text-amber-400 group-hover:bounce" />
            <span>Download Registration Token (PDF)</span>
            <FileText className="w-4 h-4 text-emerald-400" />
          </>
        )}
      </button>

      {/* Visual Token Pass Preview Card with QR Code */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 text-left space-y-5 shadow-2xl shadow-slate-200/60 relative overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-black text-slate-900 uppercase tracking-wider">Official Registration Pass</span>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            VERIFIED TOKEN
          </span>
        </div>

        {/* QR Code and Pass Details Row */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
          {/* Left Details (8 cols) */}
          <div className="sm:col-span-8 space-y-3 text-xs">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Student Name</span>
              <p className="font-extrabold text-slate-900 text-sm">{resolvedStudentName}</p>
            </div>

            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Parent Name</span>
              <p className="font-bold text-slate-800">{booking.parent.name} ({booking.parent.email})</p>
            </div>

            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assigned 1:1 Mentor</span>
              <p className="font-bold text-indigo-700">{booking.mentor.name}</p>
            </div>

            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Class Date & Timings</span>
              <p className="font-extrabold text-coral-600">{booking.parent.localTimeDisplay}</p>
            </div>
          </div>

          {/* Right Scannable QR Code Box (4 cols) */}
          <div className="sm:col-span-4 flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
            {qrCodeUrl ? (
              <img src={qrCodeUrl} alt="Class QR Code" className="w-28 h-28 rounded-xl shadow-xs border border-slate-200" />
            ) : (
              <div className="w-28 h-28 rounded-xl bg-slate-200 animate-pulse flex items-center justify-center text-slate-400 text-[10px]">
                Loading QR...
              </div>
            )}
            <div className="space-y-0.5">
              <p className="text-[10px] font-black text-slate-900 flex items-center justify-center gap-1">
                <QrCode className="w-3 h-3 text-coral-500" /> Scan QR Code
              </p>
              <p className="text-[9px] text-slate-500 font-medium leading-tight">
                Scan with camera to open class or view details
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-600">
          <span>Session Duration: <strong className="text-slate-900 font-bold">30 minutes</strong></span>
          <span className="flex items-center gap-1 text-emerald-600 font-bold">
            <ShieldCheck className="w-4 h-4" /> Confirmed
          </span>
        </div>
      </div>

      {/* Direct Parent Access Notice */}
      <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-950 text-xs flex items-center justify-center gap-2 font-bold shadow-xs">
        <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>Parent & Student Direct Access: Join 1:1 Live Demo Session directly (No Login Required)</span>
      </div>

      {/* Classroom CTA */}
      <div className="space-y-3 pt-2">
        <Link
          to={`/class/${booking.bookingReference}`}
          className="w-full py-3.5 bg-gradient-to-r from-coral-500 to-amber-500 hover:from-coral-600 hover:to-amber-600 text-white text-xs font-black rounded-2xl shadow-xl shadow-coral-500/25 transition-all flex items-center justify-center gap-2 active:scale-95"
        >
          <Video className="w-4 h-4" /> Join Demo Class Room
        </Link>

        <button
          type="button"
          onClick={onBookAnother}
          className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
        >
          Book Another Trial Class
        </button>
      </div>
    </div>
  );
};
