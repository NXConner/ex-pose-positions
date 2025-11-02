/**
 * Environment variable validation and configuration
 */

interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

interface EnvConfig {
  firebase: FirebaseConfig | null;
  features: {
    partner: boolean;
    tonight: boolean;
  };
  isDevelopment: boolean;
  isProduction: boolean;
}

function validateFirebaseConfig(): FirebaseConfig | null {
  const required = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID',
  ] as const;

  const missing = required.filter(key => !import.meta.env[key]);
  
  if (missing.length > 0) {
    if (import.meta.env.DEV) {
      console.warn('⚠️ Missing Firebase environment variables:', missing.join(', '));
      console.warn('Firebase features will be disabled. Create a .env file with required variables.');
    }
    return null;
  }

  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY!,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN!,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID!,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET!,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID!,
    appId: import.meta.env.VITE_FIREBASE_APP_ID!,
  };
}

export const env: EnvConfig = {
  firebase: validateFirebaseConfig(),
  features: {
    partner: import.meta.env.VITE_FEATURE_PARTNER !== 'false',
    tonight: import.meta.env.VITE_FEATURE_TONIGHT !== 'false',
  },
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
};

// Validate at build time in production
if (import.meta.env.PROD && !env.firebase) {
  console.error('❌ Firebase configuration is required for production builds!');
}

