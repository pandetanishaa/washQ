import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import {
  getFirestore,
  connectFirestoreEmulator,
  enableIndexedDbPersistence,
} from 'firebase/firestore';

// Firebase configuration
// Using environment variables for production deployment
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDemoKey',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'washq-demo.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'washq-demo',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'washq-demo.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789:web:abcdef123456',
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Firestore with offline persistence
export const db = getFirestore(app);

// Enable offline persistence for Firestore
// This allows the app to work offline and automatically sync when reconnected
/*enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    // Multiple tabs open
    console.warn('Multiple tabs open, offline persistence disabled');
  } else if (err.code === 'unimplemented') {
    // Browser doesn't support offline persistence
    console.warn('Browser does not support offline persistence');
  }
});*/

/**
 * Firebase Firestore Collections Structure:
 *
 * machines/
 *   ├── {machineId}
 *   │   ├── id: string
 *   │   ├── name: string
 *   │   ├── status: "available" | "running" | "waiting" | "out-of-order"
 *   │   ├── location: string (optional)
 *   │   └── createdAt: Timestamp
 *
 * bookings/
 *   ├── {bookingId}
 *   │   ├── id: string
 *   │   ├── userId: string
 *   │   ├── machineId: string
 *   │   ├── userEmail: string
 *   │   ├── startTime: Timestamp
 *   │   └── createdAt: Timestamp
 *
 * users/
 *   ├── {userId}
 *   │   ├── uid: string
 *   │   ├── email: string
 *   │   ├── role: "user" | "admin"
 *   │   ├── displayName: string (optional)
 *   │   └── createdAt: Timestamp
 *
 * feedback/
 *   ├── {feedbackId}
 *   │   ├── id: string
 *   │   ├── userId: string
 *   │   ├── userEmail: string
 *   │   ├── subject: "Issue" | "Suggestion" | "Other"
 *   │   ├── message: string
 *   │   └── createdAt: Timestamp
 */
