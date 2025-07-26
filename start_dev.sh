#!/bin/bash

# ResearchPal Development Startup Script
# This script starts both the backend API server and frontend development server

echo "🚀 Starting ResearchPal Development Environment..."

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check if Python is installed
if ! command_exists python3; then
    echo "❌ Error: Python 3 is not installed. Please install Python 3.8+ and try again."
    exit 1
fi

# Check if Node.js is installed
if ! command_exists node; then
    echo "❌ Error: Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

# Check if npm is installed
if ! command_exists npm; then
    echo "❌ Error: npm is not installed. Please install npm and try again."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Check if Backend/.env exists
if [ ! -f "Backend/.env" ]; then
    echo "⚠️  Warning: Backend/.env file not found."
    echo "   Please create Backend/.env with the following variables:"
    echo "   OPENAI_API_KEY=your_openai_api_key_here"
    echo "   FIREWORKS_API_KEY=your_fireworks_api_key_here"
    echo "   MONGO_URI=your_mongodb_atlas_connection_string_here"
    echo ""
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Function to cleanup background processes on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

echo "📦 Installing frontend dependencies..."
npm install

echo "🐍 Setting up backend environment..."
cd Backend

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Verify virtual environment is activated
if [ -z "$VIRTUAL_ENV" ]; then
    echo "❌ Error: Failed to activate virtual environment"
    exit 1
fi

echo "✅ Virtual environment activated: $VIRTUAL_ENV"

# Install backend dependencies
echo "📦 Installing backend dependencies..."
python -m pip install -r requirements.txt

echo "🔧 Starting backend API server..."
python run_server.py &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 5

# Check if backend started successfully
if ! curl -s http://localhost:8000 > /dev/null 2>&1; then
    echo "❌ Error: Backend server failed to start. Check the logs above."
    echo "   Make sure your .env file is properly configured."
    exit 1
fi

echo "✅ Backend server started at http://localhost:8000"

# Go back to root directory
cd ..

echo "🌐 Starting frontend development server..."
npm run dev &
FRONTEND_PID=$!

# Wait a moment for frontend to start
sleep 3

echo "✅ Frontend server started at http://localhost:8080"
echo ""
echo "🎉 ResearchPal is now running!"
echo "   Frontend: http://localhost:8080"
echo "   Backend API: http://localhost:8000"
echo "   API Documentation: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for user to stop
wait 