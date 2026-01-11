import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDL5NeNt3zdBgiZ4fgCiILw1yzTPOdyfyo",
  authDomain: "washq-b35cb.firebaseapp.com",
  projectId: "washq-b35cb",
  storageBucket: "washq-b35cb.firebasestorage.app",
  messagingSenderId: "254423670806",
  appId: "1:254423670806:web:67ea18365e8ec1d8741537"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Firestore with offline persistence
export const db = getFirestore(app);

// Enable offline persistence
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('Multiple tabs open, offline persistence disabled');
  } else if (err.code === 'unimplemented') {
    console.warn('Browser does not support offline persistence');
  }
});