"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  onAuthStateChanged,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { authService } from "@/services/authService";

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    username: string,
    email: string,
    password: string,
  ) => Promise<void>;
  adminLogin: (username: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const setTokens = useCallback((accessToken: string, refreshToken: string) => {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
  }, []);

  const syncWithBackend = useCallback(
    async (firebaseIdToken: string) => {
      const { data } = await authService.firebaseLogin(firebaseIdToken);
      setTokens(data.data.accessToken, data.data.refreshToken);
      setUser(data.data.user);
    },
    [setTokens],
  );

  const fetchProfile = useCallback(async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setLoading(false);
        return;
      }
      const { data } = await authService.getProfile();
      setUser(data.data);
    } catch {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const login = async (email: string, password: string) => {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    const idToken = await credential.user.getIdToken();
    await syncWithBackend(idToken);
  };

  const register = async (
    username: string,
    email: string,
    password: string,
  ) => {
    const credential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    await updateProfile(credential.user, { displayName: username });
    const idToken = await credential.user.getIdToken();
    await syncWithBackend(idToken);
  };

  const loginWithGoogle = async () => {
    const credential = await signInWithPopup(auth, googleProvider);
    const idToken = await credential.user.getIdToken();
    await syncWithBackend(idToken);
  };

  const adminLogin = async (username: string, password: string) => {
    const { data } = await authService.adminLogin(username, password);
    setTokens(data.data.accessToken, data.data.refreshToken);
    setUser(data.data.user);
  };

  const logout = () => {
    signOut(auth);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        adminLogin,
        loginWithGoogle,
        logout,
        setTokens,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
