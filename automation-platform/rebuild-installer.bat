@echo off
cls
echo.
echo ========================================
echo   AUTOMATION STATION - REBUILD INSTALLER
echo ========================================
echo.
echo This builds a new installer that you
echo can install to update your pinned app.
echo.
echo This takes 2-3 minutes...
echo ----------------------------------------
echo.

cd /d "%~dp0"

echo [1/1] Building installer...
call npm run package
if errorlevel 1 (
    echo.
    echo ERROR: Build failed!
    pause
    exit /b 1
)

echo.
echo ========================================
echo   SUCCESS! Installer is ready!
echo ========================================
echo.
echo Your new installer is here:
echo   %~dp0release\Automation Station Setup 1.0.0.exe
echo.
echo NEXT STEPS:
echo   1. Close the running Automation Station app
echo   2. Run the installer to update
echo   3. The app on your taskbar will be updated
echo.
echo Opening the release folder now...
echo.

start "" "%~dp0release"

echo.
pause
