import { Router } from "express";
import passport from "passport";
import { AuthController } from "../controllers/authController";
import { authenticate } from "../middleware/auth";
import { registerValidation, loginValidation } from "../middleware/validation";

const router = Router();

// Public routes
router.post("/register", registerValidation, AuthController.register);
router.post("/login", loginValidation, AuthController.login);
router.post("/admin/login", AuthController.adminLogin);
router.post("/refresh-token", AuthController.refreshToken);
router.post("/firebase-login", AuthController.firebaseLogin);

// Google OAuth
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/login",
  }),
  AuthController.googleCallback,
);

// Protected routes
router.get("/profile", authenticate, AuthController.getProfile);
router.put("/profile", authenticate, AuthController.updateProfile);
router.get("/users/:userId", AuthController.getUserById);
router.get("/favourites", authenticate, AuthController.getFavourites);
router.post(
  "/favourites/:mediaId",
  authenticate,
  AuthController.toggleFavourite,
);

export default router;
