@echo off
echo Resetting password for VillageAdmin1...
call node reset_password.js
if %errorlevel% neq 0 (
    echo.
    echo Error: Could not reset password.
    echo Trying to seed database instead...
    call node seedAdmins.js
)
echo.
echo Done. Try logging in with 'VillageAdmin1' and 'admin123'.
pause
