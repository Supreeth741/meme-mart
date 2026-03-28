# MemeMart

A full-stack meme marketplace where users can browse, upload, and download video, audio, and image meme templates.

## Tech Stack

**Backend**
- Node.js + Express + TypeScript
- MongoDB (Mongoose)
- AWS S3 (media storage)
- Firebase Admin SDK (Google OAuth)
- JWT authentication
- PM2 (process management)

**Frontend**
- Next.js 14 (static export)
- React 18 + Tailwind CSS
- Firebase Client SDK

## Project Structure

```
nandan-project/
├── src/                    # Backend source (TypeScript)
│   ├── controllers/
│   ├── services/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── config/
├── dist/                   # Compiled backend (generated)
├── mememart-frontend/      # Next.js frontend
│   └── src/app/
│       ├── media/[id]/
│       ├── categories/[slug]/
│       ├── admin/
│       ├── upload/
│       ├── search/
│       └── profile/
├── ecosystem.config.js     # PM2 config
└── package.json
```

## Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```env
PORT=5000
NODE_ENV=production

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret

AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_BUCKET_NAME=your_bucket
AWS_REGION=ap-south-1

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://your-domain/api/auth/google/callback

FRONTEND_URL=http://your-domain
ALLOWED_ORIGINS=http://your-domain

ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_admin_password
ADMIN_EMAIL=admin@yourdomain.com

FIREBASE_API_KEY=...
FIREBASE_AUTH_DOMAIN=...
FIREBASE_PROJECT_ID=...
FIREBASE_STORAGE_BUCKET=...
FIREBASE_MESSAGING_SENDER_ID=...
FIREBASE_APP_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY=...
```

For the frontend, set in `mememart-frontend/.env`:
```env
NEXT_PUBLIC_API_URL=/api
```

## Local Development

**Install dependencies**
```bash
npm install
cd mememart-frontend && npm install && cd ..
```

**Run backend in dev mode**
```bash
npm run dev
```

**Run frontend in dev mode**
```bash
cd mememart-frontend
npm run dev
```

## Production Build & Run

**Build everything**
```bash
npm run build:all
```

**Start production server**
```bash
NODE_ENV=production node dist/server.js
```

The Express server serves both the API (`/api/*`) and the Next.js static frontend on the same port.

## PM2 Deployment

**Start with PM2**
```bash
npx pm2 start ecosystem.config.js --env production
```

**Deploy to staging server**
```bash
pm2 deploy ecosystem.config.js staging
```

The `post-deploy` hook automatically installs dependencies, builds everything, and restarts the PM2 process.

**Useful PM2 commands**
```bash
npx pm2 status                  # Check running processes
npx pm2 logs mememart_service   # View logs
npx pm2 restart mememart_service
npx pm2 stop mememart_service
```

## Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Google** sign-in under **Authentication → Sign-in methods**
3. Add your domain under **Authentication → Settings → Authorized domains**
4. Download the Admin SDK service account key and set the values in `.env`

## Admin Panel

Access the admin panel at `/admin`. Default credentials are set via `ADMIN_USERNAME`, `ADMIN_PASSWORD`, and `ADMIN_EMAIL` in `.env`. The admin account is seeded automatically on first server start.
