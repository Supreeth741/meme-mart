# Firebase Auth Configuration

## 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **Add project** → enter a project name → click **Continue**
3. Enable/disable Google Analytics as preferred → click **Create project**

---

## 2. Register a Web App

1. From the project overview, click the **Web** icon (`</>`)
2. Enter an app nickname → click **Register app**
3. Copy the config object shown — you'll need it in step 4

---

## 3. Enable Authentication Providers

1. In the left sidebar go to **Build → Authentication**
2. Click **Get started**
3. Under the **Sign-in method** tab, enable:

### Email/Password

- Click **Email/Password** → toggle **Enable** → **Save**

### Google

- Click **Google** → toggle **Enable**
- Set a **Project support email**
- Click **Save**

---

## 4. Configure Environment Variables

Create (or update) `.env.local` in the project root with your Firebase config values:

```env
NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSy..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project.firebasestorage.app"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="123456789"
NEXT_PUBLIC_FIREBASE_APP_ID="1:123456789:web:abc123"
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="G-XXXXXXXXXX"
```

> **Note:** `.env.local` is gitignored by default in Next.js — never commit real API keys.

Restart the dev server after editing `.env.local`:

```bash
npm run dev
```

---

## 5. Add Authorized Domains (for Google Sign-In)

If you access the app from a local network IP (e.g. `192.168.x.x`) or a custom domain:

1. Firebase Console → **Authentication** → **Settings** tab
2. Under **Authorized domains**, click **Add domain**
3. Add `localhost`, your LAN IP, or production domain

---

## 6. File Overview

| File                           | Purpose                                              |
| ------------------------------ | ---------------------------------------------------- |
| `src/lib/firebase.ts`          | Initialises the Firebase app and exports `auth`      |
| `src/components/AuthModal.tsx` | Login / Signup dialog with email+password and Google |
| `src/components/Navbar.tsx`    | Navbar with Login button that opens the modal        |
| `.env.local`                   | Secret Firebase credentials (never commit this)      |

---

## 7. Auth Methods Used

| Method              | Firebase function                        |
| ------------------- | ---------------------------------------- |
| Email sign-up       | `createUserWithEmailAndPassword`         |
| Set display name    | `updateProfile`                          |
| Email login         | `signInWithEmailAndPassword`             |
| Google login/signup | `signInWithPopup` + `GoogleAuthProvider` |
