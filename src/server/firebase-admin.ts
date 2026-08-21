import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import path from 'path';
import { readFileSync } from 'fs';

// Load the service account credentials from Environment Variable (Vercel production) or local JSON file (dev)
let serviceAccount: any;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    const envVal = process.env.FIREBASE_SERVICE_ACCOUNT.trim();
    // Handle base64 encoded or direct raw JSON string
    if (envVal.startsWith('{')) {
      serviceAccount = JSON.parse(envVal);
    } else {
      const decoded = Buffer.from(envVal, 'base64').toString('utf-8');
      serviceAccount = JSON.parse(decoded);
    }
  } catch (err) {
    console.error('❌ Failed to parse FIREBASE_SERVICE_ACCOUNT environment variable:', err);
  }
}

if (!serviceAccount) {
  try {
    const serviceAccountPath = path.resolve(
      process.cwd(),
      'velora-store-5f44c-firebase-adminsdk-fbsvc-1ad61a2d7b.json'
    );
    serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
  } catch (err) {
    console.error('❌ Failed to load Firebase service account key from file:', err);
  }
}

// Initialize Firebase Admin (only if serviceAccount is available)
if (getApps().length === 0 && serviceAccount) {
  try {
    initializeApp({
      credential: cert(serviceAccount),
    });
  } catch (err) {
    console.error('❌ Failed to initialize Firebase Admin app:', err);
  }
}

// Export auth and firestore instances (or null if not configured)
export const adminAuth = getApps().length > 0 ? getAuth() : null;
export const db = getApps().length > 0 ? getFirestore() : null;

