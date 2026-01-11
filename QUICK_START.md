# Quick Start Guide - Firebase Integration

## 🎯 What Changed

Your washQ project has been fully integrated with **Firebase Firestore** with **offline persistence enabled**. The app now:

✅ Uses Firebase Authentication (email/password)
✅ Stores all data in Firestore (machines, bookings, users, feedback)
✅ Works completely offline with automatic sync
✅ Generates downloadable QR code stickers for machines

## 📋 Quick Setup (10 minutes)

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create a Project" → name it "washq"
3. Enable Google Analytics (optional)

### 2. Create Web App
1. Click **</>** (web icon) in Firebase Console
2. Register app as "washQ"
3. **Copy the config** (you'll need this)

### 3. Create Firestore Database
1. Click **Firestore Database**
2. Create database → Select **test mode** → your region
3. Done! (You can secure rules later)

### 4. Enable Authentication
1. Click **Authentication**
2. Click **Get started**
3. Enable **Email/Password**

### 5. Add Config to `.env.local`
```bash
cp .env.example .env.local
```

Open `.env.local` and paste your Firebase config:
```
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_id
VITE_FIREBASE_APP_ID=1:your_app_id
```

### 6. Start Development
```bash
npm run dev
```

## 🧪 Test It Out

1. **Create Account**:
   - Click LOGIN
   - Enter any email: `user@example.com`
   - Password: `password123` (min 6 chars)
   - Select **USER** role
   - Click LOGIN (creates account automatically)

2. **Add Sample Machines** (via Firebase Console):
   - Firestore Database → Create collection **machines**
   - Add documents:
   ```json
   {
     "name": "Washer #1",
     "status": "available"
   }
   ```

3. **Book a Machine**:
   - Click "View Machines" or "Scan QR Code"
   - Select machine → Click "Book Now"

4. **Admin Access**:
   - Logout → Login as ADMIN role
   - Access `/admin` page
   - Create/edit/delete machines
   - Generate QR codes (Show QR → Download/Print)

5. **Test Offline**:
   - Open DevTools (F12)
   - Network tab → Click **Offline**
   - App still works!
   - Go back online → changes auto-sync

## 📁 Key Files Modified

| File | Change |
|------|--------|
| `src/config/firebase.ts` | Firebase + Firestore config |
| `src/context/AppContext.tsx` | Mock → Firebase + Firestore |
| `src/pages/Login.tsx` | Mock → Firebase Auth |
| `src/pages/Admin.tsx` | Async handlers for Firestore |
| `.env.local` | Firebase credentials |
| `.env.example` | Environment template |
| `FIREBASE_SETUP.md` | Detailed setup guide |
| `README.md` | Updated project docs |

## 🔄 Migration from Mock Data

All mock data references removed:
- ❌ `localStorage` for machines
- ❌ Mock authentication with email only
- ❌ Hardcoded `initialMachines` array
- ✅ Firebase Auth with passwords
- ✅ Firestore collections for all data
- ✅ Offline caching with IndexedDB

## 📝 Booking System Changes

**Before (Mock)**:
```typescript
const bookMachine = (machineId: string): boolean => {
  // Synchronous, mock data
}
```

**After (Firebase)**:
```typescript
const bookMachine = async (machineId: string): Promise<boolean> => {
  // Async, Firestore write
  await addDoc(collection(db, "bookings"), {...});
}
```

All bookings now:
- Stored in `bookings` Firestore collection
- Automatic sync to cloud
- Work offline (queued locally)
- Enforce single booking per user

## 🔐 User Roles

### User Role
- View machines
- Book machines
- Scan QR codes
- Submit feedback

### Admin Role
- Do everything users can do
- Manage machines (add/edit/delete)
- Generate QR codes for printing
- View all user feedback

## 🚀 What's Next?

### For Development
1. Add more sample machines
2. Test feedback submission
3. Customize machine fields
4. Add more admin features

### For Production
1. Set up Firestore security rules
2. Enable email verification
3. Deploy to Firebase Hosting
4. Monitor usage in Firebase Console
5. Set up backups

## 📚 Learn More

- **Complete Setup**: Read [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)
- **Firebase Docs**: [firebase.google.com/docs](https://firebase.google.com/docs)
- **Firestore Guide**: [Firestore Documentation](https://firebase.google.com/docs/firestore)
- **Offline Persistence**: [Enable Offline Persistence](https://firebase.google.com/docs/firestore/manage-data/enable-offline)

## ❓ Common Questions

**Q: Do I need to set up Firestore collections manually?**
A: No! They're created automatically when you first write data.

**Q: Will my app work without internet?**
A: Yes! Firebase enables offline persistence automatically. Changes sync when online.

**Q: Can I test this without creating a real Firebase project?**
A: The code is ready to use, but you need Firebase credentials. Free tier is plenty.

**Q: How do I generate QR codes for printing?**
A: Login as ADMIN → `/admin` → Click machine "Show QR" → Download/Print

**Q: Can users sign up without an admin?**
A: Yes! Anyone can create an account. Roles are set during login.

## 🐛 Stuck?

1. Check `.env.local` has correct Firebase config
2. Check Firestore Database is created (not just configured)
3. Check Authentication has Email/Password enabled
4. Look for errors in browser console (F12)
5. Read [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for troubleshooting

Happy coding! 🚀
