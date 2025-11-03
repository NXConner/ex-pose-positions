/**
 * Environment variable validation and configuration
 * Enhanced with runtime validation and comprehensive error handling
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
    analytics: boolean;
    notifications: boolean;
  };
  isDevelopment: boolean;
  isProduction: boolean;
  appVersion: string;
}

type EnvKey = 
  | 'VITE_FIREBASE_API_KEY'
  | 'VITE_FIREBASE_AUTH_DOMAIN'
  | 'VITE_FIREBASE_PROJECT_ID'
  | 'VITE_FIREBASE_STORAGE_BUCKET'
  | 'VITE_FIREBASE_MESSAGING_SENDER_ID'
  | 'VITE_FIREBASE_APP_ID';

interface ValidationResult {
  valid: boolean;
  missing: EnvKey[];
  invalid: Array<{ key: EnvKey; reason: string }>;
}

function validateFirebaseConfig(): ValidationResult {
  const required: EnvKey[] = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID',
  ];

  const missing = required.filter(key => !import.meta.env[key]) as EnvKey[];
  const invalid: Array<{ key: EnvKey; reason: string }> = [];

  // Validate format of present values
  if (import.meta.env.VITE_FIREBASE_PROJECT_ID && !/^[a-z0-9-]+$/.test(import.meta.env.VITE_FIREBASE_PROJECT_ID)) {
    invalid.push({ key: 'VITE_FIREBASE_PROJECT_ID', reason: 'Invalid project ID format' });
  }

  if (import.meta.env.VITE_FIREBASE_API_KEY && import.meta.env.VITE_FIREBASE_API_KEY.length < 20) {
    invalid.push({ key: 'VITE_FIREBASE_API_KEY', reason: 'API key too short' });
  }

  return {
    valid: missing.length === 0 && invalid.length === 0,
    missing,
    invalid
  };
}

function getFirebaseConfig(): FirebaseConfig | null {
  const validation = validateFirebaseConfig();
  
  if (!validation.valid) {
    if (import.meta.env.DEV) {
      if (validation.missing.length > 0) {
        console.warn('⚠️ Missing Firebase environment variables:', validation.missing.join(', '));
        console.warn('Firebase features will be disabled. Create a .env file with required variables.');
      }
      if (validation.invalid.length > 0) {
        console.error('❌ Invalid Firebase environment variables:');
        validation.invalid.forEach(({ key, reason }) => {
          console.error(`  - ${key}: ${reason}`);
        });
      }
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
  firebase: getFirebaseConfig(),
  features: {
    partner: import.meta.env.VITE_FEATURE_PARTNER !== 'false',
    tonight: import.meta.env.VITE_FEATURE_TONIGHT !== 'false',
    analytics: import.meta.env.VITE_FEATURE_ANALYTICS !== 'false',
    notifications: import.meta.env.VITE_FEATURE_NOTIFICATIONS !== 'false',
  },
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  appVersion: import.meta.env.npm_package_version || __APP_VERSION__ || '1.0.0',
};

// Validate at build time in production
if (import.meta.env.PROD && !env.firebase) {
  const error = new Error('Firebase configuration is required for production builds!');
  console.error('❌', error.message);
  // In production, throw error to prevent deployment with missing config
  if (typeof window === 'undefined') {
    throw error;
  }
}

// Runtime validation helper
export function validateEnv(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (import.meta.env.PROD && !env.firebase) {
    errors.push('Firebase configuration is missing');
  }

  const validation = validateFirebaseConfig();
  if (!validation.valid) {
    validation.missing.forEach(key => {
      errors.push(`Missing: ${key}`);
    });
    validation.invalid.forEach(({ key, reason }) => {
      errors.push(`Invalid ${key}: ${reason}`);
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

