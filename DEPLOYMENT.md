# Deployment Guide

## ✅ Setup Complete

- **Firebase Project**: `ex-pose-positions`
- **GitHub Repository**: https://github.com/NXConner/ex-pose-positions
- **Live App URL**: https://ex-pose-positions.web.app
- **Automatic Deployments**: Configured via GitHub Actions

## Deployment Status

### Automatic Deployment (GitHub Actions)
- **Trigger**: Every push to `main` branch
- **Workflow**: `.github/workflows/ci.yml`
- **Status**: Monitor at https://github.com/NXConner/ex-pose-positions/actions

### Manual Deployment
```bash
# Build the app
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

## Setup Verification Checklist

- [x] Firebase project created (`ex-pose-positions`)
- [x] Firebase project linked (`.firebaserc`)
- [x] Hosting configured (`firebase.json`)
- [x] GitHub repository created
- [x] Code pushed to GitHub
- [x] CI/CD workflow configured
- [ ] Firebase service account secret added to GitHub (`FIREBASE_SERVICE_ACCOUNT`)
- [ ] First deployment successful

## Troubleshooting

### If automatic deployment fails:

1. **Check GitHub Actions logs**
   - Go to: https://github.com/NXConner/ex-pose-positions/actions
   - Click on the failed workflow run
   - Check the `deploy` job logs

2. **Common issues:**
   - Missing `FIREBASE_SERVICE_ACCOUNT` secret → Add it in GitHub Secrets
   - Invalid JSON format → Ensure complete service account JSON
   - Permission errors → Verify service account has hosting permissions

3. **Manual deployment as backup:**
   ```bash
   npm run build
   firebase deploy --only hosting
   ```

## Firebase Service Account Setup

1. Go to: https://console.firebase.google.com/project/ex-pose-positions/settings/serviceaccounts/adminsdk
2. Click "Generate new private key"
3. Save the JSON file
4. Add to GitHub: https://github.com/NXConner/ex-pose-positions/settings/secrets/actions
   - Name: `FIREBASE_SERVICE_ACCOUNT`
   - Value: Paste entire JSON content

## Next Steps

1. ✅ Wait for first deployment to complete
2. ✅ Visit https://ex-pose-positions.web.app to verify
3. ✅ Make future changes - they'll auto-deploy!
4. ⚠️ Remember to set up Firebase environment variables (`.env`) for local development

## Environment Variables

Create `.env` file for local development:
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=ex-pose-positions.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=ex-pose-positions
VITE_FIREBASE_STORAGE_BUCKET=ex-pose-positions.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

Get these values from: https://console.firebase.google.com/project/ex-pose-positions/settings/general

