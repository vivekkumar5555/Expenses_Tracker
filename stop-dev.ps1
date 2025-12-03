# SmartSpend+ Development Server Stop Script
# This script stops all development servers gracefully

param(
    [switch]$Force = $false
)

Write-Host ""
Write-Host "🛑 Stopping SmartSpend+ Development Servers..." -ForegroundColor Yellow
Write-Host "===========================================" -ForegroundColor Yellow
Write-Host ""

# Get all Node.js processes
try {
    $nodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue
}
catch {
    Write-Host "❌ Error checking for Node.js processes: $_" -ForegroundColor Red
    exit 1
}

if ($nodeProcesses) {
    # Handle both single process and array
    if ($nodeProcesses -is [System.Array]) {
        $count = $nodeProcesses.Count
    }
    else {
        $count = 1
        $nodeProcesses = @($nodeProcesses)
    }
    
    Write-Host "   Found $count Node.js process(es)" -ForegroundColor White
    Write-Host ""
    
    if ($Force) {
        Write-Host "   Force killing all processes..." -ForegroundColor Yellow
        try {
            $nodeProcesses | Stop-Process -Force -ErrorAction Stop
            Write-Host "   ✅ All processes terminated." -ForegroundColor Green
        }
        catch {
            Write-Host "   ❌ Error: $_" -ForegroundColor Red
            exit 1
        }
    }
    else {
        # Try to stop gracefully first
        Write-Host "   Attempting graceful shutdown..." -ForegroundColor Cyan
        $stoppedCount = 0
        
        foreach ($process in $nodeProcesses) {
            try {
                Stop-Process -Id $process.Id -ErrorAction SilentlyContinue
                $stoppedCount++
            }
            catch {
                # Ignore errors for graceful shutdown
            }
        }
        
        # Wait a moment
        Start-Sleep -Seconds 2
        
        # Check if any processes are still running
        $remainingProcesses = Get-Process -Name node -ErrorAction SilentlyContinue
        
        if ($remainingProcesses) {
            Write-Host "   Some processes didn't stop gracefully, forcing termination..." -ForegroundColor Yellow
            try {
                if ($remainingProcesses -is [System.Array]) {
                    $remainingProcesses | Stop-Process -Force
                }
                else {
                    Stop-Process -Id $remainingProcesses.Id -Force
                }
            }
            catch {
                Write-Host "   ⚠️  Warning: Some processes may still be running" -ForegroundColor Yellow
            }
        }
        
        Write-Host "   ✅ Gracefully stopped $stoppedCount process(es)" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "✅ All development servers have been stopped." -ForegroundColor Green
}
else {
    Write-Host "ℹ️  No Node.js processes found running." -ForegroundColor Green
}

Write-Host ""

