@echo off
title AnkiDeckStudio Dev Server
echo ============================================================
echo   Starting Vite Dev Server...
echo ============================================================
cd /d "%~dp0"
npm run dev -- --open
pause
