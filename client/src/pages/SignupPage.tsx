import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/utils/firebase/firebase";
import { registerUser } from "@/api/user.api";
import { useNotification } from "@/components/Notifications/NotificationContext";
import { Notification } from "@/vite-env";

export function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { addNotification } = useNotification();

  const handleGoogleSignup = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const displayName = (result as any)._tokenResponse.displayName;
      const emailVal = (result as any)._tokenResponse.email;
      const firebaseUid = (result as any)._tokenResponse.user_id;
      const pw = `${Math.random() * 1000000}`;
      await registerUser({ name: displayName, email: emailVal, password: pw, firebaseUid });
      addNotification({ id: Date.now().toString(), type: "success", message: "Account Created Successfully" });
      navigate("/login");
    } catch (error) {
      addNotification({
        id: Date.now().toString(),
        type: "error",
        message: `${(error as any).response?.data?.error || "Google signup failed"}`,
      });
    }
  };

  const handleSignup = async () => {
    if (password !== confirmPassword) {
      addNotification({ id: Date.now().toString(), type: "error", message: "Passwords do not match" });
      return;
    }
    try {
      setLoading(true);
      await registerUser({ name, email, password, firebaseUid: "" });
      addNotification({ id: Date.now().toString(), type: "success", message: "Account Created Successfully" });
      navigate("/login");
    } catch (error) {
      addNotification({
        id: Date.now().toString(),
        type: "error",
        message: `${(error as any).response?.data?.error || "Signup failed"}`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050508] text-white flex items-center justify-center relative overflow-hidden font-sans">
      {/* Ambient background orbs */}
      <div className="fixed top-12 right-1/4 w-96 h-96 rounded-full bg-violet-950/20 blur-[130px] pointer-events-none z-0" />
      <div className="fixed bottom-12 left-1/4 w-80 h-80 rounded-full bg-blue-950/15 blur-[100px] pointer-events-none z-0" />
      <div className="fixed inset-0 bg-grid opacity-25 pointer-events-none z-0" />

      {/* Centered Glass Card */}
      <div className="relative z-10 w-full max-w-md mx-4 px-6 sm:px-8 py-10 glass rounded-3xl glow-white-sm border border-white/6">
        
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="text-[10px] font-mono-tech tracking-widest text-white/40 flex items-center justify-center gap-2">
            <span className="text-white text-[8px] animate-pulse">●</span> MOCKMATE
          </span>
          <h1 className="text-3xl font-black text-white tracking-tight uppercase mt-4 leading-none">Create Account</h1>
          <p className="text-white/40 font-mono-tech tracking-widest text-[9px] mt-3">
            Begin your interview preparation
          </p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-white/50 font-mono-tech tracking-widest text-[9px] mb-2">FULL NAME</label>
            <input
              id="signup-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full glass-input rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-zinc-700 transition-colors placeholder:text-white/20"
              placeholder="John Doe"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-white/50 font-mono-tech tracking-widest text-[9px] mb-2">EMAIL</label>
            <input
              id="signup-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full glass-input rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-zinc-700 transition-colors placeholder:text-white/20"
              placeholder="you@example.com"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-white/50 font-mono-tech tracking-widest text-[9px] mb-2">PASSWORD</label>
            <div className="relative">
              <input
                id="signup-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-white/50 font-mono-tech tracking-widest text-[9px] mb-2">CONFIRM PASSWORD</label>
            <div className="relative">
              <input
                id="signup-confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full glass-input rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-zinc-700 transition-colors pr-12"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-4 flex items-center text-white/30 hover:text-white transition-colors"
              >
                {showConfirmPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            id="signup-submit-btn"
            onClick={handleSignup}
            disabled={loading}
            className="w-full mt-2 py-3.5 rounded-xl glass-btn-primary text-white text-[10px] font-mono-tech tracking-widest font-bold disabled:opacity-40"
          >
            {loading ? "Creating Account..." : "Create Account →"}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 my-2">
            <div className="flex-1 h-px bg-white/6" />
            <span className="text-white/25 font-mono-tech text-[8px] tracking-widest">OR</span>
            <div className="flex-1 h-px bg-white/6" />
          </div>

          {/* Google */}
          <button
            id="signup-google-btn"
            onClick={handleGoogleSignup}
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

        {/* Login link */}
        <p className="text-center text-white/30 font-mono-tech tracking-widest text-[9px] mt-8">
          Already registered?{" "}
          <Link to="/login" className="text-white hover:text-zinc-300 transition-colors underline underline-offset-4 font-bold">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
