@echo off
title Steam - Setup Pertama Kali
echo.
echo  ==========================================
echo    Steam Cuci Motor - Setup Pertama Kali
echo  ==========================================
echo.

echo  [1/4] Install root dependencies...
call npm install
echo.

echo  [2/4] Install backend dependencies...
cd backend
call npm install
echo.

echo  [3/4] Generate Prisma Client dan buat database...
call npx prisma generate
call npx prisma db push
cd ..
echo.

echo  [4/4] Install frontend dependencies...
cd frontend
call npm install
cd ..
echo.

echo  ==========================================
echo   Setup selesai! Jalankan START.bat
echo  ==========================================
echo.
pause
