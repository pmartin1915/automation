@echo off
cls
echo.
echo ========================================
echo   AUTOMATION STATION - QUICK TEST
echo ========================================
echo.
echo This builds and runs the app quickly
echo for testing (no installer needed)
echo.
echo ----------------------------------------

cd /d "%~dp0"

echo [1/2] Building app...
call npm run build
if errorlevel 1 (
    echo.
    echo ERROR: Build failed!
    pause
    exit /b 1
)

echo.
echo [2/2] Starting Automation Station...
echo.
echo TIP: Press Ctrl+C to stop the app
echo.
start "Automation Station" npm start

echo.
echo ========================================
echo   App is starting!
echo ========================================
echo.
echo The app should open in a few seconds.
echo Close this window when you're done testing.
echo.
pause
