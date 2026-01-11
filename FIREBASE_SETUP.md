# Firebase Firestore Integration Guide

## Overview

The washQ project has been integrated with **Firebase Firestore** with **offline persistence enabled**. This enables:

✅ Cloud data synchronization
✅ Offline-first architecture with automatic sync
✅ User authentication via Firebase Auth
✅ Real-time data updates
✅ No internet required - works fully offline

## Setup Instructions

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **"Create a project"**
3. Enter project name: `washq` (or your preferred name)
4. Follow the setup wizard
5. Enable Google Analytics (optional)

### 2. Register a Web App

1. In Firebase Console, click the **Web** icon (</>) to add a web app
2. Register app with nickname: `washQ Web`
3. Copy the Firebase config (you'll need this next)

### 3. Enable Firestore Database

1. In Firebase Console, navigate to **Firestore Database**
2. Click **Create database**
3. Choose region closest to your users
4. Select **Start in test mode** (for development)
5. Accept the default rules (will secure later for production)

### 4. Enable Firebase Authentication

1. Navigate to **Authentication**
2. Click **Get started**
3. Enable **Email/Password** provider
4. Optionally enable **Google** sign-in

### 5. Configure Environment Variables

1. Copy `.env.example` to `.env.local`
2. Fill in your Firebase config values:

```bash
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=1:your_app_id
```

### 6. Install Dependencies

Dependencies are already installed:
- `firebase` - Firebase SDK
- `qrcode.react` - QR code generation

### 7. Initialize Data (Optional)

To pre-populate your Firestore with sample machines:

**Option A: Via Firebase Console**

1. Go to Firestore Database
2. Create collection `machines`
3. Add documents with this structure:

```json
{
  "id": "m1",
  "name": "Washer #1",
  "status": "available",
  "createdAt": "2024-01-11T00:00:00Z"
}
```

**Option B: Via Firestore Rules & Test Data**

Run the following in Firebase Console terminal:

```javascript
// Add test machines
db.collection("machines").add({
  name: "Washer #1",
  status: "available",
  createdAt: firebase.firestore.FieldValue.serverTimestamp()
});
```

## Firestore Data Structure

### Collections

#### `machines/`
Stores washing machine data
```
machines/
  ├── m1
  │   ├── name: "Washer #1"
  │   ├── status: "available" | "running" | "waiting" | "out-of-order"
  │   ├── timeRemaining: 30 (minutes, optional)
  │   ├── queueCount: 1 (optional)
  │   └── createdAt: Timestamp
```

#### `bookings/`
Stores user machine bookings
```
bookings/
  ├── booking_id_1
  │   ├── userId: "firebase_uid"
  │   ├── userEmail: "user@example.com"
  │   ├── machineId: "m1"
  │   ├── startTime: Timestamp
  │   └── createdAt: Timestamp
```

#### `users/`
Stores user profile and role information
```
users/
  ├── firebase_uid
  │   ├── uid: "firebase_uid"
  │   ├── email: "user@example.com"
  │   ├── role: "user" | "admin"
  │   ├── displayName: "User Name" (optional)
  │   └── createdAt: Timestamp
```

#### `feedback/`
Stores user feedback and support tickets
```
feedback/
  ├── feedback_id_1
  │   ├── userId: "firebase_uid"
  │   ├── userEmail: "user@example.com"
  │   ├── subject: "issue" | "suggestion" | "other"
  │   ├── message: "User feedback text"
  │   └── createdAt: Timestamp
```

## Authentication Flow

### Sign Up
1. User enters email and password on Login page
2. Firebase creates account if user doesn't exist
3. User role ("user" or "admin") is set during sign-up
4. User document created in Firestore with role info

### Sign In
1. User enters email and password
2. Firebase authenticates via `signInWithEmailAndPassword`
3. App fetches user role from Firestore
4. Loads user's active booking (if any)

### Logout
1. `signOut()` clears Firebase auth state
2. Local state reset

## Offline Persistence

The app enables Firestore **offline persistence** automatically:

```typescript
// From src/config/firebase.ts
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    // Multiple tabs open, persistence disabled
  } else if (err.code === 'unimplemented') {
    // Browser doesn't support IndexedDB
  }
});
```

### How It Works

1. **Offline**: All data reads served from local IndexedDB cache
2. **Writes**: Changes queued locally and persisted to Firestore
3. **Online**: Changes automatically sync to Firestore servers
4. **Conflict Resolution**: Latest write wins (Firestore handles merges)

### Testing Offline Mode

**Browser DevTools:**
1. Open DevTools (F12)
2. Go to **Network** tab
3. Click **Offline** checkbox
4. App continues working with cached data
5. Go back **Online**
6. Changes automatically sync

## Booking System with Firestore

### User Booking Flow

1. User scans QR code → navigates to `/machine/:id`
2. Click "Book Now" → creates document in `bookings` collection
3. Single booking constraint enforced:
   - Query existing bookings for current user
   - Block booking if one exists
4. Machine status updated to "waiting"
5. On offline: booking cached locally, synced when online

### Admin Functions

**View Bookings:**
- Reads from `bookings` collection
- Displays user email, machine ID, booking time

**Clear Booking:**
- Deletes booking document from Firestore
- Updates machine status back to "available"

## Migration from Mock Data

### AppContext Changes

**Before (Mock):**
```typescript
const [machines, setMachines] = useState(initialMachines);
const login = (credentials) => { /* mock */ };
```

**After (Firebase):**
```typescript
const [machines, setMachines] = useState([]);
const login = async (credentials) => {
  await signInWithEmailAndPassword(auth, email, password);
  // Creates user in Firestore
};
```

### Async Operations

All data mutations are now **async**:
- `login(credentials)` → `await login(credentials)`
- `addMachine()` → `await addMachine()`
- `bookMachine()` → `await bookMachine()`
- `updateMachineStatus()` → `await updateMachineStatus()`

## Production Deployment

### 1. Set Up Firestore Security Rules

Replace default test rules in Firebase Console:

```firebase_rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Machines - read by all, write by admin only
    match /machines/{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth.token.role == 'admin';
    }

    // Bookings - users can create/delete own, admins read all
    match /bookings/{document=**} {
      allow read: if request.auth.token.role == 'admin';
      allow create, delete: if request.auth.uid == resource.data.userId;
    }

    // Users - read own, admin reads all
    match /users/{uid} {
      allow read, write: if request.auth.uid == uid || request.auth.token.role == 'admin';
    }

    // Feedback - read by admin only
    match /feedback/{document=**} {
      allow read: if request.auth.token.role == 'admin';
      allow create: if request.auth != null;
    }
  }
}
```

### 2. Set Custom Claims for Admin Role

Use Firebase Admin SDK to set admin role:

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login and initialize
firebase login
firebase init

# Set custom claim for admin user
firebase auth:import admin_users.json --hash-algo=scrypt
```

### 3. Deploy to Hosting

```bash
firebase deploy --only hosting
```

### 4. Monitor & Debug

- **Firebase Console**: View real-time database activity
- **Cloud Functions**: Set up triggers for automation
- **Analytics**: Monitor user behavior

## Common Issues & Solutions

### Issue: "Firebase is not initialized"
**Solution:** Ensure `.env.local` has correct Firebase config values

### Issue: "Offline persistence failed"
**Solution:** Browser doesn't support IndexedDB. Use modern browser (Chrome, Firefox, Safari, Edge)

### Issue: "User not found" on login
**Solution:** First login creates account automatically

### Issue: "Multiple tabs - persistence disabled"
**Solution:** Normal behavior. Use single tab or clear IndexedDB in other tabs

### Issue: "Cannot write to Firestore"
**Solution:** Check Firestore security rules. In test mode, all writes allowed

## Firestore Pricing

- **Free Tier (Spark)**: 
  - 1GB storage included
  - 50k reads/day
  - 20k writes/day
  - Good for testing/hobby projects

- **Paid Tier (Blaze)**:
  - Pay per operation
  - Unlimited storage (scale as needed)
  - Better for production

For a washing machine app, typical usage is very low. Spark plan usually sufficient.

## Useful Links

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firebase Auth Documentation](https://firebase.google.com/docs/auth)
- [Offline Persistence Guide](https://firebase.google.com/docs/firestore/manage-data/enable-offline)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)

## Next Steps

1. Create Firebase project and complete setup
2. Fill in `.env.local` with Firebase config
3. Add initial machine data to Firestore
4. Test offline functionality
5. Deploy to production when ready

Happy washing! 🧼
