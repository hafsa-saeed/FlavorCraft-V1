import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";

import Navbar from "./components/Navbar";

// ── Pages ─────────────────────────────────────────────────────────────────────
// Auth & Admin
import AuthPage from "./pages/AuthPage";
import AdminOverviewPage from "./pages/AdminOverviewPage";
import AdminVendorPage from "./pages/AdminVendorPage";

// Vendor
import VendorProfileSetup from "./pages/VendorProfileSetup";
import VendorDashboard from "./pages/VendorDashboard";

// Customer
import CustomerHome from "./pages/customer/CustomerHome";
import CustomizePage from "./pages/customer/CustomizePage";
import CheckoutPage from "./pages/customer/CheckoutPage";
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import VendorProfileView from "./pages/customer/VendorProfileView";
import { AboutPage, ContactPage } from "./pages/shared/AboutContact";
import MarketplaceRulesPage from "./pages/shared/MarketplaceRulesPage";
import AdminSupportPage from "./pages/AdminSupportPage";
import AdminSiteContactPage from "./pages/AdminSiteContactPage";

// ── Route Guards ──────────────────────────────────────────────────────────────
function RequireAuth({ children, roles }) {
  const { user, loading } = useAuth();

  if (loading) return <FullPageLoader />;
  if (!user) return <Navigate to="/auth" replace />;

  if (roles && !roles.includes(user.role)) {
    // Redirect based on actual role
    if (user.role === "admin") return <Navigate to="/admin" replace />;
    if (user.role === "vendor") {
      if (!user.vendorProfile?.isProfileComplete)
        return <Navigate to="/vendor/setup" replace />;
      return <Navigate to="/vendor/dashboard" replace />;
    }
    if (user.role === "customer") return <Navigate to="/" replace />;
    return <Navigate to="/auth" replace />;
  }

  return children;
}

function RedirectIfAuth({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <FullPageLoader />;

  if (user) {
    if (user.role === "admin") return <Navigate to="/admin" replace />;
    if (user.role === "vendor") {
      if (!user.vendorProfile?.isProfileComplete)
        return <Navigate to="/vendor/setup" replace />;
      return <Navigate to="/vendor/dashboard" replace />;
    }
    if (user.role === "customer") return <Navigate to="/" replace />;
  }

  return children;
}

function RequireApprovedVendor({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <FullPageLoader />;
  if (!user || user.role !== "vendor") return <Navigate to="/auth" replace />;

  if (user.status === "pending")
    return <PendingApprovalWall status="pending" />;
  if (user.status === "rejected")
    return <PendingApprovalWall status="rejected" note={user.adminNote} />;
  if (user.status !== "approved") return <Navigate to="/auth" replace />;

  return children;
}

// ── Loaders & Walls ───────────────────────────────────────────────────────────
function FullPageLoader() {
  return (
    <div
      className="min-h-screen bg-[#09090b] flex items-center justify-center"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <div className="text-orange-500 text-4xl animate-pulse">🔥</div>
    </div>
  );
}

function PendingApprovalWall({ status, note }) {
  const { logout } = useAuth();
  return (
    <div
      className="min-h-screen bg-[#09090b] flex items-center justify-center p-4"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <div className="text-center max-w-sm">
        <div className="text-6xl mb-6">
          {status === "rejected" ? "❌" : "⏳"}
        </div>
        <h2
          className="text-2xl font-bold text-white mb-3"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          {status === "rejected" ? "Application Rejected" : "Approval Pending"}
        </h2>
        <p className="text-gray-500 text-sm mb-6 leading-relaxed">
          {status === "rejected"
            ? note ||
              "Your vendor application was not approved. Please contact support for details."
            : "Your vendor application is under review. Our team will respond within 24–48 hours. You'll receive an email notification once approved."}
        </p>
        <button
          onClick={logout}
          className="text-gray-600 hover:text-gray-400 text-sm transition-colors"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Navbar />
          {/* <div className="pt-16"></div> */}
          <Routes>
            {/* ── Public routes (no auth required) ───────────────────────── */}
            <Route path="/" element={<CustomerHome />} />
            <Route path="/customize/:dishId" element={<CustomizePage />} />
            <Route path="/vendor/:vendorId" element={<VendorProfileView />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/marketplace-rules" element={<MarketplaceRulesPage />} />

            {/* ── Auth ──────────────────────────────────────────────────── */}
            <Route
              path="/auth"
              element={
                <RedirectIfAuth>
                  <AuthPage />
                </RedirectIfAuth>
              }
            />

            {/* ── Customer routes (require customer role) ───────────────── */}
            <Route
              path="/checkout"
              element={
                <RequireAuth roles={["customer"]}>
                  <CheckoutPage />
                </RequireAuth>
              }
            />
            <Route
              path="/dashboard"
              element={
                <RequireAuth roles={["customer"]}>
                  <CustomerDashboard />
                </RequireAuth>
              }
            />

            {/* ── Vendor routes ─────────────────────────────────────────── */}
            <Route
              path="/vendor/setup"
              element={
                <RequireApprovedVendor>
                  <VendorProfileSetup />
                </RequireApprovedVendor>
              }
            />
            <Route
              path="/vendor/dashboard"
              element={
                <RequireApprovedVendor>
                  <VendorDashboard />
                </RequireApprovedVendor>
              }
            />

            {/* ── Admin routes ──────────────────────────────────────────── */}
            <Route
              path="/admin"
              element={
                <RequireAuth roles={["admin"]}>
                  <AdminOverviewPage />
                </RequireAuth>
              }
            />
            <Route
              path="/admin/site-contact"
              element={
                <RequireAuth roles={["admin"]}>
                  <AdminSiteContactPage />
                </RequireAuth>
              }
            />
            <Route
              path="/admin/support"
              element={
                <RequireAuth roles={["admin"]}>
                  <AdminSupportPage />
                </RequireAuth>
              }
            />
            <Route
              path="/admin/vendors/:status"
              element={
                <RequireAuth roles={["admin"]}>
                  <AdminVendorPage />
                </RequireAuth>
              }
            />
            <Route
              path="/admin/vendors"
              element={<Navigate to="/admin/vendors/pending" replace />}
            />

            {/* ── Fallback ──────────────────────────────────────────────── */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
