import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { AppLayout } from "./components/layout/AppLayout";

// Import Pages
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Dashboard } from "./pages/Dashboard";
import { MarketExplorer } from "./pages/MarketExplorer";
import { Products } from "./pages/Products";
import { ProductDetail } from "./pages/ProductDetail";
import { AskIntelligence } from "./pages/AskIntelligence";
import { ReviewQueue } from "./pages/ReviewQueue";
import { AuditTrail } from "./pages/AuditTrail";
import { DataSources } from "./pages/DataSources";
import { NotFound } from "./pages/NotFound";

function App() {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

          {/* Protected Main Workspace Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/market-explorer"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <MarketExplorer />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/products"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Products />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/products/:id"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <ProductDetail />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/ask"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <AskIntelligence />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Role Protected Governance Routes */}
          <Route
            path="/review"
            element={
              <ProtectedRoute allowedRoles={["reviewer", "admin"]}>
                <AppLayout>
                  <ReviewQueue />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/audit"
            element={
              <ProtectedRoute allowedRoles={["reviewer", "admin"]}>
                <AppLayout>
                  <AuditTrail />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Data Ingestion Routes */}
          <Route
            path="/sources"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <DataSources />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Redirect / to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Fallback 404 */}
          <Route
            path="*"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <NotFound />
                </AppLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
      </ToastProvider>
    </Router>
  );
}

export default App;
