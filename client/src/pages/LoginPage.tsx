import React, { useEffect, useState } from "react";
import Loader from "../components/Loader/Loader";
import { loginUser } from "@/api/user.api";
import { useNotification } from "../components/Notifications/NotificationContext";
import { Notification } from "@/vite-env";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/utils/firebase/firebase";

export function LoginPage() {
  const { addNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("test@gmail.com");
  const [password, setPassword] = useState("test123");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      setLoading(true);
      await loginUser({ email, password });
      const newNotification: Notification = {
        id: Date.now().toString(),
        type: "success",
        message: "Login Successful",
      };
      addNotification(newNotification);
      navigate("/dashboard");
    } catch (error) {
      const newNotification: Notification = {
        id: Date.now().toString(),
        type: "error",
        message: `${(error as any).response?.data?.message || "Login failed"}`,
      };
      addNotification(newNotification);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = (result as any)._tokenResponse.idToken;
      await loginUser({ firebaseUID: idToken });
      addNotification({ id: Date.now().toString(), type: "success", message: "Login Successful" });
      navigate("/dashboard");
    } catch (error) {
      addNotification({
        id: Date.now().toString(),
        type: "error",
        message: `${(error as any).response?.data?.message || "Google sign-in failed"}`,
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#050508]">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050508] text-white flex items-center justify-center relative overflow-hidden font-sans">
      {/* Ambient background orbs */}
      <div className="fixed top-12 left-1/4 w-96 h-96 rounded-full bg-violet-950/20 blur-[130px] pointer-events-none z-0" />
      <div className="fixed bottom-12 right-1/4 w-80 h-80 rounded-full bg-blue-950/15 blur-[100px] pointer-events-none z-0" />
      <div className="fixed inset-0 bg-grid opacity-25 pointer-events-none z-0" />

      {/* Centered Glass Card */}
      <div className="relative z-10 w-full max-w-md mx-4 px-6 sm:px-8 py-10 glass rounded-3xl glow-white-sm border border-white/6">
        
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="text-[10px] font-mono-tech tracking-widest text-white/40 flex items-center justify-center gap-2">
            <span className="text-white text-[8px] animate-pulse">●</span> MOCKMATE
          </span>
          <h1 className="text-3xl font-black text-white tracking-tight uppercase mt-4 leading-none">Sign In</h1>
          <p className="text-white/40 font-mono-tech tracking-widest text-[9px] mt-3">
            Access your session dashboard
          </p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-white/50 font-mono-tech tracking-widest text-[9px] mb-2">EMAIL</label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="w-full glass-input rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-zinc-700 transition-colors placeholder:text-white/20"
              placeholder="you@example.com"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-white/50 font-mono-tech tracking-widest text-[9px] mb-2">PASSWORD</label>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="w-full glass-input rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-zinc-700 transition-colors pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-4 flex items-center text-white/30 hover:text-white transition-colors"
              >
                {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>
            <div className="text-right mt-2">
              <a href="#" className="text-white/30 hover:text-white font-mono-tech tracking-widest text-[9px] transition-colors">
                Forgot password?
              </a>
            </div>
          </div>

          {/* Submit */}
          <button
            id="login-submit-btn"
            onClick={handleLogin}
            className="w-full mt-2 py-3.5 rounded-xl glass-btn-primary text-white text-[10px] font-mono-tech tracking-widest font-bold"
          >
            Sign In →
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 my-2">
            <div className="flex-1 h-px bg-white/6" />
            <span className="text-white/25 font-mono-tech text-[8px] tracking-widest">OR</span>
            <div className="flex-1 h-px bg-white/6" />
          </div>

          {/* Google */}
          <button
            id="login-google-btn"
            onClick={handleGoogleSignin}
            className="w-full py-3.5 rounded-xl glass-btn text-white/70 text-[10px] font-mono-tech tracking-widest font-bold flex items-center justify-center gap-3"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>
        </div>

        {/* Sign up link */}
        <p className="text-center text-white/30 font-mono-tech tracking-widest text-[9px] mt-8">
          No account?{" "}
          <Link to="/signup" className="text-white hover:text-zinc-300 transition-colors underline underline-offset-4 font-bold">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
