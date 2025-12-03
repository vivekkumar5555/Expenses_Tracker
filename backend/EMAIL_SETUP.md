# 📧 Email Configuration Guide

## For Forgot Password to Work

The forgot password feature requires email configuration. If email is not configured, the OTP code will be logged in the server console.

### Option 1: Use Gmail (Recommended for Testing)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password:**
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Enter "SmartSpend" as the name
   - Copy the 16-character password

3. **Update `.env` file:**
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_16_character_app_password
EMAIL_FROM=noreply@smartspend.com
```

### Option 2: Use Other SMTP Providers

**SendGrid:**
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=your_sendgrid_api_key
```

**Mailgun:**
```env
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_USER=your_mailgun_username
EMAIL_PASS=your_mailgun_password
```

**Outlook/Hotmail:**
```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=your_email@outlook.com
EMAIL_PASS=your_password
```

### Option 3: Skip Email (For Testing)

If you don't configure email, the OTP code will be logged in the server console:

```
📧 [OTP CODE] 123456 for user@example.com
⚠️  [EMAIL NOT CONFIGURED] OTP Code: 123456
```

**Check your backend logs on Render to see the OTP code!**

---

## Troubleshooting

### Email Not Sending?

1. **Check Environment Variables:**
   - Make sure all EMAIL_* variables are set in Render Dashboard
   - Check for typos in EMAIL_HOST, EMAIL_USER, EMAIL_PASS

2. **Check Logs:**
   - Backend logs will show email errors
   - Look for "Email sending error" messages

3. **Gmail Issues:**
   - Make sure you're using App Password, not regular password
   - Enable "Less secure app access" if App Password doesn't work
   - Check if 2FA is enabled

4. **Test Connection:**
   - Try sending a test email from Node.js
   - Check firewall/network restrictions

---

## For Render Deployment

Add these environment variables in Render Dashboard:

1. Go to your backend service
2. Settings → Environment
3. Add:
   - `EMAIL_HOST`
   - `EMAIL_PORT`
   - `EMAIL_USER`
   - `EMAIL_PASS`
   - `EMAIL_FROM`

---

## Important Notes

- **OTP codes are always logged** in server console for debugging
- **Email sending is non-blocking** - request completes even if email fails
- **OTP is saved in database** - you can verify it there too
- **Check backend logs** on Render to see OTP codes if email isn't working

