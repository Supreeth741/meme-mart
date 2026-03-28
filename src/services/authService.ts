import jwt from "jsonwebtoken";
import { env } from "../config/env";
import User from "../models/User";
import ActivityLog from "../models/ActivityLog";
import { RegisterDTO, LoginDTO, AuthPayload } from "../interfaces";
import { AppError } from "../middleware/errorHandler";
import { firebaseAdmin } from "../config/firebase";

export class AuthService {
  static generateTokens(userId: string, role: string) {
    const accessToken = jwt.sign(
      { userId, role } as AuthPayload,
      env.jwt.secret,
      { expiresIn: env.jwt.expiresIn as jwt.SignOptions["expiresIn"] },
    );

    const refreshToken = jwt.sign(
      { userId, role } as AuthPayload,
      env.jwt.refreshSecret,
      { expiresIn: env.jwt.refreshExpiresIn as jwt.SignOptions["expiresIn"] },
    );

    return { accessToken, refreshToken };
  }

  static async register(data: RegisterDTO) {
    const existingUser = await User.findOne({
      $or: [{ email: data.email }, { username: data.username }],
    });

    if (existingUser) {
      if (existingUser.email === data.email) {
        throw new AppError("Email already registered", 400);
      }
      throw new AppError("Username already taken", 400);
    }

    const user = await User.create({
      username: data.username,
      email: data.email,
      password: data.password,
      isVerified: true,
    });

    await ActivityLog.create({
      userId: user._id,
      action: "register",
      details: "User registered",
    });

    const tokens = this.generateTokens(user._id.toString(), user.role);
    return {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
      ...tokens,
    };
  }

  static async login(data: LoginDTO) {
    const user = await User.findOne({ email: data.email }).select("+password");
    if (!user || !user.password) {
      throw new AppError("Invalid email or password", 401);
    }

    const isMatch = await (user as any).comparePassword(data.password);
    if (!isMatch) {
      throw new AppError("Invalid email or password", 401);
    }

    await ActivityLog.create({
      userId: user._id,
      action: "login",
      details: "User logged in",
    });

    const tokens = this.generateTokens(user._id.toString(), user.role);
    return {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
      ...tokens,
    };
  }

  static async adminLogin(username: string, password: string) {
    const user = await User.findOne({ username, role: "admin" }).select(
      "+password",
    );
    if (!user || !user.password) {
      throw new AppError("Invalid admin credentials", 401);
    }

    const isMatch = await (user as any).comparePassword(password);
    if (!isMatch) {
      throw new AppError("Invalid admin credentials", 401);
    }

    await ActivityLog.create({
      userId: user._id,
      action: "admin_login",
      details: "Admin logged in",
    });

    const tokens = this.generateTokens(user._id.toString(), user.role);
    return {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      ...tokens,
    };
  }

  static async firebaseLogin(idToken: string) {
    const decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
    const { uid, email, name, picture } = decodedToken;

    if (!email) {
      throw new AppError("Firebase account has no email", 400);
    }

    let user = await User.findOne({ $or: [{ firebaseUid: uid }, { email }] });

    if (user) {
      if (!user.firebaseUid) {
        user.firebaseUid = uid;
        if (picture && !user.avatar) user.avatar = picture;
        await user.save();
      }
    } else {
      const username =
        name?.replace(/\s+/g, "_").toLowerCase() || `user_${Date.now()}`;
      user = await User.create({
        username,
        email,
        firebaseUid: uid,
        avatar: picture || "",
        isVerified: true,
      });

      await ActivityLog.create({
        userId: user._id,
        action: "register",
        details: "User registered via Firebase",
      });
    }

    await ActivityLog.create({
      userId: user._id,
      action: "login",
      details: "User logged in via Firebase",
    });

    const tokens = this.generateTokens(user._id.toString(), user.role);
    return {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
      ...tokens,
    };
  }

  static async refreshToken(token: string) {
    try {
      const decoded = jwt.verify(
        token,
        env.jwt.refreshSecret,
      ) as unknown as AuthPayload;
      const user = await User.findById(decoded.userId);
      if (!user) throw new AppError("User not found", 401);

      return this.generateTokens(user._id.toString(), user.role);
    } catch {
      throw new AppError("Invalid refresh token", 401);
    }
  }

  static async getProfile(userId: string) {
    const user = await User.findById(userId);
    if (!user) throw new AppError("User not found", 404);
    return user;
  }

  static async updateProfile(
    userId: string,
    updates: { username?: string; avatar?: string },
  ) {
    if (updates.username) {
      const existing = await User.findOne({
        username: updates.username,
        _id: { $ne: userId },
      });
      if (existing) throw new AppError("Username already taken", 400);
    }

    const user = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    });
    if (!user) throw new AppError("User not found", 404);
    // Also update uploaderName on all media uploaded by this user
    if (updates.username) {
      const Media = (await import("../models/Media")).default;
      await Media.updateMany(
        { uploadedBy: userId },
        { uploaderName: updates.username },
      );
    }
    return user;
  }

  static async toggleFavourite(userId: string, mediaId: string) {
    const user = await User.findById(userId);
    if (!user) throw new AppError("User not found", 404);
    const index = user.favourites.indexOf(mediaId);
    if (index > -1) {
      user.favourites.splice(index, 1);
    } else {
      user.favourites.push(mediaId);
    }
    await user.save();
    return { favourites: user.favourites, added: index === -1 };
  }

  static async getFavourites(userId: string) {
    const user = await User.findById(userId);
    if (!user) throw new AppError("User not found", 404);
    const Media = (await import("../models/Media")).default;
    const media = await Media.find({ _id: { $in: user.favourites } }).lean();
    return media;
  }

  static async getUserById(userId: string) {
    const user = await User.findById(userId);
    if (!user) throw new AppError("User not found", 404);
    return {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    };
  }
}
