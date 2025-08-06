#!/bin/bash

# Eunoia Atlas POC Bootstrap Script
# This script sets up and tests the complete application

set -e  # Exit on any error

echo "🚀 Starting Eunoia Atlas POC Bootstrap..."

# Check if Docker and Docker Compose are installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create .env file from template
echo "📝 Creating .env file from template..."
if [ ! -f .env ]; then
    cp env.template .env
    echo "✅ Created .env file"
else
    echo "ℹ️  .env file already exists"
fi

# Build and start services
echo "🔨 Building and starting services..."
docker-compose up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Test database connection
echo "🗄️  Testing database connection..."
docker-compose exec db psql -U postgres -d eunoia -c "SELECT version();" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Database is ready"
else
    echo "❌ Database connection failed"
    exit 1
fi

# Test API endpoints
echo "🌐 Testing API endpoints..."

# Test health endpoint
echo "Testing /totals endpoint..."
curl -s http://localhost:8000/totals > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ API is responding"
else
    echo "❌ API is not responding"
    exit 1
fi

# Test donation endpoint
echo "Testing /donate endpoint..."
curl -s -X POST http://localhost:8000/donate \
  -H "Content-Type: application/json" \
  -d '{"charity": "MEDA", "cid": "test-cause", "amount": 10.0, "donor_email": "test@example.com"}' > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Donation endpoint is working"
else
    echo "❌ Donation endpoint failed"
fi

# Test federated learning server
echo "🤖 Testing federated learning server..."
curl -s http://localhost:8080 > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ FL server is responding"
else
    echo "ℹ️  FL server may still be starting up"
fi

# Show service status
echo "📊 Service Status:"
docker-compose ps

echo ""
echo "🎉 Bootstrap completed successfully!"
echo ""
echo "📋 Available endpoints:"
echo "  - API: http://localhost:8000"
echo "  - FL Server: http://localhost:8080"
echo "  - Database: localhost:5432"
echo ""
echo "🧪 Test commands:"
echo "  - Get totals: curl http://localhost:8000/totals"
echo "  - Make donation: curl -X POST http://localhost:8000/donate -H 'Content-Type: application/json' -d '{\"charity\": \"MEDA\", \"cid\": \"test\", \"amount\": 5.0}'"
echo "  - View logs: docker-compose logs -f"
echo ""
echo "🛑 To stop services: docker-compose down" 