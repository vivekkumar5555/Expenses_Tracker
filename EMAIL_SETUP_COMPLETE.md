# 📧 Complete Email Setup Guide

## ⚠️ Why You're Not Receiving Emails

If you're not receiving emails, check these common issues:

### 1. **Using Placeholder Values** ❌
```env
EMAIL_USER=your_email@gmail.com  # ❌ WRONG - This is a placeholder
EMAIL_PASS=your_app_password     # ❌ WRONG - This is a placeholder
```

**Fix:** Replace with your actual email and app password

### 2. **Using Regular Gmail Password** ❌
```env
EMAIL_PASS=your_regular_password  # ❌ WRONG - Won't work!
```

**Fix:** You MUST use a Gmail App Password (16 characters)

### 3. **Email Not Configured in Render** ❌
If deploying to Render, you MUST add environment variables in Render Dashboard.

---

## ✅ Step-by-Step Gmail Setup

### Step 1: Enable 2-Factor Authentication

1. Go to: https://myaccount.google.com/security
2. Under "Signing in to Google", click **2-Step Verification**
3. Follow the setup process
4. **This is REQUIRED** - App Passwords only work with 2FA enabled

### Step 2: Generate App Password

1. Go to: https://myaccount.google.com/apppasswords
   - Or: Google Account → Security → 2-Step Verification → App passwords
2. Select **Mail** from the dropdown
3. Select **Other (Custom name)**
4. Enter name: `SmartSpend`
5. Click **Generate**
6. **Copy the 16-character password** (it looks like: `abcd efgh ijkl mnop`)
   - Remove spaces when using: `abcdefghijklmnop`

### Step 3: Update Your .env File

**Local Development (.env):**
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_actual_email@gmail.com
EMAIL_PASS=abcdefghijklmnop
EMAIL_FROM=noreply@smartspend.com
```

**Important:**
- Use your **actual Gmail address** (not placeholder)
- Use the **16-character App Password** (not your regular password)
- Remove spaces from the App Password

### Step 4: For Render Deployment

1. Go to Render Dashboard → Your Backend Service
2. Click **Environment**
3. Add these variables:
   ```
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_actual_email@gmail.com
   EMAIL_PASS=abcdefghijklmnop
   EMAIL_FROM=noreply@smartspend.com
   ```
4. Click **Save Changes**
5. **Redeploy** your service (Render will restart automatically)

---

## 🧪 Test Email Configuration

### Test Locally

1. **Start your backend:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Test email connection:**
   ```bash
   curl http://localhost:5000/api/auth/test-email
   ```
   
   Should return:
   ```json
   {
     "success": true,
     "message": "Email connection verified successfully"
   }
   ```

3. **Test forgot password:**
   - Go to `/forgot-password`
   - Enter your email
   - Check your inbox (and spam folder)

### Test on Render

1. **Test email connection:**
   ```
   https://your-backend.onrender.com/api/auth/test-email
   ```
   
   Should return success if configured correctly

2. **Check backend logs:**
   - Render Dashboard → Backend Service → Logs
   - Look for: `✅ Email transporter created`
   - Look for: `✅ Email sent successfully!`

---

## 🔍 Troubleshooting

### Issue: "Authentication failed" (EAUTH)

**Cause:** Wrong password or not using App Password

**Solution:**
1. Make sure 2FA is enabled
2. Generate new App Password
3. Copy the 16-character password exactly (no spaces)
4. Update `.env` or Render environment variables
5. Restart server

### Issue: "Connection failed" (ECONNECTION)

**Cause:** Wrong EMAIL_HOST or EMAIL_PORT

**Solution:**
- For Gmail: `EMAIL_HOST=smtp.gmail.com` and `EMAIL_PORT=587`
- Check firewall/network settings
- Try port 465 with `secure: true`

### Issue: "Email not configured" warning

**Cause:** Missing environment variables

**Solution:**
1. Check `.env` file has all EMAIL_* variables
2. Check Render Dashboard has all EMAIL_* variables
3. Restart server after adding variables

### Issue: Email goes to Spam

**Solution:**
1. Check spam/junk folder
2. Add sender to contacts
3. Use a custom domain email (better deliverability)
4. Configure SPF/DKIM records (advanced)

---

## 📋 Quick Checklist

- [ ] 2FA enabled on Gmail account
- [ ] App Password generated (16 characters)
- [ ] `.env` file updated with real values (not placeholders)
- [ ] Render environment variables set (if deploying)
- [ ] Server restarted after .env changes
- [ ] Test endpoint returns success: `/api/auth/test-email`
- [ ] Check spam folder if email not received

---

## 🎯 Alternative: Use Email Service Providers

If Gmail doesn't work, try these:

### SendGrid (Free Tier: 100 emails/day)

```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=your_sendgrid_api_key
```

### Mailgun (Free Tier: 5,000 emails/month)

```env
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_USER=your_mailgun_username
EMAIL_PASS=your_mailgun_password
```

### Outlook/Hotmail

```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=your_email@outlook.com
EMAIL_PASS=your_password
```

---

## 💡 Important Notes

1. **OTP Code is Always Logged**
   - Even if email fails, OTP code is in backend logs
   - Check Render logs: `📧 [OTP CODE] 123456 for user@example.com`

2. **Email Sending is Non-Blocking**
   - Request completes even if email fails
   - OTP is saved in database regardless

3. **For Testing Without Email**
   - Check backend logs for OTP code
   - Use that code to reset password
   - Email is optional for development

---

## ✅ After Setup

1. **Test the flow:**
   ```
   /forgot-password → Enter email → Check inbox → Enter OTP → Reset password
   ```

2. **Verify in logs:**
   ```
   ✅ Email transporter created
   ✅ Email sent successfully!
   ```

3. **Check email inbox:**
   - Should receive email within 10-30 seconds
   - Check spam folder if not in inbox

---

**Your email should work now!** 🎉

