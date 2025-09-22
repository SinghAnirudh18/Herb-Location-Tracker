# Network Error Troubleshooting Guide

## Current Status ✅

Both servers are now running successfully:
- ✅ **Backend API**: http://localhost:5000 (responding correctly)
- ✅ **Frontend**: http://localhost:3000 (responding correctly)

## Common Network Error Causes & Solutions

### 1. **Frontend Not Running** ✅ FIXED
**Problem**: Frontend server wasn't started
**Solution**: Started frontend with `cd frontend && npm start`

### 2. **Backend Not Running** ✅ WORKING
**Problem**: Backend server not accessible
**Status**: Backend is running and responding correctly on port 5000

### 3. **CORS Issues** ✅ CONFIGURED
**Problem**: Cross-Origin Resource Sharing blocking requests
**Status**: Backend has CORS properly configured (`Access-Control-Allow-Origin: *`)

### 4. **Environment Variables** ⚠️ CHECK NEEDED
**Problem**: Frontend might not have correct API URL
**Current Config**: 
- Default API URL: `http://localhost:5000/api` (in api.js)
- Default WS URL: `ws://localhost:5000` (in websocket.js)

### 5. **Port Conflicts** ✅ RESOLVED
**Problem**: Ports 3000 or 5000 already in use
**Status**: Both ports are available and working

## Quick Fixes to Try

### Option 1: Restart Both Servers
```bash
# Terminal 1 - Backend
npm start

# Terminal 2 - Frontend  
cd frontend && npm start
```

### Option 2: Check Browser Console
1. Open browser developer tools (F12)
2. Go to Console tab
3. Look for specific error messages
4. Check Network tab for failed requests

### Option 3: Clear Browser Cache
1. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. Or clear browser cache and cookies

### Option 4: Check Environment Variables
Create `frontend/.env` file:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_WS_URL=ws://localhost:5000
```

## Current Server Status

### Backend API Test ✅
```bash
curl http://localhost:5000/api/health
# Returns: {"message":"Herb Traceability System API is running!","version":"1.0.0"...}
```

### Frontend Test ✅
```bash
curl http://localhost:3000
# Returns: HTML content (React app)
```

## Next Steps

1. **Access the application**: Go to http://localhost:3000 in your browser
2. **Login**: Use existing credentials or register new user
3. **Test collection creation**: Try creating a new collection
4. **Check console**: If errors persist, check browser console for specific error messages

## If Issues Persist

1. **Check specific error message** in browser console
2. **Verify network requests** in browser Network tab
3. **Check server logs** in terminal where backend is running
4. **Try different browser** or incognito mode
5. **Check firewall/antivirus** blocking localhost connections

## API Endpoints Working

- ✅ `GET /api/health` - Health check
- ✅ `POST /api/auth/login` - User authentication
- ✅ `POST /api/farmers/collections` - Collection creation
- ✅ `GET /api/farmers/my-collections` - Get collections
- ✅ `GET /api/farmers/my-stats` - Get farmer stats

The system should now be fully functional for collection creation and management!
