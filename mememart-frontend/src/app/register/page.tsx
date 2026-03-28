"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const { register, loginWithGoogle } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  const getPasswordStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strength = getPasswordStrength(formData.password);
  const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];
  const strengthColors = [
    "",
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-green-500",
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.fullName ||
      !formData.username ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      toast.error("Please fill in all fields");
      return;
    }
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(formData.username)) {
      toast.error(
        "Username must be 3-20 characters: letters, numbers, or underscores",
      );
      return;
    }
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (!termsAccepted) {
      toast.error("Please accept the Terms of Service");
      return;
    }

    setLoading(true);
    try {
      await register(formData.username, formData.email, formData.password);
      toast.success("Account created successfully!");
      router.push("/");
    } catch (error: any) {
      toast.error(
        error?.code === "auth/email-already-in-use"
          ? "Email already registered"
          : error.response?.data?.message ||
              error.message ||
              "Registration failed",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      toast.success("Account created successfully!");
      router.push("/");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Google sign-up failed",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-14 relative">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
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
                person_add
              </span>
            </div>
            <h1 className="text-3xl font-black tracking-tight mb-2">
              Create account
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Join millions of meme creators today
            </p>
          </div>

          {/* Google OAuth */}
          <button
            onClick={handleGoogleSignup}
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
            Sign up with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700"></div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
              or
            </span>
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700"></div>
          </div>

          {/* Sign Up Form */}
          <form onSubmit={handleSubmit}>
            {/* Full Name */}
            <div className="mb-4">
              <label
                className="block text-sm font-bold mb-2 text-slate-700 dark:text-slate-300"
                htmlFor="fullname"
              >
                Full name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <span className="material-symbols-outlined text-slate-400 text-lg">
                    person
                  </span>
                </div>
                <input
                  id="fullname"
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  required
                />
              </div>
            </div>

            {/* Username */}
            <div className="mb-4">
              <label
                className="block text-sm font-bold mb-2 text-slate-700 dark:text-slate-300"
                htmlFor="username"
              >
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <span className="material-symbols-outlined text-slate-400 text-lg">
                    alternate_email
                  </span>
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="memequeen99"
                  className="w-full bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  required
                />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 ml-1">
                Only letters, numbers, and underscores.
              </p>
            </div>

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
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
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
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a strong password"
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
              {/* Password strength */}
              <div className="mt-2">
                <div className="flex gap-1 mb-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-1.5 flex-1 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden"
                    >
                      <div
                        className={`h-full rounded-full transition-all ${i <= strength ? strengthColors[strength] : ""}`}
                        style={{ width: i <= strength ? "100%" : "0%" }}
                      />
                    </div>
                  ))}
                </div>
                {formData.password && (
                  <p
                    className="text-xs font-semibold"
                    style={{
                      color:
                        strength === 1
                          ? "#ef4444"
                          : strength === 2
                            ? "#f97316"
                            : strength === 3
                              ? "#eab308"
                              : strength === 4
                                ? "#22c55e"
                                : "#94a3b8",
                    }}
                  >
                    {strengthLabels[strength]}
                  </p>
                )}
              </div>
            </div>

            {/* Confirm Password */}
            <div className="mb-4 mt-4">
              <label
                className="block text-sm font-bold mb-2 text-slate-700 dark:text-slate-300"
                htmlFor="confirm-password"
              >
                Confirm password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <span className="material-symbols-outlined text-slate-400 text-lg">
                    lock_reset
                  </span>
                </div>
                <input
                  id="confirm-password"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter your password"
                  className="w-full bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-11 pr-12 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-primary transition-colors"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <span className="material-symbols-outlined text-lg">
                    {showConfirmPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {/* Terms */}
            <div className="mb-6">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 dark:border-slate-600 text-primary focus:ring-primary bg-slate-100 dark:bg-slate-800 size-4 shrink-0"
                  required
                />
                <span className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  I agree to the{" "}
                  <a
                    href="#"
                    className="text-primary font-semibold hover:underline"
                  >
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a
                    href="#"
                    className="text-primary font-semibold hover:underline"
                  >
                    Privacy Policy
                  </a>
                </span>
              </label>
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
                  Creating...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Login link */}
          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
            Already have an account?
            <Link
              href="/login"
              className="text-primary font-bold hover:underline ml-1"
            >
              Log in
            </Link>
          </p>
        </div>

        {/* Perks */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/40 rounded-xl p-3 text-center">
            <span className="material-symbols-outlined text-primary text-xl block mb-1">
              download
            </span>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Unlimited Downloads
            </p>
          </div>
          <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/40 rounded-xl p-3 text-center">
            <span className="material-symbols-outlined text-primary text-xl block mb-1">
              cloud_upload
            </span>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Upload Templates
            </p>
          </div>
          <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/40 rounded-xl p-3 text-center">
            <span className="material-symbols-outlined text-primary text-xl block mb-1">
              star
            </span>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Save Favourites
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
