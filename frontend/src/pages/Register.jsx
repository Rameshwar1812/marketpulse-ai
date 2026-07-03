import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Lock, Mail, User, AlertTriangle } from "lucide-react";
import DemoDataNotice from "../components/common/DemoDataNotice";

export const Register = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName || !email || !password || !confirmPassword) {
      setError("Please fill in all registration fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      await register(fullName, email, password);
      navigate("/dashboard");
    } catch (e) {
      setError(e.message || "Registration failed. Email address may be taken.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-screen bg-slate-50 items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-xl border border-slate-200 p-8 shadow-xl space-y-6">
        {/* Brand logo header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold shadow-md shadow-indigo-100">
            M
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-800">Create Analyst Account</h2>
            <p className="text-xs text-slate-500 font-medium">Get access to the MarketPulse AI intelligence platform.</p>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-800">
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Full Name</label>
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

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Email address</label>
            <div className="relative">
              <Mail className="absolute top-2.5 left-3 h-4.5 w-4.5 text-slate-400" />
              <input
                type="email"
                placeholder="jane.doe@organization.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-3 text-xs outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Password</label>
              <div className="relative">
                <Lock className="absolute top-2.5 left-3 h-4.5 w-4.5 text-slate-400" />
                <input
                  type="password"
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
                  type="password"
                  placeholder="••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-3 text-xs outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-lg bg-indigo-600 py-2.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-md shadow-indigo-100 cursor-pointer"
          >
            {loading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <p className="text-center text-xs font-semibold text-slate-500">
          Already have an account?{" "}
          <Link to="/login" className="font-bold text-indigo-600 hover:underline">
            Sign In Instead
          </Link>
        </p>

        <DemoDataNotice />
      </div>
    </div>
  );
};
export default Register;
