import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import AuthPage from "./pages/AuthPage";
import AdminOverviewPage from "./pages/AdminOverviewPage";
import AdminVendorPage from "./pages/AdminVendorPage";
import VendorProfileSetup from "./pages/VendorProfileSetup";
import VendorDashboard from "./pages/vendor/VendorDashboard";

// ── Guards ────────────────────────────────────────────────────────────────────
function RequireAuth({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  if (!user) return <Navigate to="/auth" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

function RedirectIfAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  if (user) {
    if (user.role === "admin") return <Navigate to="/admin" replace />;
    if (user.role === "vendor") {
      if (!user.vendorProfile?.isProfileComplete)
        return <Navigate to="/vendor/setup" replace />;
      return <Navigate to="/vendor/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }
  return children;
}

function RequireApprovedVendor({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  if (!user || user.role !== "vendor") return <Navigate to="/auth" replace />;
  if (user.status !== "approved") return <PendingWall user={user} />;
  return children;
}

// ── Placeholder pages ─────────────────────────────────────────────────────────
function CustomerHome() {
  const { user, logout } = useAuth();
  return (
    <div
      className="min-h-screen bg-[#0f0f0f] flex items-center justify-center"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <div className="text-center">
        <p className="text-5xl mb-4">🔥</p>
        <h1
          className="text-2xl font-bold text-white mb-2"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Welcome, {user?.name}!
        </h1>
        <p className="text-gray-500 text-sm mb-6">
          Customer marketplace — coming soon.
        </p>
        <button
          onClick={logout}
          className="px-5 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

function PendingWall({ user }) {
  const { logout } = useAuth();
  return (
    <div
      className="min-h-screen bg-[#0f0f0f] flex items-center justify-center p-4"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <div className="text-center max-w-sm">
        <p className="text-5xl mb-5">
          {user?.status === "rejected" ? "❌" : "⏳"}
        </p>
        <h2
          className="text-2xl font-bold text-white mb-2"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          {user?.status === "rejected"
            ? "Application Rejected"
            : "Application Pending"}
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          {user?.status === "rejected"
            ? user.adminNote ||
              "Your application was not approved. Contact support."
            : "Our team is reviewing your application. You'll get access within 24–48 hours."}
        </p>
        <button
          onClick={logout}
          className="text-sm text-gray-600 hover:text-gray-400 transition-colors"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}

function Loader() {
  return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
      <div className="text-orange-500 text-3xl animate-pulse">🔥</div>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route
            path="/auth"
            element={
              <RedirectIfAuth>
                <AuthPage />
              </RedirectIfAuth>
            }
          />
          <Route
            path="/"
            element={
              <RequireAuth roles={["customer"]}>
                <CustomerHome />
              </RequireAuth>
            }
          />

          {/* Vendor */}
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

          {/* Admin */}
          <Route
            path="/admin"
            element={
              <RequireAuth roles={["admin"]}>
                <AdminOverviewPage />
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

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
