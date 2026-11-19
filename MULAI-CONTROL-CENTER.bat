@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
 echo Node.js belum terpasang. Unduh Node.js LTS dari https://nodejs.org/
 pause
 exit /b 1
)
start "" http://127.0.0.1:3000/admin/
node server.js
pause
