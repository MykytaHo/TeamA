@echo off
echo Installing dependencies for my-app...
cd my-app
call npm install
echo.
echo Starting development server...
call npm run dev
pause
