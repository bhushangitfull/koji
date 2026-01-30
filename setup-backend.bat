@echo off
REM Backend Setup Script for Koji
REM Run this from the koji directory: C:\Users\Admin\koji

echo ========================================
echo Koji Backend Setup
echo ========================================

REM Create backend directory
if not exist backend (
    echo Creating backend directory...
    mkdir backend
) else (
    echo Backend directory already exists
)

cd backend

REM Initialize npm
echo.
echo Initializing npm project...
call npm init -y

REM Install production dependencies
echo.
echo Installing production dependencies...
call npm install express pg dotenv cors helmet uuid bcryptjs jsonwebtoken redis bull express-validator

REM Install dev dependencies
echo.
echo Installing dev dependencies...
call npm install -D typescript ts-node @types/express @types/node @types/uuid @types/bcryptjs @types/jsonwebtoken eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser jest @types/jest ts-jest

echo.
echo ========================================
echo Backend setup complete!
echo ========================================
echo.
echo Next steps:
echo 1. cd backend
echo 2. Create src directory: mkdir src
echo 3. Create configuration files
echo.
pause
