# ⚡ Quick Fix Checklist - Email Not Working

## 🚨 IMMEDIATE ACTIONS TO TAKE:

### 1. Test Email Configuration (30 seconds)
```
GET https://your-backend.onrender.com/api/test/email-config
```

**Check:** All values should be "SET", not "NOT SET"

---

### 2. Test Email Connection (30 seconds)
```
GET https://your-backend.onrender.com/api/test/email-test
```

**If fails:** Error message tells you exactly what's wrong

---

### 3. Check Backend Logs (1 minute)
1. Render Dashboard → Backend Service → Logs
2. Request password reset
3. Look for:
   - `✅ Email transporter created` ✅ Good
   - `⚠️ Email service not configured` ❌ Bad - fix config
   - `❌ Email sending failed!` ❌ Bad - check error message
   - `🔑 OTP Code: 123456` ✅ Always logged - use this code!

---

### 4. Verify Environment Variables

**Local (.env file):**
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=youractualemail@gmail.com    # REAL email, not placeholder
EMAIL_PASS=abcdefghijklmnop            # 16-char App Password, no spaces
EMAIL_FROM=noreply@smartspend.com
```

**Render (Dashboard → Environment):**
- Add all EMAIL_* variables
- Use REAL values (not placeholders)
- Save and redeploy

---

### 5. Get OTP Code from Logs

**Even if email fails, OTP is ALWAYS logged!**

Look for this in logs:
```
═══════════════════════════════════════════════════════
📧 PASSWORD RESET OTP - sendOTPEmail() CALLED
═══════════════════════════════════════════════════════
   OTP Code: 123456
═══════════════════════════════════════════════════════
```

**Use this code to reset password!**

---

## ✅ Checklist

- [ ] `/api/test/email-config` - All values SET?
- [ ] `/api/test/email-test` - Connection successful?
- [ ] Backend logs - Check for errors
- [ ] `.env` file - Real values (not placeholders)?
- [ ] Render Dashboard - All EMAIL_* variables set?
- [ ] Gmail App Password - Generated and used?
- [ ] Server restarted - After .env changes?
- [ ] Spam folder - Checked?

---

## 🎯 Most Likely Issues (90% of cases):

1. **Environment variables not set in Render Dashboard**
   - Fix: Add all EMAIL_* variables in Dashboard → Environment

2. **Using placeholder values**
   - Fix: Replace `your_email@gmail.com` with real email

3. **Using regular password instead of App Password**
   - Fix: Generate App Password at https://myaccount.google.com/apppasswords

4. **Email sent but in spam folder**
   - Fix: Check spam/junk folder

---

## 📞 Need Help?

1. **Check logs** - They show exactly what's wrong
2. **Use test endpoints** - `/api/test/email-config` and `/api/test/email-test`
3. **Get OTP from logs** - Even if email fails, code is logged
4. **See DEBUG_EMAIL.md** - Complete debugging guide

**The enhanced logging will tell you exactly what's wrong!** 🎯

