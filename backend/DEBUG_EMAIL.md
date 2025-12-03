# 🔍 Debug Email Issues - Step by Step Guide

## ⚠️ You're Not Getting OTP Emails? Follow These Steps:

---

## Step 1: Check Email Configuration Status

**Test endpoint:** `GET /api/test/email-config`

**Local:**
```bash
curl http://localhost:5000/api/test/email-config
```

**Render:**
```
https://your-backend.onrender.com/api/test/email-config
```

**Expected response:**
```json
{
  "message": "Email configuration status",
  "config": {
    "EMAIL_HOST": "SET",
    "EMAIL_PORT": "587",
    "EMAIL_USER": "SET",
    "EMAIL_PASS": "SET (hidden)",
    "EMAIL_FROM": "SET"
  },
  "note": "Check if all values are SET (not NOT SET)"
}
```

**If any value shows "NOT SET":**
- Add missing environment variables in `.env` (local) or Render Dashboard (production)
- Restart server after adding variables

---

## Step 2: Test Email Connection

**Test endpoint:** `GET /api/test/email-test`

**Local:**
```bash
curl http://localhost:5000/api/test/email-test
```

**Render:**
```
https://your-backend.onrender.com/api/test/email-test
```

**Expected response (success):**
```json
{
  "success": true,
  "message": "Email connection verified successfully"
}
```

**Expected response (failure):**
```json
{
  "success": false,
  "message": "Email connection failed: Invalid login",
  "error": "Invalid login"
}
```

**If connection fails:**
- Check error message - it tells you exactly what's wrong
- Common errors:
  - `Invalid login` → Wrong password or not using App Password
  - `getaddrinfo ENOTFOUND` → Wrong EMAIL_HOST
  - `Connection timeout` → Network/firewall issue

---

## Step 3: Check Backend Logs

**On Render:**
1. Go to Render Dashboard → Your Backend Service
2. Click **Logs** tab
3. Request password reset
4. Look for these messages:

### ✅ Good Signs:
```
📧 Password reset request received
✅ User found: [user-id]
🔐 Generated OTP code
💾 OTP saved to database successfully
🔑 OTP Code: 123456
📧 Attempting to send OTP email to: user@example.com
📧 PASSWORD RESET OTP - sendOTPEmail() CALLED
✅ Email transporter created
✅ Email sent successfully!
```

### ❌ Bad Signs:
```
⚠️  Email service not configured.
   Missing: { EMAIL_HOST: 'NOT SET', ... }
```

OR

```
⚠️  [EMAIL NOT CONFIGURED - OTP CODE BELOW]
═══════════════════════════════════════════════════════
   OTP Code: 123456
   Email: user@example.com
═══════════════════════════════════════════════════════
```

OR

```
❌ Email sending failed!
   Error: Invalid login
   Code: EAUTH
```

---

## Step 4: Verify Your .env File

**Check your `.env` file has these (with REAL values):**

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=youractualemail@gmail.com        # NOT "your_email@gmail.com"
EMAIL_PASS=abcdefghijklmnop                 # 16-char App Password (no spaces)
EMAIL_FROM=noreply@smartspend.com
```

**Common mistakes:**
- ❌ Using placeholder values (`your_email@gmail.com`)
- ❌ Using regular password instead of App Password
- ❌ App Password with spaces
- ❌ Wrong EMAIL_HOST (typo like `smtp.gmial.com`)

---

## Step 5: For Render - Check Environment Variables

**Render doesn't use `.env` file!**

1. Go to Render Dashboard → Your Backend Service
2. Click **Environment** tab
3. Verify these variables exist:
   - `EMAIL_HOST`
   - `EMAIL_PORT`
   - `EMAIL_USER`
   - `EMAIL_PASS`
   - `EMAIL_FROM`
4. Check for typos in variable names
5. Make sure values are correct (not placeholders)
6. **Save and redeploy** (or restart service)

---

## Step 6: Get OTP Code from Logs

**Even if email fails, OTP code is ALWAYS logged!**

Look in backend logs for:
```
═══════════════════════════════════════════════════════
📧 PASSWORD RESET OTP - sendOTPEmail() CALLED
═══════════════════════════════════════════════════════
   Email: user@example.com
   OTP Code: 123456
═══════════════════════════════════════════════════════
```

**You can use this code to reset password even if email doesn't arrive!**

---

## Step 7: Test the Full Flow

1. **Request password reset:**
   ```
   POST /api/auth/forgot-password
   Body: { "email": "your-email@example.com" }
   ```

2. **Check logs** - Should see:
   - OTP code generated
   - OTP saved to database
   - Email sending attempt

3. **Check email inbox** (and spam folder)

4. **If email doesn't arrive:**
   - Get OTP code from logs
   - Use it to verify: `POST /api/auth/verify-otp`

---

## 🚨 Common Issues & Fixes

### Issue: "Email service not configured"
**Fix:** Add EMAIL_* variables to `.env` or Render Dashboard

### Issue: "Invalid login" (EAUTH)
**Fix:** 
- Generate Gmail App Password: https://myaccount.google.com/apppasswords
- Use 16-character password (no spaces)
- Update EMAIL_PASS

### Issue: "getaddrinfo ENOTFOUND"
**Fix:** Check EMAIL_HOST spelling (common typo: `gmial` instead of `gmail`)

### Issue: Email sent but not received
**Fix:**
- Check spam folder
- Verify email address is correct
- Check email provider isn't blocking

---

## ✅ Quick Checklist

- [ ] `/api/test/email-config` shows all values as "SET"
- [ ] `/api/test/email-test` returns `"success": true`
- [ ] Backend logs show `✅ Email transporter created`
- [ ] Backend logs show `✅ Email sent successfully!` OR OTP code is logged
- [ ] `.env` file has real values (not placeholders)
- [ ] Render Dashboard has all EMAIL_* variables set
- [ ] Server restarted after .env changes
- [ ] Checked spam folder

---

## 📞 Still Not Working?

1. **Check backend logs** - They show exactly what's happening
2. **Use test endpoints** - `/api/test/email-config` and `/api/test/email-test`
3. **Get OTP from logs** - Even if email fails, code is logged
4. **Share logs** - The logs will show the exact error

**The improved logging will tell you exactly what's wrong!** 🎯

