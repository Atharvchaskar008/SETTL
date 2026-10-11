@echo off
echo ========================================================
echo   Starting MilestoneVault Staged Escrow Application
echo ========================================================
echo.
echo Opening http://localhost:3000 in your browser...
start http://localhost:3000
echo.
node server/src/index.js
pause
