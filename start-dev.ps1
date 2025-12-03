# SmartSpend+ Development Server Startup Script
# This script starts both backend and frontend development servers

param(
    [switch]$KillExisting = $false
)

Write-Host "`n🚀 SmartSpend+ Development Server Startup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Kill existing Node processes if requested
if ($KillExisting) {
    Write-Host "`n🔄 Killing existing Node.js processes..." -ForegroundColor Yellow
    $nodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue
    if ($nodeProcesses) {
        $nodeProcesses | Stop-Process -Force
        Start-Sleep -Seconds 2
        Write-Host "✅ Existing processes terminated." -ForegroundColor Green
    }
}

# Check if we're in the correct directory
if (-not (Test-Path "backend") -or -not (Test-Path "frontend")) {
    Write-Host "❌ Error: backend or frontend directory not found!" -ForegroundColor Red
    Write-Host "   Please run this script from the project root directory." -ForegroundColor Yellow
    exit 1
}

# Check if .env exists
if (-not (Test-Path "backend\.env")) {
    Write-Host "`n⚠️  Warning: backend\.env file not found!" -ForegroundColor Yellow
    Write-Host "   Creating .env from env.example..." -ForegroundColor Yellow
    
    if (Test-Path "backend\env.example") {
        Copy-Item "backend\env.example" "backend\.env"
        Write-Host "✅ Created backend\.env file. Please configure it before continuing." -ForegroundColor Green
        Write-Host "   Opening backend\.env in notepad..." -ForegroundColor Cyan
        Start-Process notepad "backend\.env"
        Write-Host "`n   Press any key after configuring .env file..." -ForegroundColor Yellow
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    }
    else {
        Write-Host "❌ Error: backend\env.example file not found!" -ForegroundColor Red
        exit 1
    }
}

# Check if node_modules exist
if (-not (Test-Path "backend\node_modules")) {
    Write-Host "`n📦 Installing backend dependencies..." -ForegroundColor Yellow
    Set-Location backend
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install backend dependencies!" -ForegroundColor Red
        exit 1
    }
    Set-Location ..
}

if (-not (Test-Path "frontend\node_modules")) {
    Write-Host "`n📦 Installing frontend dependencies..." -ForegroundColor Yellow
    Set-Location frontend
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install frontend dependencies!" -ForegroundColor Red
        exit 1
    }
    Set-Location ..
}

# Get absolute paths
try {
    $backendPath = (Resolve-Path "backend").Path
    $frontendPath = (Resolve-Path "frontend").Path
}
catch {
    Write-Host "❌ Error resolving paths: $_" -ForegroundColor Red
    exit 1
}

# Start backend server
Write-Host ""
Write-Host "📦 Starting Backend Server..." -ForegroundColor Green
try {
    $backendCommand = "cd '$backendPath'; Write-Host 'Backend Server - Port 5000' -ForegroundColor Green; npm run dev"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCommand -ErrorAction Stop
    Write-Host "   ✅ Backend server window opened" -ForegroundColor Gray
}
catch {
    Write-Host "   ❌ Failed to start backend server: $_" -ForegroundColor Red
    exit 1
}

# Wait for backend to start
Write-Host "   Waiting for backend to initialize..." -ForegroundColor Gray
Start-Sleep -Seconds 4

# Start frontend server
Write-Host ""
Write-Host "🎨 Starting Frontend Server..." -ForegroundColor Green
try {
    $frontendCommand = "cd '$frontendPath'; Write-Host 'Frontend Server - Port 3000' -ForegroundColor Cyan; npm run dev"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendCommand -ErrorAction Stop
    Write-Host "   ✅ Frontend server window opened" -ForegroundColor Gray
}
catch {
    Write-Host "   ❌ Failed to start frontend server: $_" -ForegroundColor Red
    exit 1
}

# Display information
Write-Host "`n✅ Development servers are starting!" -ForegroundColor Cyan
Write-Host "`n📍 Server URLs:" -ForegroundColor White
Write-Host "   Backend:  http://localhost:5000" -ForegroundColor Green
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "`n💡 Tips:" -ForegroundColor Yellow
Write-Host "   - Each server runs in a separate PowerShell window" -ForegroundColor Gray
Write-Host "   - Press Ctrl+C in each window to stop the servers" -ForegroundColor Gray
Write-Host "   - Use .\kill-node.ps1 to kill all Node processes" -ForegroundColor Gray
Write-Host "   - Use -KillExisting flag to kill existing processes first" -ForegroundColor Gray
Write-Host "`n"



