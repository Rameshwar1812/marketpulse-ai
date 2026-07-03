import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Lock, Mail, AlertTriangle, Eye, EyeOff, Shield, User } from "lucide-react";
import { DemoDataNotice } from "../components/common/DemoDataNotice";

export const Login = ({ defaultRegister = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, isAuthenticated } = useAuth();

  // Mode state
  const [isRegister, setIsRegister] = useState(defaultRegister);

  // Form states
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Sync mode state with props if they change
  useEffect(() => {
    setIsRegister(defaultRegister);
    setError("");
  }, [defaultRegister]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || "/dashboard";
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (isRegister) {
      // Registration validation
      if (!fullName || !email || !password || !confirmPassword) {
        setError("Please fill in all register fields.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
      }

      setLoading(true);
      try {
        await register(fullName, email, password);
        // Automatically sign in or navigate to dashboard after successful registration
        navigate("/dashboard", { replace: true });
      } catch (err) {
        setError(err.message || "Failed to create account. Email may already be registered.");
      } finally {
        setLoading(false);
      }
    } else {
      // Login validation
      if (!email || !password) {
        setError("Please fill in all credential fields.");
        return;
      }

      setLoading(true);
      try {
        await login(email, password);
        const from = location.state?.from?.pathname || "/dashboard";
        navigate(from, { replace: true });
      } catch (err) {
        setError(err.message || "Invalid email or password. Please verify your credentials.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleFillDemo = (demoEmail) => {
    setEmail(demoEmail);
    setPassword("DemoPass123!");
    setError("");
  };

  const demoUsers = [
    { label: "Executive Demo", email: "executive@marketpulse.demo", role: "executive" },
    { label: "Analyst Demo", email: "analyst@marketpulse.demo", role: "analyst" },
    { label: "Reviewer Demo", email: "reviewer@marketpulse.demo", role: "reviewer" },
    { label: "Admin Demo", email: "admin@marketpulse.demo", role: "admin" }
  ];

  return (
    <div className="flex min-h-screen w-screen bg-slate-50">
      {/* Left Column: Visual Brand Composition */}
      <div className="hidden lg:flex w-1/2 flex-col justify-between bg-slate-900 p-12 text-white relative overflow-hidden">
        {/* Abstract grid lines background */}
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-indigo-500 blur-3xl opacity-30"></div>
        </div>

        {/* Top Header */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-500/25">
            M
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight text-white">MarketPulse AI</span>
            <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Market Product Trend Assistant</span>
          </div>
        </div>

        {/* Brand Headline */}
        <div className="relative z-10 my-auto max-w-md space-y-6">
          <h1 className="text-4xl font-extrabold tracking-tight leading-tight">
            Turn fragmented market data into traceable, decision-ready intelligence.
          </h1>
          <p className="text-sm text-slate-400 font-medium leading-relaxed">
            Explore category momentum, product positioning, ingredient signals, and verified AI classifications from one centralized compliance-backed intelligence workspace.
          </p>

          {/* Floating mini insight cards */}
          <div className="mt-8 space-y-3">
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-xs">
              <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
              <div className="text-xs font-semibold">
                <span className="font-semibold text-white">Sleep & Relaxation</span> &bull; 0.94 Confidence &bull; $14.2M Revenue
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-xs">
              <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></div>
              <div className="text-xs font-semibold">
                <span className="font-semibold text-white">Ashwagandha Signals</span> &bull; Momentum rising (+3.4) &bull; Stress & Mood
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-xs text-slate-500 font-semibold uppercase tracking-wider">
          Demonstration Environment &bull; MarketPulse AI v1.0
        </div>
      </div>

      {/* Right Column: Authentication Form Area */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-8">
        <div className="w-full max-w-md space-y-6">
          {/* Header */}
          <div className="space-y-1">
            <h2 className="text-2xl font-black tracking-tight text-slate-900">
              {isRegister ? "Create Analyst Account" : "Sign in to Workspace"}
            </h2>
            <p className="text-xs font-semibold text-slate-500">
              {isRegister 
                ? "Get access to the MarketPulse AI intelligence platform." 
                : "Enter your credentials or select a demonstration account below."
              }
            </p>
          </div>

          {/* Error alert */}
          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-800">
              <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Combined credentials & Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {isRegister && (
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Full name</label>
                <div className="relative">
                  <User className="absolute top-2.5 left-3 h-4.5 w-4.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Jane Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={loading}
                    className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-3 text-xs outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Email address</label>
              <div className="relative">
                <Mail className="absolute top-2.5 left-3 h-4.5 w-4.5 text-slate-400" />
                <input
                  type="email"
                  placeholder={isRegister ? "jane.doe@organization.com" : "name@organization.com"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-3 text-xs outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                />
              </div>
            </div>

            {isRegister ? (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Password</label>
                  <div className="relative">
                    <Lock className="absolute top-2.5 left-3 h-4.5 w-4.5 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-3 text-xs outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Confirm</label>
                  <div className="relative">
                    <Lock className="absolute top-2.5 left-3 h-4.5 w-4.5 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={loading}
                      className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-3 text-xs outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Password</label>
                  <button type="button" className="text-[10px] font-bold text-indigo-600 hover:underline cursor-pointer">Forgot password?</button>
                </div>
                <div className="relative">
                  <Lock className="absolute top-2.5 left-3 h-4.5 w-4.5 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-10 text-xs outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-2.5 right-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}

            {!isRegister && (
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-650 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-350 text-indigo-600 outline-hidden"
                  />
                  <span>Remember me</span>
                </label>
              </div>
            )}

            {isRegister && (
              <div className="flex items-center justify-start py-0.5">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 hover:text-slate-700 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  <span>{showPassword ? "Hide Passwords" : "Show Passwords"}</span>
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-lg bg-indigo-600 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                isRegister ? "Create Account" : "Sign In"
              )}
            </button>
          </form>

          {/* Toggle between Login and Register states */}
          <p className="text-center text-xs font-semibold text-slate-500">
            {isRegister ? (
              <>
                Already have an account?{" "}
                <button 
                  onClick={() => { setIsRegister(false); setError(""); }}
                  className="font-bold text-indigo-600 hover:underline cursor-pointer"
                >
                  Sign In Instead
                </button>
              </>
            ) : (
              <>
                Don't have an account?{" "}
                <button 
                  onClick={() => { setIsRegister(true); setError(""); }}
                  className="font-bold text-indigo-600 hover:underline cursor-pointer"
                >
                  Create Analyst Account
                </button>
              </>
            )}
          </p>

          {/* Quick Demo Access Credentials - only show on Login mode */}
          {!isRegister && (
            <>
              <hr className="border-slate-200" />
              <div className="space-y-2">
                <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                  <Shield className="h-3.5 w-3.5 text-indigo-600" />
                  <span>Demo Quick Accounts</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {demoUsers.map((user) => (
                    <button
                      key={user.email}
                      onClick={() => handleFillDemo(user.email)}
                      disabled={loading}
                      className="flex flex-col items-start rounded-lg border border-slate-200 bg-white p-2.5 text-left hover:bg-slate-50 hover:border-indigo-400 transition-all cursor-pointer shadow-2xs"
                    >
                      <span className="text-[11px] font-bold text-slate-800">{user.label}</span>
                      <span className="text-[9px] text-slate-450 truncate w-full font-semibold">{user.email}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <DemoDataNotice />
        </div>
      </div>
    </div>
  );
};
export default Login;
