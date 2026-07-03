import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Lock, Mail, AlertTriangle, Eye, EyeOff, User } from "lucide-react";

export const Login = ({ defaultRegister = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, isAuthenticated } = useAuth();
  const toast = useToast();

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

  // Handle success logout toast notification
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("logout") === "true") {
      toast.success("Successfully logged out of your session.");
      navigate("/login", { replace: true });
    }
  }, [location, toast, navigate]);

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
      if (!fullName || !email || !password || !confirmPassword) {
        setError("Please fill in all register fields.");
        toast.error("Please fill in all register fields.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        toast.error("Passwords do not match.");
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        toast.error("Password must be at least 6 characters.");
        return;
      }

      setLoading(true);
      try {
        await register(fullName, email, password);
        toast.success("Account created successfully! Welcome to MarketPulse AI.");
        navigate("/dashboard", { replace: true });
      } catch (err) {
        const errMsg = err.message || "Failed to create account. Email may already be registered.";
        setError(errMsg);
        toast.error(errMsg);
      } finally {
        setLoading(false);
      }
    } else {
      if (!email || !password) {
        setError("Please fill in all credential fields.");
        toast.error("Please fill in all credential fields.");
        return;
      }

      setLoading(true);
      try {
        await login(email, password);
        toast.success("Welcome back! Successfully signed in.");
        const from = location.state?.from?.pathname || "/dashboard";
        navigate(from, { replace: true });
      } catch (err) {
        const errMsg = err.message || "Invalid email or password. Please verify your credentials.";
        setError(errMsg);
        toast.error(errMsg);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen w-screen bg-slate-50 select-none">
      {/* Left Column: Visual Brand Composition (Responsive: stacks on mobile, side-by-side on desktop) */}
      <div className="flex w-full md:w-1/2 flex-col justify-between bg-slate-900 p-8 md:p-12 text-white relative overflow-hidden min-h-[300px] md:min-h-screen">
        {/* Abstract grid lines background */}
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-violet-500 blur-3xl opacity-30"></div>
        </div>

        {/* Top Header */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600 text-white font-bold shadow-lg shadow-violet-500/25">
            M
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight text-white">MarketPulse AI</span>
            <span className="text-[9px] text-slate-400 font-bold tracking-wider uppercase">Market Product Trend Assistant</span>
          </div>
        </div>

        {/* Brand Headline */}
        <div className="relative z-10 my-8 md:my-auto max-w-md space-y-4">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight leading-tight">
            Traceable, decision-ready market intelligence.
          </h1>
          <p className="text-xs md:text-sm text-slate-400 font-medium leading-relaxed">
            Centralize health supplements data research, monitor hero formulation trends, and review packaging claims in a secure audit workspace.
          </p>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
          Secure Portal &bull; MarketPulse AI
        </div>
      </div>

      {/* Right Column: Authentication Form Area */}
      <div className="flex w-full md:w-1/2 items-center justify-center p-6 md:p-12 min-h-[400px] md:min-h-screen bg-slate-50">
        <div className="w-full max-w-md bg-white rounded-xl border border-slate-200 p-8 shadow-xl space-y-6">
          {/* Form Header */}
          <div className="space-y-1">
            <h2 className="text-xl font-black tracking-tight text-slate-900">
              {isRegister ? "Create Analyst Account" : "Sign In"}
            </h2>
            <p className="text-xs text-slate-500 font-semibold">
              {isRegister 
                ? "Get access to the MarketPulse AI intelligence platform." 
                : "Enter your email and password to access the portal."
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

          {/* Credentials Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {isRegister && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Full name</label>
                <div className="relative">
                  <User className="absolute top-2.5 left-3 h-4.5 w-4.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Aarav Sharma"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={loading}
                    className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-3 text-xs outline-hidden focus:border-violet-600 focus:ring-1 focus:ring-violet-600"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Email address</label>
              <div className="relative">
                <Mail className="absolute top-2.5 left-3 h-4.5 w-4.5 text-slate-400" />
                <input
                  type="email"
                  placeholder="aarav.sharma@marketpulse.ai"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-3 text-xs outline-hidden focus:border-violet-600 focus:ring-1 focus:ring-violet-600"
                />
              </div>
            </div>

            {isRegister ? (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Password</label>
                  <div className="relative">
                    <Lock className="absolute top-2.5 left-3 h-4.5 w-4.5 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-3 text-xs outline-hidden focus:border-violet-600 focus:ring-1 focus:ring-violet-600"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Confirm</label>
                  <div className="relative">
                    <Lock className="absolute top-2.5 left-3 h-4.5 w-4.5 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={loading}
                      className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-3 text-xs outline-hidden focus:border-violet-600 focus:ring-1 focus:ring-violet-600"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Password</label>
                  <button type="button" className="text-[10px] font-bold text-violet-600 hover:underline cursor-pointer">Forgot password?</button>
                </div>
                <div className="relative">
                  <Lock className="absolute top-2.5 left-3 h-4.5 w-4.5 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-10 text-xs outline-hidden focus:border-violet-600 focus:ring-1 focus:ring-violet-600"
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
                    className="rounded border-slate-350 text-violet-600 outline-hidden"
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
              className="flex w-full items-center justify-center rounded-lg bg-violet-600 py-2.5 text-xs font-bold text-white hover:bg-violet-700 disabled:opacity-50 transition-colors shadow-md shadow-violet-100 cursor-pointer"
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                isRegister ? "Create Account" : "Sign In"
              )}
            </button>
          </form>

          {/* Toggle link */}
          <p className="text-center text-xs font-semibold text-slate-500">
            {isRegister ? (
              <>
                Already have an account?{" "}
                <button 
                  onClick={() => { setIsRegister(false); setError(""); }}
                  className="font-bold text-violet-600 hover:underline cursor-pointer"
                >
                  Sign In Instead
                </button>
              </>
            ) : (
              <>
                Don't have an account?{" "}
                <button 
                  onClick={() => { setIsRegister(true); setError(""); }}
                  className="font-bold text-violet-600 hover:underline cursor-pointer"
                >
                  Create Analyst Account
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};
export default Login;
