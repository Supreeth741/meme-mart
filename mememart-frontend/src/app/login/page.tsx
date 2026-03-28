"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

export default function LoginPage() {
  const { login, loginWithGoogle } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Logged in successfully!");
      router.push("/");
    } catch (error: any) {
      toast.error(
        error?.code === "auth/invalid-credential"
          ? "Invalid email or password"
          : error.response?.data?.message || error.message || "Login failed",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      toast.success("Logged in successfully!");
      router.push("/");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || error.message || "Google login failed",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-16 relative">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div
          className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-8 md:p-10 backdrop-blur-sm"
          style={{
            boxShadow:
              "0 0 60px rgba(249,245,6,0.06), 0 20px 60px rgba(0,0,0,0.4)",
          }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center size-14 bg-primary/10 rounded-2xl mb-4">
              <span className="material-symbols-outlined text-primary text-3xl">
                lock_open
              </span>
            </div>
            <h1 className="text-3xl font-black tracking-tight mb-2">
              Welcome back
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Log in to your Meme Mart account
            </p>
          </div>

          {/* Google OAuth */}
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all mb-6 shadow-sm"
          >
            <svg
              className="size-5 shrink-0"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700"></div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
              or
            </span>
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700"></div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div className="mb-4">
              <label
                className="block text-sm font-bold mb-2 text-slate-700 dark:text-slate-300"
                htmlFor="email"
              >
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <span className="material-symbols-outlined text-slate-400 text-lg">
                    mail
                  </span>
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="mb-2">
              <label
                className="block text-sm font-bold mb-2 text-slate-700 dark:text-slate-300"
                htmlFor="password"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <span className="material-symbols-outlined text-slate-400 text-lg">
                    lock
                  </span>
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-11 pr-12 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-primary transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined text-lg">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {/* Remember me + Forgot */}
            <div className="flex items-center justify-between mb-6 mt-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded border-slate-300 dark:border-slate-600 text-primary focus:ring-primary bg-slate-100 dark:bg-slate-800 size-4"
                />
                <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                  Remember me
                </span>
              </label>
              <a
                href="#"
                className="text-sm font-semibold text-primary hover:underline"
              >
                Forgot password?
              </a>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-primary text-background-dark text-base font-black tracking-tight hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined text-lg animate-spin">
                    progress_activity
                  </span>
                  Logging in...
                </>
              ) : (
                "Log In"
              )}
            </button>
          </form>

          {/* Sign up link */}
          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
            Don&apos;t have an account?
            <Link
              href="/register"
              className="text-primary font-bold hover:underline ml-1"
            >
              Create one free
            </Link>
          </p>
        </div>

        {/* Trust badges */}
        <div className="flex items-center justify-center gap-6 mt-6 text-xs text-slate-500 dark:text-slate-500">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-sm text-primary">
              shield
            </span>
            Secure login
          </span>
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-sm text-primary">
              lock
            </span>
            SSL encrypted
          </span>
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-sm text-primary">
              verified_user
            </span>
            Privacy safe
          </span>
        </div>
      </div>
    </div>
  );
}
