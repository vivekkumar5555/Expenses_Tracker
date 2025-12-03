# ⚡ Email Not Working? Quick Fix Guide

## 🚨 Most Common Issues (90% of cases)

### Issue #1: Using Placeholder Values ❌
```env
EMAIL_USER=your_email@gmail.com     # ❌ WRONG!
EMAIL_PASS=your_app_password        # ❌ WRONG!
```

**Fix:** Replace with your REAL email and App Password

---

### Issue #2: Using Regular Gmail Password ❌
```env
EMAIL_PASS=myregularpassword123     # ❌ WRONG!
```

**Fix:** 
1. Enable 2FA: https://myaccount.google.com/security
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Copy 16-character password (remove spaces)
4. Use that password

---

### Issue #3: Not Set in Render Dashboard ❌
- `.env` works locally ✅
- But Render doesn't use `.env` file ❌

**Fix:**
1. Render Dashboard → Backend Service → Environment
2. Add all EMAIL_* variables
3. Save and redeploy

---

## ✅ Quick Fix Steps

### Step 1: Check What's Wrong
```bash
# Test email connection
curl https://your-backend.onrender.com/api/auth/test-email
```

**If it says `"success": false`** → Email not configured correctly

**If it says `"success": true`** → Email configured, check spam folder

---

### Step 2: Check Backend Logs

**On Render:**
1. Dashboard → Backend Service → Logs
2. Request password reset
3. Look for:

**✅ Good:**
```
✅ Email transporter created
✅ Email sent successfully!
```

**❌ Bad:**
```
⚠️  Email service not configured
❌ Email sending failed! Error: Invalid login
```

---

### Step 3: Fix Your .env File

**Correct format:**
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=youractualemail@gmail.com        # Your REAL Gmail
EMAIL_PASS=abcdefghijklmnop                 # 16-char App Password (no spaces!)
EMAIL_FROM=noreply@smartspend.com
```

**Common mistakes:**
- ❌ `EMAIL_USER=your_email@gmail.com` (placeholder)
- ❌ `EMAIL_PASS=your_app_password` (placeholder)
- ❌ `EMAIL_PASS=abcd efgh ijkl mnop` (has spaces)
- ❌ `EMAIL_PASS=myregularpassword` (not App Password)

---

### Step 4: For Render - Add Environment Variables

1. Go to: Render Dashboard → Your Backend Service
2. Click **Environment** tab
3. Add these (one by one):
   ```
   EMAIL_HOST = smtp.gmail.com
   EMAIL_PORT = 587
   EMAIL_USER = youractualemail@gmail.com
   EMAIL_PASS = abcdefghijklmnop
   EMAIL_FROM = noreply@smartspend.com
   ```
4. Click **Save Changes**
5. Service will auto-restart

---

## 🔍 What to Check in Logs

### If you see this:
```
⚠️  Email service not configured.
   Missing: { EMAIL_HOST: 'NOT SET', ... }
```
**Problem:** Environment variables not set  
**Fix:** Add EMAIL_* variables to .env or Render Dashboard

---

### If you see this:
```
⚠️  Email service using placeholder values!
```
**Problem:** Using "your_email@gmail.com" or "your_app_password"  
**Fix:** Replace with real values

---

### If you see this:
```
❌ Email sending failed!
   Error: Invalid login
   Code: EAUTH
```
**Problem:** Wrong password or not using App Password  
**Fix:** Generate new Gmail App Password

---

### If you see this:
```
✅ Email sent successfully!
```
**Problem:** Email sent but not received  
**Fix:** Check spam folder, verify email address

---

## 💡 Pro Tip: OTP Code is Always Logged

Even if email fails, check backend logs for:

```
═══════════════════════════════════════════════════════
📧 PASSWORD RESET OTP
═══════════════════════════════════════════════════════
   Email: user@example.com
   OTP Code: 123456
═══════════════════════════════════════════════════════
```

**You can use this code even if email doesn't arrive!**

---

## ✅ Checklist

- [ ] `.env` has REAL values (not placeholders)
- [ ] Using Gmail App Password (16 chars, no spaces)
- [ ] Render Dashboard has all EMAIL_* variables
- [ ] Server restarted after .env changes
- [ ] Test endpoint returns `"success": true`
- [ ] Checked spam folder
- [ ] Checked backend logs for errors

---

## 🆘 Still Not Working?

1. **Check logs** - They tell you exactly what's wrong
2. **Test endpoint** - `/api/auth/test-email` shows connection status  
3. **Get OTP from logs** - Even if email fails, code is logged
4. **Try different provider** - SendGrid, Mailgun, etc.

**See `EMAIL_DIAGNOSTIC_COMPLETE.md` for full details on all 8 categories of issues!**

