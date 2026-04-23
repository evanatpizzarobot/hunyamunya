@echo off
title Hunya Munya - site dev server
cd /d "%~dp0site"
if not exist node_modules (
  echo Installing dependencies...
  call npm install
)
REM :3000 is reserved for a different local project on this machine.
REM Start hunyamunya on :3001. If :3001 is also taken, Next.js auto-bumps
REM to the next free port and logs the final URL in the console.
set PORT=3001
start "" http://localhost:3001
call npm run dev
pause
