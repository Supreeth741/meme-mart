import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/authService";

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.register(req.body);
      res.status(201).json({ status: "success", data: result });
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.login(req.body);
      res.json({ status: "success", data: result });
    } catch (error) {
      next(error);
    }
  }

  static async adminLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const { username, password } = req.body;
      const result = await AuthService.adminLogin(username, password);
      res.json({ status: "success", data: result });
    } catch (error) {
      next(error);
    }
  }

  static async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        res.status(400).json({ message: "Refresh token required" });
        return;
      }
      const tokens = await AuthService.refreshToken(refreshToken);
      res.json({ status: "success", data: tokens });
    } catch (error) {
      next(error);
    }
  }

  static async firebaseLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const { idToken } = req.body;
      if (!idToken) {
        res.status(400).json({ message: "Firebase ID token required" });
        return;
      }
      const result = await AuthService.firebaseLogin(idToken);
      res.json({ status: "success", data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await AuthService.getProfile(req.userId!);
      res.json({ status: "success", data: user });
    } catch (error) {
      next(error);
    }
  }
  static async toggleFavourite(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const result = await AuthService.toggleFavourite(
        req.userId!,
        req.params.mediaId,
      );
      res.json({ status: "success", data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getFavourites(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AuthService.getFavourites(req.userId!);
      res.json({ status: "success", data });
    } catch (error) {
      next(error);
    }
  }
  static async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await AuthService.updateProfile(req.userId!, req.body);
      res.json({ status: "success", data: user });
    } catch (error) {
      next(error);
    }
  }

  static async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await AuthService.getUserById(req.params.userId);
      res.json({ status: "success", data: user });
    } catch (error) {
      next(error);
    }
  }

  // Google OAuth callback
  static async googleCallback(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as any;
      const tokens = AuthService.generateTokens(user._id.toString(), user.role);
      // Redirect to frontend with tokens
      const params = new URLSearchParams({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });
      res.redirect(
        `${process.env.FRONTEND_URL}/auth/callback?${params.toString()}`,
      );
    } catch (error) {
      next(error);
    }
  }
}
