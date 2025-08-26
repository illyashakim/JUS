#!/bin/bash

# Printer Monitor Startup Script
# This script starts both the backend and frontend services

echo "🚀 Starting Printer Monitor Application..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+ first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Function to cleanup background processes
cleanup() {
    echo "🛑 Shutting down services..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start Backend
echo "🔧 Starting Python Backend..."
cd backend

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install requirements if not already installed
if [ ! -f "venv/lib/python*/site-packages/flask" ]; then
    echo "📥 Installing Python dependencies..."
    pip install -r requirements.txt
fi

# Copy environment file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "⚙️  Creating environment configuration..."
    cp ../config/.env.example .env
    echo "⚠️  Please edit backend/.env with your configuration before starting"
fi

# Start backend in background
echo "🚀 Starting Flask backend on http://localhost:5000"
python app.py &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start Frontend
echo "🎨 Starting React Frontend..."
cd ../frontend

# Install dependencies if not already installed
if [ ! -d "node_modules" ]; then
    echo "📥 Installing Node.js dependencies..."
    npm install
fi

# Start frontend in background
echo "🚀 Starting React frontend on http://localhost:3000"
npm start &
FRONTEND_PID=$!

echo ""
echo "🎉 Printer Monitor is starting up!"
echo ""
echo "📊 Backend API: http://localhost:5000"
echo "🌐 Frontend UI: http://localhost:3000"
echo ""
echo "📝 To stop the application, press Ctrl+C"
echo ""

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID