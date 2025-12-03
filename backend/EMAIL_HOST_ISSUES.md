# 🔍 EMAIL_HOST Common Issues & Fixes

## ⚠️ Issues Found in Current Code

The email service now validates EMAIL_HOST, but here are common issues to watch for:

---

## ❌ Common EMAIL_HOST Problems

### 1. **Using Placeholder Values**
```env
# ❌ WRONG
EMAIL_HOST=your_host
EMAIL_HOST=smtp.example.com
```

**Fix:** Use real SMTP server:
```env
EMAIL_HOST=smtp.gmail.com
```

---

### 2. **Including Protocol Prefix**
```env
# ❌ WRONG
EMAIL_HOST=https://smtp.gmail.com
EMAIL_HOST=http://smtp.gmail.com
```

**Fix:** Remove protocol:
```env
EMAIL_HOST=smtp.gmail.com
```

---

### 3. **Common Typos**
```env
# ❌ WRONG - Common typos
EMAIL_HOST=smtp.gmial.com      # "gmial" instead of "gmail"
EMAIL_HOST=smtp.gmai.com       # Missing "l"
EMAIL_HOST=smtp.gmal.com       # Missing "i"
EMAIL_HOST=smtp.gmaiil.com     # Double "i"
```

**Fix:** Use correct spelling:
```env
EMAIL_HOST=smtp.gmail.com
```

---

### 4. **Trailing Slashes or Spaces**
```env
# ❌ WRONG
EMAIL_HOST=smtp.gmail.com/
EMAIL_HOST= smtp.gmail.com
EMAIL_HOST=smtp.gmail.com 
```

**Fix:** Remove trailing characters:
```env
EMAIL_HOST=smtp.gmail.com
```

---

### 5. **Wrong SMTP Server**
```env
# ❌ WRONG - Using webmail URL instead of SMTP
EMAIL_HOST=mail.gmail.com
EMAIL_HOST=gmail.com
EMAIL_HOST=www.gmail.com
```

**Fix:** Use SMTP server:
```env
EMAIL_HOST=smtp.gmail.com
```

---

## ✅ Correct EMAIL_HOST Examples

### Gmail
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
# OR
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
```

### Outlook/Hotmail
```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
```

### SendGrid
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
```

### Mailgun
```env
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
# OR
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=465
```

### Yahoo
```env
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
```

---

## 🔍 How to Verify Your EMAIL_HOST

### Step 1: Check Your Email Provider's SMTP Settings

**Gmail:**
- SMTP Server: `smtp.gmail.com`
- Port: `587` (TLS) or `465` (SSL)

**Outlook:**
- SMTP Server: `smtp-mail.outlook.com`
- Port: `587`

**Yahoo:**
- SMTP Server: `smtp.mail.yahoo.com`
- Port: `587`

### Step 2: Test Connection

Use the test endpoint:
```bash
GET /api/auth/test-email
```

**If you see:**
```json
{
  "success": false,
  "message": "Email connection failed: getaddrinfo ENOTFOUND smtp.gmial.com"
}
```

**Problem:** Typo in EMAIL_HOST (`gmial` instead of `gmail`)

**Fix:** Correct the typo in `.env` or Render Dashboard

---

## 🚨 Error Messages You Might See

### "getaddrinfo ENOTFOUND"
```
Error: getaddrinfo ENOTFOUND smtp.gmial.com
```

**Meaning:** Hostname not found (typo or wrong server)

**Fix:** Check EMAIL_HOST spelling

---

### "ECONNECTION"
```
Error: Connection failed
Code: ECONNECTION
```

**Meaning:** Can't connect to SMTP server

**Possible causes:**
- Wrong EMAIL_HOST
- Firewall blocking
- SMTP server down

**Fix:** Verify EMAIL_HOST is correct

---

### "ETIMEDOUT"
```
Error: Connection timeout
Code: ETIMEDOUT
```

**Meaning:** Connection timed out

**Possible causes:**
- Wrong EMAIL_HOST
- Network issues
- Firewall blocking port

**Fix:** Check EMAIL_HOST and network settings

---

## ✅ Validation Added to Code

The email service now checks for:

1. ✅ **Placeholder detection** - Warns if using `your_host` or `smtp.example.com`
2. ✅ **Protocol prefix check** - Warns if includes `http://` or `https://`
3. ✅ **Common typo detection** - Detects `gmial`, `gmai`, `gmal`, etc.
4. ✅ **Hostname format validation** - Validates basic hostname format
5. ✅ **Trimming** - Removes leading/trailing spaces

---

## 🎯 Quick Checklist

- [ ] EMAIL_HOST is a valid SMTP server (not placeholder)
- [ ] No protocol prefix (`http://` or `https://`)
- [ ] No trailing slashes or spaces
- [ ] Correct spelling (check for typos)
- [ ] Matches your email provider's SMTP settings

---

## 💡 Pro Tip

**Always check backend logs** - They now show exactly what's wrong with EMAIL_HOST:

```
⚠️  EMAIL_HOST typo detected!
   Current EMAIL_HOST: smtp.gmial.com
   Did you mean: smtp.gmail.com
   Fix the typo in your .env file
```

