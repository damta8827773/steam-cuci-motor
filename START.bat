@echo off
title Steam Cuci Motor - Sistem Kasir
echo.
echo  ==========================================
echo    Steam Cuci Motor - Sistem Kasir
echo  ==========================================
echo.
echo  Menjalankan Backend (port 3001)...
start "Steam Backend" cmd /k "cd /d %~dp0backend && npx tsx src/index.ts"

timeout /t 3 /nobreak >nul

echo  Menjalankan Frontend (port 5173)...
start "Steam Frontend" cmd /k "cd /d %~dp0frontend && npx vite --port 5173"

timeout /t 4 /nobreak >nul

echo.
echo  Membuka browser...
start http://localhost:5173

echo.
echo  ==========================================
echo   Kasir : http://localhost:5173
echo   API   : http://localhost:3001/api/health
echo  ==========================================
echo.
pause
