@echo off
echo Installing frontend dependencies...
call npm install
if %errorlevel% neq 0 (
    echo Error installing dependencies. Please check your internet connection or npm installation.
    pause
    exit /b %errorlevel%
)

echo.
echo Starting the frontend...
call npm run dev
pause
