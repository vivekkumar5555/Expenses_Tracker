# SmartSpend+ Project Setup Script
# This script sets up the development environment

Write-Host "`n🔧 SmartSpend+ Project Setup" -ForegroundColor Cyan
Write-Host "===========================" -ForegroundColor Cyan

# Check Node.js installation
Write-Host "`n📦 Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "   ✅ Node.js $nodeVersion is installed" -ForegroundColor Green
    
    # Check if version is 18 or higher
    $majorVersion = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
    if ($majorVersion -lt 18) {
        Write-Host "   ⚠️  Warning: Node.js 18+ is recommended" -ForegroundColor Yellow
    }
}
catch {
    Write-Host "   ❌ Node.js is not installed!" -ForegroundColor Red
    Write-Host "   Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Check npm
Write-Host "`n📦 Checking npm installation..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "   ✅ npm $npmVersion is installed" -ForegroundColor Green
}
catch {
    Write-Host "   ❌ npm is not installed!" -ForegroundColor Red
    exit 1
}

# Check PostgreSQL (optional)
Write-Host "`n🗄️  Checking PostgreSQL installation..." -ForegroundColor Yellow
try {
    $pgVersion = psql --version 2>$null
    if ($pgVersion) {
        Write-Host "   ✅ PostgreSQL is installed" -ForegroundColor Green
    }
    else {
        Write-Host "   ⚠️  PostgreSQL not found in PATH (may still be installed)" -ForegroundColor Yellow
    }
}
catch {
    Write-Host "   ⚠️  PostgreSQL not found in PATH" -ForegroundColor Yellow
    Write-Host "   You'll need PostgreSQL for the backend to work" -ForegroundColor Gray
}

# Setup backend
Write-Host "`n📦 Setting up backend..." -ForegroundColor Yellow
if (Test-Path "backend") {
    Set-Location backend
    
    # Create .env from example if it doesn't exist
    if (-not (Test-Path ".env")) {
        if (Test-Path "env.example") {
            Copy-Item "env.example" ".env"
            Write-Host "   ✅ Created .env file from env.example" -ForegroundColor Green
            Write-Host "   ⚠️  Please configure backend\.env with your database credentials" -ForegroundColor Yellow
        }
    }
    
    # Install dependencies
    Write-Host "   Installing backend dependencies..." -ForegroundColor Gray
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Backend dependencies installed" -ForegroundColor Green
    }
    else {
        Write-Host "   ❌ Failed to install backend dependencies" -ForegroundColor Red
        Set-Location ..
        exit 1
    }
    
    Set-Location ..
}
else {
    Write-Host "   ❌ Backend directory not found!" -ForegroundColor Red
    exit 1
}

# Setup frontend
Write-Host "`n🎨 Setting up frontend..." -ForegroundColor Yellow
if (Test-Path "frontend") {
    Set-Location frontend
    
    # Install dependencies
    Write-Host "   Installing frontend dependencies..." -ForegroundColor Gray
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Frontend dependencies installed" -ForegroundColor Green
    }
    else {
        Write-Host "   ❌ Failed to install frontend dependencies" -ForegroundColor Red
        Set-Location ..
        exit 1
    }
    
    Set-Location ..
}
else {
    Write-Host "   ❌ Frontend directory not found!" -ForegroundColor Red
    exit 1
}

# Summary
Write-Host "`n✅ Setup complete!" -ForegroundColor Green
Write-Host "`n📝 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Configure backend\.env with your database credentials" -ForegroundColor White
Write-Host "   2. Run database migrations: cd backend && npm run prisma:migrate" -ForegroundColor White
Write-Host "   3. Start development servers: .\start-dev.ps1" -ForegroundColor White
Write-Host "`n"

