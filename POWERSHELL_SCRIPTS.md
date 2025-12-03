# 🔧 PowerShell Scripts Guide

This project includes several PowerShell scripts to help with development.

## 📋 Available Scripts

### 1. `setup.ps1` - Initial Project Setup
Sets up the entire development environment.

**Usage:**
```powershell
.\setup.ps1
```

**What it does:**
- ✅ Checks Node.js and npm installation
- ✅ Checks PostgreSQL installation
- ✅ Creates `.env` file from `env.example`
- ✅ Installs backend dependencies
- ✅ Installs frontend dependencies

**Run this first** when setting up the project!

---

### 2. `start-dev.ps1` - Start Development Servers
Starts both backend and frontend development servers.

**Usage:**
```powershell
# Start servers normally
.\start-dev.ps1

# Kill existing processes first, then start
.\start-dev.ps1 -KillExisting
```

**What it does:**
- ✅ Checks for `.env` file (creates from example if missing)
- ✅ Checks for `node_modules` (installs if missing)
- ✅ Starts backend server in a new window
- ✅ Starts frontend server in a new window
- ✅ Displays server URLs and tips

**Features:**
- Automatically creates `.env` if missing
- Installs dependencies if needed
- Opens `.env` in Notepad for configuration
- Uses absolute paths for reliability

---

### 3. `stop-dev.ps1` - Stop Development Servers
Gracefully stops all development servers.

**Usage:**
```powershell
.\stop-dev.ps1
```

**What it does:**
- ✅ Finds all Node.js processes
- ✅ Attempts graceful shutdown first
- ✅ Forces termination if needed
- ✅ Shows status messages

**Better than `kill-node.ps1`** because it tries graceful shutdown first.

---

### 4. `kill-node.ps1` - Force Kill All Node Processes
Immediately terminates all Node.js processes (use with caution).

**Usage:**
```powershell
.\kill-node.ps1
```

**What it does:**
- ✅ Finds all Node.js processes
- ✅ Shows process details (PID, CPU, Memory)
- ✅ Force kills all processes
- ✅ Shows confirmation message

**Use when:**
- Servers are frozen/unresponsive
- Need to quickly clear all Node processes
- `stop-dev.ps1` didn't work

---

## 🚀 Quick Start Workflow

### First Time Setup:
```powershell
# 1. Run setup script
.\setup.ps1

# 2. Configure backend\.env file
notepad backend\.env

# 3. Run database migrations
cd backend
npm run prisma:migrate
cd ..

# 4. Start development servers
.\start-dev.ps1
```

### Daily Development:
```powershell
# Start servers
.\start-dev.ps1

# When done, stop servers
.\stop-dev.ps1
```

### If Servers Get Stuck:
```powershell
# Force kill all Node processes
.\kill-node.ps1

# Then restart
.\start-dev.ps1
```

---

## ⚙️ PowerShell Execution Policy

If you get an execution policy error, run:

```powershell
# Check current policy
Get-ExecutionPolicy

# Allow scripts for current user (recommended)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Or allow scripts for current session only
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
```

---

## 🐛 Troubleshooting

### Script won't run
**Error:** "cannot be loaded because running scripts is disabled"

**Solution:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Servers won't start
**Check:**
1. Are ports 3000 and 5000 available?
2. Is `.env` file configured correctly?
3. Are dependencies installed? (`npm install` in both folders)

### Can't find Node.js
**Error:** "Node.js is not installed"

**Solution:**
- Install Node.js from [nodejs.org](https://nodejs.org/)
- Restart PowerShell after installation
- Verify with: `node --version`

### Processes won't stop
**Solution:**
```powershell
# Use force kill
.\kill-node.ps1

# Or manually
Get-Process -Name node | Stop-Process -Force
```

---

## 📝 Script Features

### `start-dev.ps1` Features:
- ✅ Auto-creates `.env` from example
- ✅ Auto-installs missing dependencies
- ✅ Opens `.env` in Notepad if created
- ✅ Uses absolute paths (works from any location)
- ✅ Shows helpful tips and URLs
- ✅ Supports `-KillExisting` flag

### `kill-node.ps1` Features:
- ✅ Shows process details before killing
- ✅ Error handling
- ✅ Clear status messages
- ✅ Safe to run (checks if processes exist)

### `stop-dev.ps1` Features:
- ✅ Graceful shutdown attempt
- ✅ Force termination if needed
- ✅ Better than force kill

### `setup.ps1` Features:
- ✅ Checks all prerequisites
- ✅ Auto-installs dependencies
- ✅ Creates `.env` file
- ✅ Shows next steps

---

## 💡 Tips

1. **Use `stop-dev.ps1`** instead of `kill-node.ps1` when possible (more graceful)

2. **Use `-KillExisting` flag** if you have stuck processes:
   ```powershell
   .\start-dev.ps1 -KillExisting
   ```

3. **Check server windows** - Each server runs in its own PowerShell window

4. **Use Ctrl+C** in server windows to stop individual servers

5. **Run `setup.ps1`** after pulling new changes that add dependencies

---

## 🔗 Related Files

- `backend\.env` - Backend configuration (created by setup script)
- `backend\env.example` - Backend configuration template
- `package.json` - Project dependencies (both frontend and backend)

---

## 📞 Need Help?

- Check server logs in the PowerShell windows
- Verify `.env` configuration
- Check if ports are available
- Review error messages in the script output

Happy coding! 🚀

