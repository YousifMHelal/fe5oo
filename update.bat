@echo off
cd /d "%~dp0"

echo Installing dependencies...
call npm install
if errorlevel 1 ( echo npm install failed & exit /b 1 )

echo Building...
call npm run build
if errorlevel 1 ( echo Build failed & exit /b 1 )

echo Starting production server...
call npm run start
