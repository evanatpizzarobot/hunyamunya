@echo off
title Hunya Munya - site dev server
cd /d "%~dp0site"
if not exist node_modules (
  echo Installing dependencies...
  call npm install
)
start "" http://localhost:3000
call npm run dev
pause
