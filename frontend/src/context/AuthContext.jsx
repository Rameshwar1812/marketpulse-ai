import React, { createContext, useState, useEffect, useContext } from "react";
import { authStorage } from "../services/auth";
import { api } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on startup
  useEffect(() => {
    const restoreSession = async () => {
      const cachedToken = authStorage.getToken();
      const cachedUser = authStorage.getUser();

      if (cachedToken && cachedUser) {
        setUser(cachedUser);
        
        // Asynchronously fetch fresh user info to verify token status
        try {
          const freshUser = await api.get("/api/auth/me");
          setUser(freshUser);
          authStorage.setUser(freshUser);
        } catch (e) {
          console.warn("Failed to verify token, clearing session", e);
          authStorage.clearAll();
          setUser(null);
        }
      }
      setLoading(false);
    };

    restoreSession();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post("/api/auth/login", { email, password });
      authStorage.setToken(res.access_token);
      authStorage.setUser(res.user);
      setUser(res.user);
      return res.user;
    } catch (e) {
      setUser(null);
      authStorage.clearAll();
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const register = async (fullName, email, password) => {
    setLoading(true);
    try {
      // Register new user, defaults to analyst role
      const res = await api.post("/api/auth/register", { 
        full_name: fullName, 
        email, 
        password,
        role: "analyst"
      });
      authStorage.setToken(res.access_token);
      authStorage.setUser(res.user);
      setUser(res.user);
      return res.user;
    } catch (e) {
      setUser(null);
      authStorage.clearAll();
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authStorage.clearAll();
    setUser(null);
    window.location.href = "/login";
  };

  const hasRole = (allowedRoles) => {
    if (!user) return false;
    return allowedRoles.includes(user.role);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    register,
    logout,
    hasRole
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
export default AuthContext;
