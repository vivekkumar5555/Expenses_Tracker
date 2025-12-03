# 🔧 Esbuild Error Fix Guide

This guide helps fix common esbuild errors when building the React application.

## Common Esbuild Errors

### 1. "Cannot find module" or "Module resolution" errors

**Solution:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run build
```

### 2. Three.js / @react-three/fiber build errors

**Already Fixed:**
- Updated `vite.config.js` with proper esbuild configuration
- Added Three.js to optimizeDeps
- Configured manual chunks for better bundling

**If still having issues:**
```bash
# Clear Vite cache
rm -rf node_modules/.vite
npm run build
```

### 3. "Top-level await" errors

**Already Fixed:**
- Added `top-level-await` support in esbuildOptions

### 4. Build timeout or memory errors

**Solution:**
- The config now uses better chunking strategy
- Large dependencies are split into separate chunks
- If still having issues, increase Node memory:
  ```bash
  NODE_OPTIONS="--max-old-space-size=4096" npm run build
  ```

### 5. CommonJS/ESM module errors

**Already Fixed:**
- Added `transformMixedEsModules: true`
- Configured proper module handling

## Quick Fixes

### Fix 1: Clean Install
```bash
cd frontend
rm -rf node_modules dist .vite
npm install
npm run build
```

### Fix 2: Update Dependencies
```bash
cd frontend
npm update
npm run build
```

### Fix 3: Check Node Version
```bash
node --version  # Should be 18.x or higher
```

If using older version:
- Update Node.js to v18+ or use nvm:
  ```bash
  nvm install 18
  nvm use 18
  ```

### Fix 4: Render-Specific Fix

If building on Render and getting esbuild errors:

1. **Update Build Command:**
   ```
   npm ci && npm run build
   ```

2. **Add to Environment Variables:**
   ```
   NODE_ENV=production
   NODE_OPTIONS=--max-old-space-size=4096
   ```

## Configuration Changes Made

### vite.config.js Updates:
- ✅ Added esbuildOptions with proper target
- ✅ Added top-level-await support
- ✅ Improved chunking strategy
- ✅ Added esbuild minification config
- ✅ Better error handling with onwarn

### package.json Updates:
- ✅ Added esbuild as devDependency
- ✅ Ensured proper module type

## Testing the Fix

1. **Test Build Locally:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Check for Errors:**
   - Should complete without errors
   - Check `dist` folder is created
   - Verify all assets are generated

3. **Test Production Server:**
   ```bash
   npm start
   # Visit http://localhost:3000
   ```

## If Errors Persist

### Check Build Logs:
```bash
npm run build 2>&1 | tee build.log
```

### Common Issues:

**Issue:** "Error: spawn EACCES"
- **Fix:** `chmod +x node_modules/.bin/vite`

**Issue:** "Out of memory"
- **Fix:** Increase memory: `NODE_OPTIONS="--max-old-space-size=4096"`

**Issue:** "Cannot resolve '@react-three/fiber'"
- **Fix:** `npm install @react-three/fiber @react-three/drei three`

**Issue:** Build works locally but fails on Render
- **Fix:** Ensure Node version is 18+ in Render settings
- **Fix:** Use `npm ci` instead of `npm install` in build command

## Render Deployment Fix

If deploying to Render and getting esbuild errors:

### Update Build Command:
```
npm ci && npm run build
```

### Add Environment Variables:
```
NODE_ENV=production
NODE_OPTIONS=--max-old-space-size=4096
NODE_VERSION=18
```

### Verify Render Settings:
- **Node Version:** 18.x or higher
- **Build Command:** `npm ci && npm run build`
- **Start Command:** `npm start`

## Still Having Issues?

1. Check the exact error message
2. Review build logs in Render dashboard
3. Try building locally first
4. Check Node.js version compatibility
5. Verify all dependencies are installed

The configuration has been optimized for:
- ✅ Three.js compatibility
- ✅ Large bundle handling
- ✅ ES module support
- ✅ Production builds
- ✅ Render deployment

