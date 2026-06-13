<div align="center">

# 💧 Steam Cuci Motor

**Sistem Kasir Modern untuk Bisnis Cuci Motor Steam**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-4.19-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?style=flat-square&logo=prisma&logoColor=white)](https://prisma.io/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)

Aplikasi kasir full-stack berbasis web untuk usaha cuci motor steam. Dirancang dengan arsitektur production-grade — clean separation antara backend REST API dan frontend SPA, keamanan berbasis JWT, serta laporan keuangan otomatis via email.

</div>

---

## ✨ Fitur Utama

| Fitur | Deskripsi |
|---|---|
| 🧾 **Kasir Real-time** | Input transaksi tanpa login — pilih karyawan & tipe motor, harga otomatis tampil |
| 📊 **Dashboard Pemilik** | Statistik harian, grafik per jam, distribusi tipe motor, tren 7 hari |
| 👥 **Manajemen Karyawan** | 7 slot karyawan, nama dapat diedit langsung oleh pemilik |
| 💰 **Manajemen Harga** | Pemilik dapat mengubah harga kecil/sedang/besar kapan saja |
| 📧 **Laporan Email Otomatis** | Data sensitif (pendapatan, performa karyawan) dikirim ke email pemilik |
| 🔐 **Keamanan Berlapis** | Hanya email pemilik yang dapat login; karyawan hanya bisa input transaksi |
| 🌙 **UI Dark Mode Modern** | Animasi Framer Motion, komponen glass-morphism, fully responsive |

---

## 🏗️ Arsitektur

```
steam/
├── backend/                  # REST API — Node.js + Express + TypeScript
│   ├── prisma/
│   │   └── schema.prisma     # Database schema (SQLite)
│   ├── src/
│   │   ├── config/           # Prisma client & database seeding
│   │   ├── controllers/      # Business logic per domain
│   │   ├── middleware/        # JWT authentication guard
│   │   ├── routes/           # Express route definitions
│   │   ├── services/         # Email service (Nodemailer)
│   │   └── index.ts          # Application entry point
│   └── .env.example          # Environment variable template
│
├── frontend/                 # SPA — React 18 + TypeScript + Vite
│   └── src/
│       ├── context/          # Auth context (JWT state management)
│       ├── lib/              # Axios instance with interceptors
│       ├── pages/            # Route-level page components
│       │   ├── CashierPage   # Public — input transaksi
│       │   ├── DashboardPage # Protected — statistik & grafik
│       │   ├── PricesPage    # Protected — kelola harga
│       │   └── EmployeesPage # Protected — kelola karyawan
│       └── types/            # Shared TypeScript interfaces
│
├── START.bat                 # One-click startup (Windows)
└── SETUP.bat                 # First-time installation (Windows)
```

---

## 🖥️ Screenshot

### Halaman Kasir (Publik)
Karyawan dapat langsung input transaksi tanpa perlu login.

- Pilih dari 7 karyawan aktif
- Pilih tipe motor: Kecil (Rp 18.000) · Sedang (Rp 20.000) · Besar (Rp 25.000)
- Riwayat transaksi hari ini tampil real-time

### Dashboard Pemilik (Login Required)
Data keuangan lengkap hanya bisa diakses setelah autentikasi.

- Statistik total kendaraan & pendapatan hari ini
- Grafik transaksi per jam (Bar chart)
- Distribusi tipe motor (Donut chart)
- Tren 7 hari terakhir (Area chart)
- Performa karyawan dengan progress bar

---

## 🔒 Keamanan

- **Autentikasi JWT** — Token 24 jam, refresh otomatis
- **Akses terbatas** — Hanya satu email owner yang dapat login; semua email lain diblokir dengan pesan jelas
- **Data sensitif aman** — Pendapatan & statistik keuangan hanya tampil di dashboard (login) dan dikirim ke email pemilik, **tidak** terekspos ke karyawan
- **Helmet.js** — HTTP security headers (XSS, CSRF, clickjacking protection)
- **Validasi Zod** — Semua input API divalidasi sebelum diproses
- **Environment variables** — Kredensial tidak pernah hardcoded (`.env` di-gitignore)

---

## ⚙️ Teknologi

### Backend
- **Runtime** — Node.js 20+
- **Framework** — Express.js 4
- **Language** — TypeScript 5 (strict mode)
- **ORM** — Prisma 5 + SQLite
- **Auth** — JSON Web Tokens (jsonwebtoken)
- **Validation** — Zod
- **Email** — Nodemailer (Gmail SMTP)
- **Security** — Helmet, bcryptjs, CORS

### Frontend
- **Framework** — React 18 + TypeScript
- **Bundler** — Vite 5
- **Styling** — Tailwind CSS 3
- **Animations** — Framer Motion 11
- **Charts** — Recharts 2
- **HTTP** — Axios (dengan interceptors)
- **Routing** — React Router DOM 6
- **Notifications** — React Hot Toast
- **Icons** — Lucide React

---

## 🚀 Cara Instalasi

### Prasyarat
- Node.js v18 atau lebih baru
- npm v9+

### Setup Pertama

**Windows** — jalankan file ini:
```
SETUP.bat
```

**Manual (semua OS):**
```bash
# 1. Install semua dependencies
npm install
npm install --prefix backend
npm install --prefix frontend

# 2. Buat database
cd backend
npx prisma generate
npx prisma db push
cd ..
```

### Konfigurasi Environment

```bash
# Salin template
cp backend/.env.example backend/.env
```

Buka `backend/.env` dan isi nilai berikut:

```env
PORT=3001
DATABASE_URL="file:./data/steam.db"
JWT_SECRET=<string-random-panjang>

OWNER_EMAIL=<email-pemilik>
OWNER_PASSWORD=<password-pemilik>
REPORT_EMAIL=<email-penerima-laporan>

# Gmail App Password (bukan password biasa)
# Google Account > Security > 2-Step Verification > App Passwords
GMAIL_USER=<gmail-anda>
GMAIL_APP_PASSWORD=<app-password-16-karakter>
```

### Menjalankan Aplikasi

**Windows:**
```
START.bat
```

**Manual:**
```bash
# Terminal 1 — Backend
cd backend && npx tsx src/index.ts

# Terminal 2 — Frontend
cd frontend && npx vite
```

Buka browser: **http://localhost:5173**

---

## 📡 API Endpoints

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| `POST` | `/api/auth/login` | ❌ | Login pemilik |
| `GET` | `/api/auth/verify` | ✅ | Verifikasi token |
| `GET` | `/api/employees` | ❌ | Daftar 7 karyawan |
| `PUT` | `/api/employees/:id` | ✅ | Update nama karyawan |
| `GET` | `/api/prices` | ❌ | Harga saat ini |
| `PUT` | `/api/prices` | ✅ | Update harga (owner only) |
| `POST` | `/api/transactions` | ❌ | Tambah transaksi baru |
| `GET` | `/api/transactions` | ❌ | Transaksi hari ini |
| `GET` | `/api/transactions/stats` | ✅ | Statistik harian |
| `GET` | `/api/transactions/hourly` | ✅ | Data per jam |
| `GET` | `/api/transactions/employee-stats` | ✅ | Performa karyawan |
| `GET` | `/api/transactions/weekly` | ✅ | Tren 7 hari |
| `POST` | `/api/reports/send` | ✅ | Kirim laporan ke email |

> ✅ = Membutuhkan `Authorization: Bearer <token>` header

---

## 📧 Laporan Email

Pemilik dapat mengirim laporan harian dari dashboard dengan menekan tombol **Kirim Laporan**. Email berisi:

- Total kendaraan dicuci & total pendapatan
- Rincian per tipe motor (kecil / sedang / besar)
- Performa masing-masing karyawan

Email dikirim ke alamat `REPORT_EMAIL` yang dikonfigurasi di `.env`.

> **Catatan:** Fitur email memerlukan konfigurasi Gmail App Password. Jika belum dikonfigurasi, laporan tidak akan terkirim tetapi aplikasi tetap berjalan normal.

---

## 🗄️ Database Schema

```prisma
model Employee {
  id           Int           @id @default(autoincrement())
  name         String
  slot         Int           @unique  // Slot 1-7
  transactions Transaction[]
}

model Price {
  id    Int    @id @default(autoincrement())
  type  String @unique  // "kecil" | "sedang" | "besar"
  price Int
}

model Transaction {
  id         Int      @id @default(autoincrement())
  employeeId Int
  motorType  String   // "kecil" | "sedang" | "besar"
  price      Int      // Snapshot harga saat transaksi
  date       String   // "YYYY-MM-DD"
  createdAt  DateTime @default(now())
  employee   Employee @relation(...)
}
```

---

## 📄 Lisensi

MIT License — bebas digunakan dan dimodifikasi untuk keperluan bisnis.

---

<div align="center">
  <sub>Dibangun dengan TypeScript · Express · React · Prisma · Tailwind CSS</sub>
</div>
