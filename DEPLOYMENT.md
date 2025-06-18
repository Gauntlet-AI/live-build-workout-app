# Firebase Hosting Deployment Guide

## Setup Complete ✅

Your Firebase hosting has been configured with the following setup:

- **Project ID**: `live-build-workout`
- **Hosting URL**: `https://live-build-workout.firebaseapp.com`
- **Public Directory**: `public/`
- **Configuration**: Single Page Application (SPA) setup

## Files Created/Modified

1. **firebase.json** - Firebase hosting configuration
2. **`public/firebase-config.js`** - Client-side Firebase configuration
3. **package.json** - Added deployment scripts
4. **env.example** - Added Firebase environment variables
5. **public/index.html** - Updated to include Firebase config

## Environment Variables

Your Firebase configuration has been added to `env.example`. For security in production, you may want to use environment variables instead of hardcoded values in `firebase-config.js`.

```env
FIREBASE_API_KEY=AIzaSyBFJAcQcamd1k9HiDFWMIR8A_8YRVPx9Rg
FIREBASE_AUTH_DOMAIN=live-build-workout.firebaseapp.com
FIREBASE_PROJECT_ID=live-build-workout
FIREBASE_STORAGE_BUCKET=live-build-workout.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=769798208064
FIREBASE_APP_ID=1:769798208064:web:e05beddd690fef55b3fda5
```

## Deployment Commands

### Deploy to Firebase Hosting
```bash
npm run deploy
# or
firebase deploy --only hosting
```

### Test Locally with Firebase
```bash
npm run firebase:serve
# or
firebase serve
```

### Full Firebase Deploy
```bash
npm run firebase:deploy
# or
firebase deploy
```

## Current Architecture

- **Frontend**: Static files served from Firebase Hosting
- **Backend**: Node.js server (needs separate hosting for API)
- **Configuration**: SPA routing with fallback to index.html

## Next Steps

1. **Deploy the static frontend**:
   ```bash
   npm run deploy
   ```

2. **For the backend API**, you'll need to choose one of:
   - Firebase Functions (recommended for Firebase integration)
   - Deploy Node.js server separately (Railway, Render, etc.)
   - Keep running locally for development

3. **Update API endpoints** in `script.js` to point to your deployed backend

## Notes

- The current setup deploys only the static frontend
- Your Express server (`server.js`) is not included in Firebase hosting
- Firebase hosting is configured as an SPA with URL rewriting to `index.html`
- All routes will serve your main application page

## Troubleshooting

- If deployment fails, make sure you're logged into Firebase CLI: `firebase login`
- Verify your project ID matches in `.firebaserc`
- Check that all files in `public/` directory are ready for deployment 