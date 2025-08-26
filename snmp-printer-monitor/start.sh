#!/bin/bash

# SNMP Printer Monitor Startup Script

echo "🖨️  Starting SNMP Printer Monitor..."

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "Checking prerequisites..."

if ! command_exists python3; then
    echo "❌ Python 3 is required but not installed."
    exit 1
fi

if ! command_exists node; then
    echo "❌ Node.js is required but not installed."
    exit 1
fi

if ! command_exists npm; then
    echo "❌ npm is required but not installed."
    exit 1
fi

echo "✅ Prerequisites check passed."

# Start backend
echo "🔧 Starting backend server..."
cd backend

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies if needed
if [ ! -f ".deps_installed" ]; then
    echo "Installing Python dependencies..."
    pip install -r requirements.txt
    touch .deps_installed
fi

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file from example..."
    cp .env.example .env
fi

# Start backend in background
echo "Starting Flask server on port 5000..."
python app.py &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend
echo "🎨 Starting frontend server..."
cd ../frontend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing Node.js dependencies..."
    npm install
fi

# Start frontend
echo "Starting React development server on port 3000..."
npm start &
FRONTEND_PID=$!

# Function to cleanup on exit
cleanup() {
    echo "🛑 Shutting down servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ Servers stopped."
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup INT TERM EXIT

echo ""
echo "🚀 SNMP Printer Monitor is now running!"
echo "📊 Frontend: http://localhost:3000"
echo "🔧 Backend:  http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop both servers."
echo ""

# Wait for both processes
wait