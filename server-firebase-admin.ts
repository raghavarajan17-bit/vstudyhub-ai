import { cert, getApps, initializeApp, getApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

function getFirebaseAdminApp() {
  if (getApps().length > 0) {
    return getApp();
  }

  const encoded = process.env.FIREBASE_SERVICE_ACCOUNT;

  if (!encoded) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT is not configured.');
  }

  const serviceAccount = JSON.parse(
    Buffer.from(encoded, 'base64').toString('utf8')
  );

  return initializeApp({
    credential: cert(serviceAccount),
  });
}

const app = getFirebaseAdminApp();

export const adminAuth = getAuth(app);
export const adminDb = getFirestore(app, 'ai-studio-vstudyhubjeeneet-550e4eae-7373-46d6-aff9-9555e855856e');
