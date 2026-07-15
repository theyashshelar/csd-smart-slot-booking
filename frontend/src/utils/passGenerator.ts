import { jsPDF } from 'jspdf';
import { formatSlotLabel } from './timeFormatter';

export function formatDate(value?: string) {
  if (!value) return 'Not available';

  try {
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(`${value}T00:00:00`));
  } catch (e) {
    return value;
  }
}

export const getQrCodeBase64 = async (token: string): Promise<string> => {
  const container = document.getElementById('qr-code-container') || document.getElementById(`qr-container-${token}`);
  const svg = container?.querySelector('svg');
  if (!svg) {
    return '';
  }

  const svgString = new XMLSerializer().serializeToString(svg);
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const URL = window.URL || window.webkitURL || window;
  const blobURL = URL.createObjectURL(svgBlob);

  return new Promise<string>((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = svg.clientWidth || 200;
      canvas.height = svg.clientHeight || 200;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      }
      const dataUrl = canvas.toDataURL('image/png');
      URL.revokeObjectURL(blobURL);
      resolve(dataUrl);
    };
    img.onerror = () => {
      URL.revokeObjectURL(blobURL);
      resolve('');
    };
    img.src = blobURL;
  });
};

export const downloadPdfPass = async (booking: any, memberName: string, qrBase64: string) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Green color branding matching CSD theme
  // Top green strip
  doc.setFillColor(16, 35, 25);
  doc.rect(0, 0, 210, 8, 'F');

  // Title
  doc.setTextColor(16, 35, 25);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('CSD SMART SLOT BOOKING', 105, 22, { align: 'center' });

  // Subtitle
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Government Canteen Slot Booking System', 105, 28, { align: 'center' });

  // Badge Booking Pass
  doc.setFillColor(27, 94, 32);
  doc.roundedRect(75, 34, 60, 8, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('BOOKING PASS', 105, 39.5, { align: 'center' });

  // Information Card
  doc.setFillColor(249, 250, 251);
  doc.setDrawColor(229, 231, 235);
  doc.roundedRect(15, 48, 180, 95, 4, 4, 'FD');

  // Booking details title
  doc.setTextColor(16, 35, 25);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('BOOKING DETAILS', 25, 58);

  // Line
  doc.setDrawColor(229, 231, 235);
  doc.line(25, 62, 185, 62);

  const bookingId = booking.id || booking.bookingId;
  const cardType = booking.cardType || booking.bookingLabel;
  const slotText = typeof booking.slot === 'string' ? booking.slot : booking.slot?.label || 'Not available';

  // Left column
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.text('MEMBER NAME', 25, 71);
  doc.setTextColor(17, 24, 39);
  doc.setFont('helvetica', 'bold');
  doc.text(memberName || 'N/A', 25, 76);

  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.text('BOOKING ID', 25, 88);
  doc.setTextColor(17, 24, 39);
  doc.setFont('helvetica', 'bold');
  doc.text(bookingId ? `#${bookingId}` : 'N/A', 25, 93);

  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.text('COUNTER TYPE', 25, 105);
  doc.setTextColor(17, 24, 39);
  doc.setFont('helvetica', 'bold');
  doc.text(cardType || 'N/A', 25, 110);

  // Right column
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.text('BOOKING DATE', 110, 71);
  doc.setTextColor(17, 24, 39);
  doc.setFont('helvetica', 'bold');
  doc.text(formatDate(booking.bookingDate), 110, 76);

  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.text('BOOKING TIME', 110, 88);
  doc.setTextColor(17, 24, 39);
  doc.setFont('helvetica', 'bold');
  doc.text(formatSlotLabel(slotText), 110, 93);

  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.text('STATUS', 110, 105);
  doc.setTextColor(27, 94, 32);
  doc.setFont('helvetica', 'bold');
  doc.text(booking.status || 'BOOKED', 110, 110);

  // Highlight Token Box
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(25, 118, 160, 16, 2, 2, 'FD');

  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('TOKEN NUMBER', 35, 128);

  doc.setTextColor(27, 94, 32);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(booking.token || 'N/A', 105, 129);

  // QR Code Area
  if (qrBase64) {
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(229, 231, 235);
    doc.roundedRect(77, 155, 56, 56, 3, 3, 'FD');
    doc.addImage(qrBase64, 'PNG', 80, 158, 50, 50);
  }

  // Footer notes
  doc.setDrawColor(229, 231, 235);
  doc.line(20, 230, 190, 230);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(47, 61, 52);
  doc.text('Present this QR at the operator counter during your allocated slot.', 105, 240, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('Generated by CSD Smart Slot Booking System.', 105, 246, { align: 'center' });

  // Border frame
  doc.setDrawColor(27, 94, 32);
  doc.setLineWidth(0.5);
  doc.rect(5, 5, 200, 287);

  doc.save(`CSD_Pass_${booking.token}.pdf`);
};

export const downloadPngPass = async (booking: any, memberName: string, qrBase64: string) => {
  const canvas = document.createElement('canvas');
  const width = 600;
  const height = 850;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Background gradient matching View QR Page
  const grad = ctx.createLinearGradient(0, 0, width, height);
  grad.addColorStop(0, '#102319');
  grad.addColorStop(0.62, '#1B5E20');
  grad.addColorStop(1, '#C9A227');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Border frame
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 12;
  ctx.strokeRect(6, 6, width - 12, height - 12);

  // Branding Title
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 24px "Inter", "Helvetica Neue", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('CSD SMART SLOT BOOKING', width / 2, 60);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
  ctx.font = '500 13px "Inter", "Helvetica Neue", sans-serif';
  ctx.fillText('Government Canteen Slot Booking System', width / 2, 82);

  // Divider line
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(50, 105);
  ctx.lineTo(width - 50, 105);
  ctx.stroke();

  // Booking confirmed header
  ctx.fillStyle = '#E8F5E9';
  ctx.font = 'bold 26px "Inter", "Helvetica Neue", sans-serif';
  ctx.fillText('BOOKING CONFIRMED', width / 2, 145);

  // Status badge
  const statusText = booking.status || 'BOOKED';
  const badgeWidth = 110;
  const badgeHeight = 28;
  const badgeX = (width - badgeWidth) / 2;
  const badgeY = 165;
  
  ctx.fillStyle = '#C8E6C9';
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 14);
  } else {
    ctx.rect(badgeX, badgeY, badgeWidth, badgeHeight);
  }
  ctx.fill();

  ctx.fillStyle = '#1B5E20';
  ctx.font = 'bold 13px "Inter", "Helvetica Neue", sans-serif';
  ctx.fillText(statusText, width / 2, 184);

  // Token Number header
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 15px "Inter", "Helvetica Neue", sans-serif';
  ctx.fillText('TOKEN NUMBER', width / 2, 235);

  ctx.fillStyle = '#FFEB3B';
  ctx.font = 'bold 44px "Inter", "Helvetica Neue", sans-serif';
  ctx.fillText(booking.token || 'N/A', width / 2, 285);

  // Details card
  const cardX = 45;
  const cardY = 320;
  const cardW = width - 90;
  const cardH = 210;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(cardX, cardY, cardW, cardH, 16);
  } else {
    ctx.rect(cardX, cardY, cardW, cardH);
  }
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  const bookingId = booking.id || booking.bookingId;
  const cardType = booking.cardType || booking.bookingLabel;
  const slotText = typeof booking.slot === 'string' ? booking.slot : booking.slot?.label || 'Not available';

  // Details grid (2 columns)
  ctx.textAlign = 'left';

  // Left Column
  ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
  ctx.font = '600 11px "Inter", "Helvetica Neue", sans-serif';
  ctx.fillText('MEMBER NAME', 75, 360);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 16px "Inter", "Helvetica Neue", sans-serif';
  ctx.fillText(memberName || 'N/A', 75, 385);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
  ctx.font = '600 11px "Inter", "Helvetica Neue", sans-serif';
  ctx.fillText('BOOKING ID', 75, 430);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 16px "Inter", "Helvetica Neue", sans-serif';
  ctx.fillText(bookingId ? `#${bookingId}` : 'N/A', 75, 455);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
  ctx.font = '600 11px "Inter", "Helvetica Neue", sans-serif';
  ctx.fillText('COUNTER TYPE', 75, 500);
  ctx.fillStyle = '#FFD54F';
  ctx.font = 'bold 16px "Inter", "Helvetica Neue", sans-serif';
  ctx.fillText(cardType || 'N/A', 75, 525);

  // Right Column
  ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
  ctx.font = '600 11px "Inter", "Helvetica Neue", sans-serif';
  ctx.fillText('BOOKING DATE', 330, 360);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 16px "Inter", "Helvetica Neue", sans-serif';
  ctx.fillText(formatDate(booking.bookingDate), 330, 385);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
  ctx.font = '600 11px "Inter", "Helvetica Neue", sans-serif';
  ctx.fillText('BOOKING TIME', 330, 430);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 15px "Inter", "Helvetica Neue", sans-serif';
  ctx.fillText(formatSlotLabel(slotText), 330, 455);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
  ctx.font = '600 11px "Inter", "Helvetica Neue", sans-serif';
  ctx.fillText('STATUS', 330, 500);
  ctx.fillStyle = '#81C784';
  ctx.font = 'bold 16px "Inter", "Helvetica Neue", sans-serif';
  ctx.fillText(booking.status || 'BOOKED', 330, 525);

  // QR Container Background
  if (qrBase64) {
    const qrContainerX = (width - 180) / 2;
    const qrContainerY = 560;
    const qrSize = 150;

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(qrContainerX, qrContainerY, 180, 180, 12);
    } else {
      ctx.rect(qrContainerX, qrContainerY, 180, 180);
    }
    ctx.fill();

    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, qrContainerX + 15, qrContainerY + 15, qrSize, qrSize);

      // Footer
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = 'italic 12px "Inter", "Helvetica Neue", sans-serif';
      ctx.fillText('Present this QR at the operator counter during your allocated slot.', width / 2, 775);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.font = '10px "Inter", "Helvetica Neue", sans-serif';
      ctx.fillText('Generated by CSD Smart Slot Booking System.', width / 2, 798);

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `CSD_Pass_${booking.token}.png`;
      link.href = dataUrl;
      link.click();
    };
    img.src = qrBase64;
  } else {
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = 'italic 12px "Inter", "Helvetica Neue", sans-serif';
    ctx.fillText('Present this QR at the operator counter during your allocated slot.', width / 2, 775);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '10px "Inter", "Helvetica Neue", sans-serif';
    ctx.fillText('Generated by CSD Smart Slot Booking System.', width / 2, 798);

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `CSD_Pass_${booking.token}.png`;
    link.href = dataUrl;
    link.click();
  }
};
