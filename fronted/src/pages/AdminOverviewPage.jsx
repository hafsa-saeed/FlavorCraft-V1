import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

// ── Sidebar nav items ─────────────────────────────────────────────────────────
const NAV = [
  { label: "Overview", path: "/admin", icon: "◈" },
  { label: "Pending", path: "/admin/vendors/pending", icon: "⏳" },
  { label: "Approved", path: "/admin/vendors/approved", icon: "✓" },
  { label: "Rejected", path: "/admin/vendors/rejected", icon: "✕" },
];

export function AdminLayout({ children }) {
  const { pathname } = useLocation();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  return (
    <div
      className="min-h-screen bg-[#0f0f0f] flex"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Sidebar */}
      <aside className="w-60 bg-[#141414] border-r border-white/5 flex flex-col fixed h-full z-20">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FF8C00] flex items-center justify-center text-sm">
              🔥
            </div>
            <div>
              <p
                className="text-white text-sm font-bold leading-none"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                FlavorCraft
              </p>
              <p className="text-[#FF8C00] text-[10px] uppercase tracking-widest mt-0.5">
                Admin
              </p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-0.5">
          {NAV.map((item) => {
            const active = pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? "bg-[#FF8C00]/15 text-[#FF8C00]"
                    : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
                }`}
              >
                <span className="text-base w-4 text-center">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-500 hover:text-red-400 hover:bg-red-500/5 transition-all"
          >
            <span>⎋</span> Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-60 flex-1 min-h-screen">{children}</main>
    </div>
  );
}

// ── Overview / Stats page ─────────────────────────────────────────────────────
export default function AdminOverviewPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/admin/stats")
      .then((r) => setStats(r.data.stats))
      .finally(() => setLoading(false));
  }, []);

  const cards = stats
    ? [
        {
          label: "Pending Review",
          value: stats.pending,
          color: "text-amber-400",
          bg: "bg-amber-500/10",
          border: "border-amber-500/20",
          icon: "⏳",
        },
        {
          label: "Approved Vendors",
          value: stats.approved,
          color: "text-emerald-400",
          bg: "bg-emerald-500/10",
          border: "border-emerald-500/20",
          icon: "✓",
        },
        {
          label: "Rejected",
          value: stats.rejected,
          color: "text-red-400",
          bg: "bg-red-500/10",
          border: "border-red-500/20",
          icon: "✕",
        },
        {
          label: "Total Customers",
          value: stats.customers,
          color: "text-sky-400",
          bg: "bg-sky-500/10",
          border: "border-sky-500/20",
          icon: "👤",
        },
      ]
    : [];

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1
            className="text-2xl font-bold text-white"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Dashboard Overview
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            FlavorCraft platform at a glance
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-28 rounded-2xl bg-white/5 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-10">
            {cards.map((c) => (
              <div
                key={c.label}
                className={`rounded-2xl border ${c.border} ${c.bg} p-5`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xl">{c.icon}</span>
                  <span className={`text-3xl font-bold ${c.color}`}>
                    {c.value}
                  </span>
                </div>
                <p className="text-gray-400 text-sm">{c.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Quick links */}
        <div className="bg-[#141414] border border-white/5 rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                label: "Review Pending Applications",
                path: "/admin/vendors/pending",
                color:
                  "bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/20 text-amber-400",
              },
              {
                label: "View Approved Vendors",
                path: "/admin/vendors/approved",
                color:
                  "bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-400",
              },
              {
                label: "View Rejected Vendors",
                path: "/admin/vendors/rejected",
                color:
                  "bg-red-500/10 border-red-500/20 hover:bg-red-500/20 text-red-400",
              },
            ].map((a) => (
              <Link
                key={a.path}
                to={a.path}
                className={`border rounded-xl px-4 py-3 text-sm font-medium transition-all ${a.color}`}
              >
                {a.label} →
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
