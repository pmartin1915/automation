@echo off
cls
echo.
echo ========================================
echo   AUTOMATION STATION - START HERE
echo ========================================
echo.
echo What would you like to do?
echo.
echo   1. Quick Test (fast, 30 seconds)
echo   2. Rebuild Installer (2-3 minutes)
echo   3. Update from Git and Rebuild (3-4 minutes)
echo   4. Open Easy Start Guide
echo   5. Exit
echo.
echo ========================================
echo.

choice /c 12345 /n /m "Choose an option (1-5): "

if errorlevel 5 exit
if errorlevel 4 goto guide
if errorlevel 3 goto update
if errorlevel 2 goto rebuild
if errorlevel 1 goto test

:test
cls
echo.
echo Starting Quick Test...
echo.
call "%~dp0quick-test.bat"
exit

:rebuild
cls
echo.
echo Building Installer...
echo.
call "%~dp0rebuild-installer.bat"
exit

:update
cls
echo.
echo Updating and Rebuilding...
echo.
call "%~dp0update-and-rebuild.bat"
exit

:guide
cls
echo.
echo Opening Easy Start Guide...
echo.
start "" "%~dp0EASY-START.md"
echo.
echo Guide opened in your default markdown viewer.
echo If nothing opened, look for EASY-START.md in this folder.
echo.
pause
exit
