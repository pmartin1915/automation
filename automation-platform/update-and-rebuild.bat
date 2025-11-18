@echo off
cls
echo.
echo ========================================
echo   AUTOMATION STATION - UPDATE & REBUILD
echo ========================================
echo.
echo This pulls the latest code from git
echo and rebuilds the installer.
echo.
echo This takes 3-4 minutes...
echo ----------------------------------------
echo.

cd /d "%~dp0"

echo [1/2] Pulling latest code from git...
git pull origin claude/automation-station-dev-0127h7rwhy3rYJYWimUDdYrS
if errorlevel 1 (
    echo.
    echo WARNING: Git pull had issues, but continuing...
    echo.
)

echo.
echo [2/2] Building new installer...
call npm run package
if errorlevel 1 (
    echo.
    echo ERROR: Build failed!
    pause
    exit /b 1
)

echo.
echo ========================================
echo   SUCCESS! Updated and rebuilt!
echo ========================================
echo.
echo Your new installer is here:
echo   %~dp0release\Automation Station Setup 1.0.0.exe
echo.
echo NEXT STEPS:
echo   1. Close the running Automation Station app
echo   2. Run the new installer to update
echo   3. Your taskbar shortcut will be updated
echo.
echo Opening the release folder now...
echo.

start "" "%~dp0release"

echo.
pause
