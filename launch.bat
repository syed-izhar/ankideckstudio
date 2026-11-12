@echo off
title AnkiDeckStudio Launcher
echo ============================================================
echo   Starting AnkiDeckStudio...
echo ============================================================
cd /d "%~dp0"
node server.js
pause
