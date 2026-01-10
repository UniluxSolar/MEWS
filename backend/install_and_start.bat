@echo off
echo Checking environment...

:: Check if npm is installed
call npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo npm is not installed or not in your PATH.
    echo Attempting to install Node.js LTS via winget...
    
    :: check for winget
    winget --version >nul 2>&1
    if %errorlevel% neq 0 (
        echo Error: Winget is not available. Please install Node.js manually from https://nodejs.org/
        pause
        exit /b 1
    )

    :: Install Node.js
    winget install OpenJS.NodeJS.LTS
    if %errorlevel% neq 0 (
        echo Error: Failed to install Node.js via winget.
        echo Please install Node.js manually from https://nodejs.org/
        pause
        exit /b 1
    )

    echo.
    echo Node.js installed successfully!
    echo [IMPORTANT] YOU MUST RESTART YOUR COMMAND PROMPT/TERMINAL NOW for changes to take effect.
    echo After restarting, run this script again.
    pause
    exit /b 0
)

echo npm is available.
echo.
echo Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo Error installing dependencies. Please check your internet connection or npm installation.
    pause
    exit /b %errorlevel%
)

echo.
echo Starting the server...
call npm start
pause
