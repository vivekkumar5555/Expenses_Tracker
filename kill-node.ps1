# Script to kill all Node.js processes (use with caution)
# This script safely terminates all Node.js processes

Write-Host "`n🔍 Searching for Node.js processes..." -ForegroundColor Cyan

# Get all Node.js processes
$nodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue

if ($nodeProcesses) {
    $count = $nodeProcesses.Count
    Write-Host "   Found $count Node.js process(es)" -ForegroundColor Yellow
    
    # Display processes before killing
    Write-Host "`n   Processes to terminate:" -ForegroundColor White
    $nodeProcesses | ForEach-Object {
        Write-Host "   - PID: $($_.Id) | CPU: $([math]::Round($_.CPU, 2))s | Memory: $([math]::Round($_.WorkingSet64 / 1MB, 2)) MB" -ForegroundColor Gray
    }
    
    Write-Host "`n⚠️  Killing all Node.js processes..." -ForegroundColor Yellow
    
    try {
        $nodeProcesses | Stop-Process -Force -ErrorAction Stop
        Write-Host "✅ All Node.js processes have been terminated successfully." -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Error terminating processes: $_" -ForegroundColor Red
        exit 1
    }
}
else {
    Write-Host "ℹ️  No Node.js processes found running." -ForegroundColor Green
}

Write-Host ""



