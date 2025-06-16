#!/bin/bash

echo "🚀 Starting Content Creation App with TTS Backend"
echo "================================================"

# Function to cleanup background processes
cleanup() {
    echo ""
    echo "🛑 Shutting down servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set trap to cleanup on exit
trap cleanup SIGINT SIGTERM

# Start TTS Backend
echo "📡 Starting TTS Backend Server..."
cd tts-backend
npm start &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Check if backend started successfully
if ! curl -s http://localhost:3001/health > /dev/null; then
    echo "❌ Backend failed to start"
    exit 1
fi

echo "✅ Backend server running on http://localhost:3001"

# Go back to main directory
cd ..

# Start React Frontend
echo "🌐 Starting React Frontend..."
npm start &
FRONTEND_PID=$!

echo ""
echo "🎉 Both servers are starting!"
echo "🔗 Frontend: http://localhost:3000"
echo "🔗 Backend:  http://localhost:3001"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for both processes
wait