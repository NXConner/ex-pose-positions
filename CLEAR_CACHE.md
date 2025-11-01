# How to Clear Browser Cache & Service Worker

## Quick Fix (Recommended)
1. **Open DevTools** (Press F12)
2. Go to **Application** tab (Chrome/Edge) or **Storage** tab (Firefox)
3. Click **"Clear site data"** or **"Clear storage"**
4. Check all boxes and click **"Clear site data"**
5. Go to **Service Workers** section
6. Click **"Unregister"** on any registered service workers
7. **Hard refresh**: Press `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)

## Alternative: Incognito/Private Window
- Open a new Incognito/Private window
- Navigate to `http://localhost:4173/`
- This bypasses all cache and service workers

## If Still Having Issues
1. Stop the dev server (`Ctrl+C`)
2. Delete `dist` folder if it exists
3. Restart: `npm run dev`
4. Use a fresh browser window

## What Changed
- Base path changed from `/random-sex-position/` to `/`
- Service worker cache version updated to `v2`
- All assets now load from root path `/`

