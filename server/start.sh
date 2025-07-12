#!/bin/bash

echo "🚀 Starting StackIt Backend Setup..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Check if MongoDB is running (optional check)
if command -v mongod &> /dev/null; then
    if pgrep -x "mongod" > /dev/null; then
        echo "✅ MongoDB is running"
    else
        echo "⚠️  MongoDB is not running. Please start MongoDB before running the server."
        echo "   You can start MongoDB with: mongod"
    fi
else
    echo "⚠️  MongoDB is not installed or not in PATH."
    echo "   Please install MongoDB and ensure it's running."
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "✅ .env file created. Please edit it with your configuration."
else
    echo "✅ .env file already exists"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your configuration"
echo "2. Start MongoDB if not already running"
echo "3. Run the server:"
echo "   - Development: npm run dev"
echo "   - Production: npm start"
echo ""
echo "The server will be available at: http://localhost:5000"
echo "API documentation: http://localhost:5000/api/health" 