# Eunoia Atlas POC Bootstrap Script (PowerShell)
# This script sets up and tests the complete application

Write-Host "🚀 Starting Eunoia Atlas POC Bootstrap..." -ForegroundColor Green

# Check if Docker and Docker Compose are installed
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker is not installed. Please install Docker first." -ForegroundColor Red
    exit 1
}

if (-not (Get-Command docker-compose -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker Compose is not installed. Please install Docker Compose first." -ForegroundColor Red
    exit 1
}

# Create .env file from template
Write-Host "📝 Creating .env file from template..." -ForegroundColor Yellow
if (-not (Test-Path ".env")) {
    Copy-Item "env.template" ".env"
    Write-Host "✅ Created .env file" -ForegroundColor Green
} else {
    Write-Host "ℹ️  .env file already exists" -ForegroundColor Cyan
}

# Build and start services
Write-Host "🔨 Building and starting services..." -ForegroundColor Yellow
docker-compose up --build -d

# Wait for services to be ready
Write-Host "⏳ Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Test database connection
Write-Host "🗄️  Testing database connection..." -ForegroundColor Yellow
try {
    docker-compose exec db psql -U postgres -d eunoia -c "SELECT version();" | Out-Null
    Write-Host "✅ Database is ready" -ForegroundColor Green
} catch {
    Write-Host "❌ Database connection failed" -ForegroundColor Red
    exit 1
}

# Test API endpoints
Write-Host "🌐 Testing API endpoints..." -ForegroundColor Yellow

# Test totals endpoint
Write-Host "Testing /totals endpoint..." -ForegroundColor Yellow
try {
    Invoke-RestMethod -Uri "http://localhost:8000/totals" -Method Get | Out-Null
    Write-Host "✅ API is responding" -ForegroundColor Green
} catch {
    Write-Host "❌ API is not responding" -ForegroundColor Red
    exit 1
}

# Test donation endpoint
Write-Host "Testing /donate endpoint..." -ForegroundColor Yellow
try {
    $body = @{
        charity = "MEDA"
        cid = "test-cause"
        amount = 10.0
        donor_email = "test@example.com"
    } | ConvertTo-Json

    Invoke-RestMethod -Uri "http://localhost:8000/donate" -Method Post -Body $body -ContentType "application/json" | Out-Null
    Write-Host "✅ Donation endpoint is working" -ForegroundColor Green
} catch {
    Write-Host "❌ Donation endpoint failed" -ForegroundColor Red
}

# Test federated learning server
Write-Host "🤖 Testing federated learning server..." -ForegroundColor Yellow
try {
    Invoke-RestMethod -Uri "http://localhost:8080" -Method Get | Out-Null
    Write-Host "✅ FL server is responding" -ForegroundColor Green
} catch {
    Write-Host "ℹ️  FL server may still be starting up" -ForegroundColor Cyan
}

# Show service status
Write-Host "📊 Service Status:" -ForegroundColor Yellow
docker-compose ps

Write-Host ""
Write-Host "🎉 Bootstrap completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Available endpoints:" -ForegroundColor Cyan
Write-Host "  - API: http://localhost:8000"
Write-Host "  - FL Server: http://localhost:8080"
Write-Host "  - Database: localhost:5432"
Write-Host ""
Write-Host "🧪 Test commands:" -ForegroundColor Cyan
Write-Host "  - Get totals: curl http://localhost:8000/totals"
Write-Host "  - Make donation: curl -X POST http://localhost:8000/donate -H 'Content-Type: application/json' -d '{\"charity\": \"MEDA\", \"cid\": \"test\", \"amount\": 5.0}'"
Write-Host "  - View logs: docker-compose logs -f"
Write-Host ""
Write-Host "🛑 To stop services: docker-compose down" -ForegroundColor Yellow 