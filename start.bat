@echo off
REM Printer SNMP Monitor - Windows Startup Script

echo Starting Printer SNMP Monitor...
echo ==================================

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python is not installed or not in PATH
    echo Please install Python 3.7 or higher
    pause
    exit /b 1
)

REM Check Python version
for /f "tokens=2" %%i in ('python --version 2^>^&1') do set PYTHON_VERSION=%%i
echo Python version: %PYTHON_VERSION%

REM Check if virtual environment exists
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Check if requirements are installed
if not exist "venv\Lib\site-packages\flask" (
    echo Installing dependencies...
    pip install -r requirements.txt
)

REM Check if .env file exists
if not exist ".env" (
    echo Creating .env file from template...
    copy .env.example .env
    echo Please edit .env file with your configuration before running again.
    echo Press any key to continue anyway...
    pause >nul
)

REM Start the application
echo Starting application...
echo Access the web interface at: http://localhost:5000
echo Press Ctrl+C to stop
echo.

python app.py

pause