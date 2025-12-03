# Test script to verify all PowerShell scripts work correctly

Write-Host "`n🧪 Testing PowerShell Scripts" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Check if scripts exist
Write-Host "📋 Checking script files..." -ForegroundColor Yellow
$scripts = @("setup.ps1", "start-dev.ps1", "stop-dev.ps1", "kill-node.ps1")

foreach ($script in $scripts) {
    if (Test-Path $script) {
        Write-Host "   ✅ $script exists" -ForegroundColor Green
    }
    else {
        Write-Host "   ❌ $script not found!" -ForegroundColor Red
    }
}

# Test 2: Check syntax
Write-Host "`n🔍 Checking script syntax..." -ForegroundColor Yellow
foreach ($script in $scripts) {
    if (Test-Path $script) {
        try {
            $null = [System.Management.Automation.PSParser]::Tokenize((Get-Content $script -Raw), [ref]$null)
            Write-Host "   ✅ $script syntax is valid" -ForegroundColor Green
        }
        catch {
            Write-Host "   ❌ $script has syntax errors: $_" -ForegroundColor Red
        }
    }
}

# Test 3: Check PowerShell version
Write-Host "`n🔍 Checking PowerShell version..." -ForegroundColor Yellow
$psVersion = $PSVersionTable.PSVersion
Write-Host "   PowerShell Version: $psVersion" -ForegroundColor White
if ($psVersion.Major -ge 5) {
    Write-Host "   ✅ PowerShell version is compatible" -ForegroundColor Green
}
else {
    Write-Host "   ⚠️  PowerShell 5.0+ recommended" -ForegroundColor Yellow
}

# Test 4: Check execution policy
Write-Host "`n🔍 Checking execution policy..." -ForegroundColor Yellow
$executionPolicy = Get-ExecutionPolicy
Write-Host "   Current Policy: $executionPolicy" -ForegroundColor White
if ($executionPolicy -eq "Restricted") {
    Write-Host "   ⚠️  Execution policy is Restricted" -ForegroundColor Yellow
    Write-Host "   Run: Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser" -ForegroundColor Gray
}
else {
    Write-Host "   ✅ Execution policy allows scripts" -ForegroundColor Green
}

# Test 5: Check Node.js
Write-Host "`n🔍 Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>$null
    if ($nodeVersion) {
        Write-Host "   ✅ Node.js $nodeVersion is installed" -ForegroundColor Green
    }
    else {
        Write-Host "   ❌ Node.js not found" -ForegroundColor Red
    }
}
catch {
    Write-Host "   ❌ Node.js not installed" -ForegroundColor Red
}

# Test 6: Check npm
Write-Host "`n🔍 Checking npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version 2>$null
    if ($npmVersion) {
        Write-Host "   ✅ npm $npmVersion is installed" -ForegroundColor Green
    }
    else {
        Write-Host "   ❌ npm not found" -ForegroundColor Red
    }
}
catch {
    Write-Host "   ❌ npm not installed" -ForegroundColor Red
}

# Test 7: Check project structure
Write-Host "`n🔍 Checking project structure..." -ForegroundColor Yellow
$requiredDirs = @("backend", "frontend")
foreach ($dir in $requiredDirs) {
    if (Test-Path $dir) {
        Write-Host "   ✅ $dir/ directory exists" -ForegroundColor Green
    }
    else {
        Write-Host "   ❌ $dir/ directory not found!" -ForegroundColor Red
    }
}

Write-Host "`n✅ Testing complete!" -ForegroundColor Green
Write-Host ""

