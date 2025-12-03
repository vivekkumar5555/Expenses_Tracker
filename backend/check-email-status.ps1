# Check Email Status - PowerShell Script
# Run this to diagnose email issues

param(
    [string]$BackendUrl = "https://expenses-tracker-server-mvkm.onrender.com"
)

Write-Host ""
Write-Host "══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🔍 EMAIL STATUS CHECK - SmartSpend+" -ForegroundColor Cyan
Write-Host "══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "🔗 Backend URL: $BackendUrl" -ForegroundColor Yellow
Write-Host ""

# Function to test endpoint
function Test-Endpoint {
    param($Url, $Description)

    Write-Host "📡 Testing: $Description" -ForegroundColor White
    Write-Host "   URL: $Url" -ForegroundColor Gray

    try {
        $response = Invoke-WebRequest -Uri $Url -Method GET -TimeoutSec 10
        $json = $response.Content | ConvertFrom-Json

        if ($response.StatusCode -eq 200) {
            Write-Host "   ✅ SUCCESS" -ForegroundColor Green
            return $json
        } else {
            Write-Host "   ❌ FAILED (HTTP $($response.StatusCode))" -ForegroundColor Red
            return $null
        }
    } catch {
        Write-Host "   ❌ FAILED ($($_.Exception.Message))" -ForegroundColor Red
        return $null
    }
}

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host "📋 STEP 1: CHECKING EMAIL CONFIGURATION" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow

$config = Test-Endpoint "$BackendUrl/api/test/email-config" "Email Configuration"

if ($config) {
    Write-Host ""
    Write-Host "📊 Configuration Status:" -ForegroundColor White

    $allSet = $true
    foreach ($key in $config.config.PSObject.Properties.Name) {
        $value = $config.config.$key
        if ($value -eq "NOT SET") {
            Write-Host "   ❌ $key = $value" -ForegroundColor Red
            $allSet = $false
        } else {
            Write-Host "   ✅ $key = $value" -ForegroundColor Green
        }
    }

    if (-not $allSet) {
        Write-Host ""
        Write-Host "🚨 PROBLEM: Some email variables are not set!" -ForegroundColor Red
        Write-Host ""
        Write-Host "🔧 FIX:" -ForegroundColor Yellow
        Write-Host "   1. Go to Render Dashboard → Backend Service" -ForegroundColor White
        Write-Host "   2. Click 'Environment' tab" -ForegroundColor White
        Write-Host "   3. Add missing EMAIL_* variables" -ForegroundColor White
        Write-Host "   4. Save and redeploy" -ForegroundColor White
        Write-Host ""
        Write-Host "   Required variables:" -ForegroundColor Cyan
        Write-Host "   - EMAIL_HOST = smtp.gmail.com" -ForegroundColor White
        Write-Host "   - EMAIL_PORT = 587" -ForegroundColor White
        Write-Host "   - EMAIL_USER = your_email@gmail.com" -ForegroundColor White
        Write-Host "   - EMAIL_PASS = your_16_char_app_password" -ForegroundColor White
        Write-Host "   - EMAIL_FROM = noreply@smartspend.com" -ForegroundColor White
    } else {
        Write-Host ""
        Write-Host "✅ All email variables are configured!" -ForegroundColor Green
    }
} else {
    Write-Host ""
    Write-Host "❌ Could not check email configuration" -ForegroundColor Red
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host "📋 STEP 2: TESTING EMAIL CONNECTION" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow

$connection = Test-Endpoint "$BackendUrl/api/test/email-test" "Email Connection"

if ($connection) {
    if ($connection.success) {
        Write-Host ""
        Write-Host "✅ Email connection is working!" -ForegroundColor Green
        Write-Host "   $($connection.message)" -ForegroundColor White
        Write-Host ""
        Write-Host "🎉 Your email should work! If not, check spam folder." -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "❌ Email connection failed!" -ForegroundColor Red
        Write-Host "   Error: $($connection.message)" -ForegroundColor White
        Write-Host ""
        Write-Host "🔧 Common fixes:" -ForegroundColor Yellow

        if ($connection.message -like "*Invalid login*") {
            Write-Host "   • Use Gmail App Password instead of regular password" -ForegroundColor White
            Write-Host "   • Generate: https://myaccount.google.com/apppasswords" -ForegroundColor White
            Write-Host "   • Copy 16-character password (no spaces)" -ForegroundColor White
        } elseif ($connection.message -like "*ENOTFOUND*") {
            Write-Host "   • Check EMAIL_HOST spelling (common: smtp.gmial.com)" -ForegroundColor White
            Write-Host "   • Should be: smtp.gmail.com" -ForegroundColor White
        } else {
            Write-Host "   • Check all EMAIL_* variables are set correctly" -ForegroundColor White
            Write-Host "   • Check backend logs for detailed error" -ForegroundColor White
        }
    }
} else {
    Write-Host ""
    Write-Host "❌ Could not test email connection" -ForegroundColor Red
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host "📋 STEP 3: CHECK BACKEND LOGS MANUALLY" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow

Write-Host ""
Write-Host "🔍 Go to Render Dashboard → Backend Service → Logs" -ForegroundColor White
Write-Host ""
Write-Host "📧 Request password reset from your app, then look for:" -ForegroundColor White
Write-Host ""
Write-Host "✅ If email is working:" -ForegroundColor Green
Write-Host "   📧 PASSWORD RESET OTP - sendOTPEmail() CALLED" -ForegroundColor White
Write-Host "   ✅ Email transporter created" -ForegroundColor White
Write-Host "   ✅ Email sent successfully!" -ForegroundColor White
Write-Host ""
Write-Host "❌ If email is NOT working:" -ForegroundColor Red
Write-Host "   ⚠️ Email service not configured" -ForegroundColor White
Write-Host "   ❌ Email sending failed!" -ForegroundColor White
Write-Host ""
Write-Host "🎯 IMPORTANT: OTP code is ALWAYS logged, even if email fails:" -ForegroundColor Yellow
Write-Host "   ═══════════════════════════════════════════════════════" -ForegroundColor White
Write-Host "   📧 PASSWORD RESET OTP" -ForegroundColor White
Write-Host "   ═══════════════════════════════════════════════════════" -ForegroundColor White
Write-Host "      OTP Code: 123456" -ForegroundColor White
Write-Host "   ═══════════════════════════════════════════════════════" -ForegroundColor White
Write-Host ""
Write-Host "💡 Use the OTP code from logs to reset password!" -ForegroundColor Cyan

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host "📋 NEXT STEPS" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow

Write-Host ""
Write-Host "1. Fix any issues shown above" -ForegroundColor White
Write-Host "2. If email still doesn't work:" -ForegroundColor White
Write-Host "   • Check spam folder" -ForegroundColor White
Write-Host "   • Use OTP code from backend logs" -ForegroundColor White
Write-Host "   • Generate new Gmail App Password" -ForegroundColor White
Write-Host "3. Test again with this script" -ForegroundColor White
Write-Host ""

Write-Host "🎯 Run this script again after fixing issues:" -ForegroundColor Yellow
Write-Host "   .\check-email-status.ps1" -ForegroundColor White
Write-Host ""

Write-Host "══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🔧 Need help? Check DEBUG_EMAIL.md or QUICK_FIX_CHECKLIST.md" -ForegroundColor Cyan
Write-Host "══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
