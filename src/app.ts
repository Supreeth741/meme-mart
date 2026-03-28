import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import passport from "passport";
import path from "path";
import fs from "fs";
import { env } from "./config/env";
import { configurePassport } from "./config/passport";
import routes from "./routes";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

const app = express();

// Serve frontend static files in production BEFORE cors/helmet so same-origin
// static asset requests (CSS, JS, images) are never subject to CORS checks.
// Next.js webpack runtime uses fetch() to lazy-load chunks — those requests
// carry Origin headers and would be rejected by the CORS allowlist otherwise.
if (env.nodeEnv === "production") {
  const frontendOut = path.join(__dirname, "..", "mememart-frontend", "out");
  app.use(express.static(frontendOut));
}

// Security
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      // Next.js static export uses inline <script> tags for __NEXT_DATA__
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://fonts.googleapis.com"],
      imgSrc: [
        "'self'",
        "data:",
        "blob:",
        "https://*.amazonaws.com",
        "https://*.googleusercontent.com",
        "https://*.gstatic.com",
        "https://img.icons8.com",
      ],
      mediaSrc: [
        "'self'",
        "blob:",
        "https://*.amazonaws.com",
      ],
      connectSrc: [
        "'self'",
        "https://*.googleapis.com",
        "https://*.firebaseio.com",
        "wss://*.firebaseio.com",
        "https://*.firebase.com",
        "https://identitytoolkit.googleapis.com",
        "https://securetoken.googleapis.com",
      ],
      // Firebase auth popup needs to load accounts.google.com in a frame
      frameSrc: ["'self'", "https://*.firebaseapp.com", "https://accounts.google.com"],
      objectSrc: ["'none'"],
      // Disable upgrade-insecure-requests — the server runs plain HTTP
      upgradeInsecureRequests: null,
    },
  },
  // HSTS must not be sent over plain HTTP
  hsts: false,
  // Firebase signInWithPopup requires unsafe-none (not just removing the header)
  // so the parent page can read window.closed on the auth popup
  crossOriginOpenerPolicy: { policy: "unsafe-none" },
  // Disable Origin-Agent-Cluster header to avoid "site-keyed agent cluster" warning
  originAgentCluster: false,
}));
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || env.allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  exposedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200,
  maxAge: 86400,
}));

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Logging
if (env.nodeEnv !== "test") {
  app.use(morgan("dev"));
}

// Passport
configurePassport();
app.use(passport.initialize());

// API routes
app.use("/api", routes);

// SPA catch-all in production: unmatched non-API paths return the correct
// Next.js static HTML shell. next build with output:"export" gives each route
// its own HTML file. Dynamic routes (e.g. /media/[id]) only exist as
// out/media/_/index.html. So for /media/<real-id> we must serve that shell,
// not the root index.html (which would always render the home page content).
if (env.nodeEnv === "production") {
  const frontendOut = path.join(__dirname, "..", "mememart-frontend", "out");
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) return next();

    // Try exact match first (e.g. /admin/login → out/admin/login/index.html)
    const exactFile = path.join(frontendOut, req.path, "index.html");
    if (fs.existsSync(exactFile)) {
      return res.sendFile(exactFile);
    }

    // For dynamic segments (/media/<id>) replace the last segment with '_'
    // to find the generated dynamic-route shell (out/media/_/index.html)
    const segments = req.path.replace(/^\//, "").replace(/\/$/, "").split("/").filter(Boolean);
    if (segments.length > 0) {
      const dynamicFile = path.join(frontendOut, ...segments.slice(0, -1), "_", "index.html");
      if (fs.existsSync(dynamicFile)) {
        return res.sendFile(dynamicFile);
      }
    }

    // Final fallback: root index.html
    res.sendFile(path.join(frontendOut, "index.html"));
  });
}

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
