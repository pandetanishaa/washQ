# washQ - Smart Washing Machine Management System

A modern, offline-first React application for managing shared washing machines with QR code scanning, real-time booking, and user feedback.

## 🚀 Features

- **User Authentication**: Firebase Auth with email/password login
- **QR Code Scanning**: Built-in camera QR scanner for quick machine access
- **Offline Persistence**: Works completely offline with Firestore caching
- **Real-time Bookings**: Single booking constraint with queue management
- **Admin Dashboard**: Manage machines, view feedback, generate QR codes for printing
- **User Notifications**: Real-time alerts for machine availability changes
- **Feedback System**: User support tickets for admins to review
- **Responsive Design**: Pixel-art inspired UI with smooth animations

## 📋 Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS with custom pixel-art theme
- **UI Components**: shadcn/ui
- **Backend**: Firebase (Auth + Firestore)
- **Offline**: IndexedDB persistence
- **Build Tool**: Vite
- **Animations**: Framer Motion

## 🔧 Setup Instructions

### 1. Prerequisites

- Node.js 18+ and npm
- Firebase account (free tier works fine)

### 2. Clone & Install

```bash
git clone <your-repo-url>
cd washq
npm install
```

### 3. Configure Firebase

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Firestore Database (test mode for development)
3. Enable Authentication (Email/Password)
4. Copy your Firebase config

For detailed setup instructions, see [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)

### 4. Environment Variables

```bash
cp .env.example .env.local
```

Fill in your Firebase config values in `.env.local`:

```
VITE_FIREBASE_API_KEY=your_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_domain.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 5. Start Development

```bash
npm run dev
```

Visit `http://localhost:5173` in your browser.

## 📱 Usage

### User Account

1. Click "LOGIN" on the home page
2. Enter email and password (creates account on first login)
3. Select **USER** role
4. Click "LOGIN"

### Booking a Machine

**Option 1: Scan QR Code**
- Click "Scan QR Code" on home screen
- Allow camera access
- Point at machine QR code
- Auto-navigates to machine details

**Option 2: View All Machines**
- Click "View Machines"
- Select a machine
- Click "Book Now"

### Admin Features

1. Login with **ADMIN** role
2. Access `/admin` page (or click Admin in menu)
3. **Manage Machines**:
   - Add new washing machines
   - Update machine status (available/running/waiting/out-of-order)
   - Delete machines
   - **Generate QR Codes**: Click "Show QR" to view, download, or print QR stickers

4. **View Feedback**: See all user feedback and support tickets

### Offline Usage

The app works completely offline:

1. **Browser DevTools** (F12) → Network → **Offline**
2. Use the app normally - all features work
3. Changes are queued locally
4. Go back **Online** - all changes automatically sync to Firestore

## 🏗️ Project Structure

```
src/
├── components/
│   ├── Layout.tsx              # Main layout wrapper
│   ├── PixelButton.tsx         # Custom button component
│   ├── QRScanner.tsx           # Camera-based QR scanner
│   ├── MachineQRCode.tsx       # QR generator for admins
│   ├── HelpFeedbackDialog.tsx  # User feedback form
│   └── ... (other components)
├── pages/
│   ├── Login.tsx               # Firebase auth login
│   ├── Index.tsx               # Home page
│   ├── Machines.tsx            # Machine list
│   ├── MachineStatus.tsx       # Machine details & booking
│   └── Admin.tsx               # Admin dashboard
├── context/
│   └── AppContext.tsx          # Firebase + Firestore integration
├── config/
│   └── firebase.ts             # Firebase configuration
├── hooks/
│   ├── useMachineNotifications.ts
│   └── useQRValidation.ts
└── lib/
    └── utils.ts
```

## 🔐 Security

### Authentication

- Firebase Auth handles secure password storage
- Email verification available (optional)
- Session persistence via Firebase

### Firestore Rules

Production security rules restrict:
- Only authenticated users can read machines
- Only admins can modify machines
- Users can only see their own bookings
- Only admins can view feedback

See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for complete security rules.

## 💾 Firestore Collections

```
machines/          - Washing machine inventory
bookings/          - User machine reservations  
users/             - User profiles & roles
feedback/          - Support tickets
```

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

Output is in `dist/` folder.

### Deploy to Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy --only hosting
```

### Environment Variables

Set production environment variables in your hosting platform:
- Vercel: Project Settings → Environment Variables
- Firebase: Create `.env.production.local`
- Other: Use your platform's secrets manager

## 📚 Documentation

- [Firebase Setup Guide](./FIREBASE_SETUP.md) - Complete Firebase configuration
- [Firestore Data Structure](./FIREBASE_SETUP.md#firestore-data-structure) - Database schema
- [Security Rules](./FIREBASE_SETUP.md#production-deployment) - Production rules
- [Offline Persistence](./FIREBASE_SETUP.md#offline-persistence) - How offline works

## 🧪 Testing

### Manual Testing Checklist

- [ ] User sign up/login with Firebase
- [ ] QR scanner detects machine QR codes
- [ ] Booking prevents multiple simultaneous bookings
- [ ] Offline mode (DevTools → Offline)
- [ ] Feedback submission saves to Firestore
- [ ] Admin can manage machines
- [ ] Admin can generate & download QR codes
- [ ] Notifications work when machine becomes available

### Test Data

Create test machines in Firestore:
```json
{
  "name": "Washer #1",
  "status": "available",
  "createdAt": "2024-01-11T00:00:00Z"
}
```

## 🐛 Troubleshooting

**"Firebase is not initialized"**
- Check `.env.local` has correct config values
- Reload the page

**Offline mode not working**
- Use Chrome, Firefox, Safari, or Edge
- Check DevTools → Application → IndexedDB → washq

**QR scanner not opening**
- Allow camera permissions
- Use HTTPS in production
- Check browser supports WebRTC

**Firebase rules blocking writes**
- In development, use test mode
- Check security rules match your use case
- Verify user auth token is valid

## 📞 Support

For issues or questions:
1. Check [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for common issues
2. Review [Firestore documentation](https://firebase.google.com/docs/firestore)
3. Check browser console for error messages

## 📝 License

This project is open source and available for educational and personal use.

## 🎮 Pixel Art Theme

The UI uses a pixel-art inspired design with retro gaming aesthetics, making it fun and unique for a laundry booking system!
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
