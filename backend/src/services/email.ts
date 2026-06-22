import nodemailer from 'nodemailer';

interface DailyReportData {
  date: string;
  totalTransactions: number;
  totalRevenue: number;
  kecilCount: number;
  sedangCount: number;
  besarCount: number;
  kecilRevenue: number;
  sedangRevenue: number;
  besarRevenue: number;
  employeeStats: Array<{
    employee_name: string;
    total_washed: number;
    total_revenue: number;
  }>;
}

function createTransporter() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass || pass === 'xxxx-xxxx-xxxx-xxxx') {
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export async function sendDailyReport(data: DailyReportData): Promise<{ success: boolean; message: string }> {
  const transporter = createTransporter();

  if (!transporter) {
    console.warn('[EMAIL] SMTP belum dikonfigurasi. Laporan tidak dikirim.');
    return { success: false, message: 'Konfigurasi email belum diatur di .env' };
  }

  const reportEmail = process.env.REPORT_EMAIL;
  if (!reportEmail) {
    return { success: false, message: 'REPORT_EMAIL belum diatur di .env' };
  }

  const employeeRows = data.employeeStats
    .map(e => `
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 10px 16px;">${e.employee_name}</td>
        <td style="padding: 10px 16px; text-align: center; font-weight: 600;">${e.total_washed}</td>
        <td style="padding: 10px 16px; text-align: right; color: #059669; font-weight: 600;">${formatCurrency(e.total_revenue)}</td>
      </tr>
    `).join('');

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Segoe UI', sans-serif; background: #f3f4f6; margin: 0; padding: 24px;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">

    <div style="background: linear-gradient(135deg, #0ea5e9, #6366f1); padding: 32px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700;">💧 Steam Cuci Motor</h1>
      <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px;">Laporan Harian Sensitif - Hanya untuk Pemilik</p>
    </div>

    <div style="padding: 32px;">
      <h2 style="color: #1e293b; margin: 0 0 4px; font-size: 18px;">Laporan Tanggal</h2>
      <p style="color: #6366f1; font-size: 20px; font-weight: 700; margin: 0 0 24px;">${formatDate(data.date)}</p>

      <div style="display: grid; gap: 12px; margin-bottom: 28px;">
        <div style="background: #f8fafc; border-left: 4px solid #6366f1; border-radius: 8px; padding: 16px;">
          <p style="margin: 0; color: #64748b; font-size: 13px;">Total Kendaraan Dicuci</p>
          <p style="margin: 4px 0 0; color: #1e293b; font-size: 28px; font-weight: 700;">${data.totalTransactions} unit</p>
        </div>
        <div style="background: #f0fdf4; border-left: 4px solid #22c55e; border-radius: 8px; padding: 16px;">
          <p style="margin: 0; color: #64748b; font-size: 13px;">Total Pendapatan Hari Ini</p>
          <p style="margin: 4px 0 0; color: #15803d; font-size: 28px; font-weight: 700;">${formatCurrency(data.totalRevenue)}</p>
        </div>
      </div>

      <h3 style="color: #1e293b; font-size: 15px; margin: 0 0 12px;">Rincian per Tipe Motor</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 28px; border-radius: 8px; overflow: hidden; border: 1px solid #e5e7eb;">
        <thead>
          <tr style="background: #f8fafc;">
            <th style="padding: 10px 16px; text-align: left; color: #64748b; font-size: 13px;">Tipe</th>
            <th style="padding: 10px 16px; text-align: center; color: #64748b; font-size: 13px;">Jumlah</th>
            <th style="padding: 10px 16px; text-align: right; color: #64748b; font-size: 13px;">Pendapatan</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 10px 16px;">🔵 Motor Kecil</td>
            <td style="padding: 10px 16px; text-align: center; font-weight: 600;">${data.kecilCount}</td>
            <td style="padding: 10px 16px; text-align: right; color: #059669; font-weight: 600;">${formatCurrency(data.kecilRevenue)}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 10px 16px;">🟡 Motor Sedang</td>
            <td style="padding: 10px 16px; text-align: center; font-weight: 600;">${data.sedangCount}</td>
            <td style="padding: 10px 16px; text-align: right; color: #059669; font-weight: 600;">${formatCurrency(data.sedangRevenue)}</td>
          </tr>
          <tr>
            <td style="padding: 10px 16px;">🔴 Motor Besar</td>
            <td style="padding: 10px 16px; text-align: center; font-weight: 600;">${data.besarCount}</td>
            <td style="padding: 10px 16px; text-align: right; color: #059669; font-weight: 600;">${formatCurrency(data.besarRevenue)}</td>
          </tr>
        </tbody>
      </table>

      <h3 style="color: #1e293b; font-size: 15px; margin: 0 0 12px;">Performa Karyawan</h3>
      <table style="width: 100%; border-collapse: collapse; border-radius: 8px; overflow: hidden; border: 1px solid #e5e7eb;">
        <thead>
          <tr style="background: #f8fafc;">
            <th style="padding: 10px 16px; text-align: left; color: #64748b; font-size: 13px;">Nama Karyawan</th>
            <th style="padding: 10px 16px; text-align: center; color: #64748b; font-size: 13px;">Cuci</th>
            <th style="padding: 10px 16px; text-align: right; color: #64748b; font-size: 13px;">Kontribusi</th>
          </tr>
        </thead>
        <tbody>${employeeRows}</tbody>
      </table>
    </div>

    <div style="background: #f8fafc; padding: 20px 32px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="margin: 0; color: #94a3b8; font-size: 12px;">
        Email ini dikirim secara otomatis oleh Sistem Kasir Steam Cuci Motor<br>
        Informasi ini bersifat <strong style="color: #ef4444;">RAHASIA</strong> - hanya untuk pemilik
      </p>
    </div>
  </div>
</body>
</html>
  `;

  try {
    await transporter.sendMail({
      from: `"Steam Cuci Motor 💧" <${process.env.GMAIL_USER}>`,
      to: reportEmail,
      subject: `📊 Laporan Harian Steam - ${formatDate(data.date)}`,
      html,
    });

    return { success: true, message: `Laporan berhasil dikirim ke ${reportEmail}` };
  } catch (error) {
    console.error('[EMAIL] Gagal mengirim email:', error);
    return { success: false, message: 'Gagal mengirim email. Periksa konfigurasi SMTP.' };
  }
}
