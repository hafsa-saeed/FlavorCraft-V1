import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  UtensilsCrossed,
  LayoutGrid,
  Settings,
  LogOut,
  Plus,
  Search,
  Tag,
  ChefHat,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

// ── Lazy-imported views (keep bundle split by view) ───────────────────────────
import OverviewView from "./OverviewView";
import SettingsView from "./SettingsView";
import DealsView from "./DealsView";

// ── MenuView kept inline (already existed in Task 3) ─────────────────────────
// Import your existing MenuView here — it lives in the same file or a separate component.
// For clarity this file re-exports a shell; paste your full MenuView here if it was inline.
import MenuView from "./MenuView"; // ← created below

// ── Sidebar nav ───────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: "menu", label: "My Menu", icon: UtensilsCrossed },
  { id: "deals", label: "Deals", icon: Tag },
  { id: "overview", label: "Overview", icon: LayoutGrid },
  { id: "settings", label: "Settings", icon: Settings },
];

function Sidebar({ activeView, setActiveView, profile }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <aside className="w-60 bg-[#0d0d0d] border-r border-white/[0.05] fixed h-full flex flex-col z-20">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-white/[0.05]">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-sm shrink-0">
            🔥
          </div>
          <div>
            <p
              className="text-white text-sm font-bold leading-none"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              FlavorCraft
            </p>
            <p className="text-orange-500 text-[10px] uppercase tracking-widest mt-0.5">
              Vendor
            </p>
          </div>
        </div>

        {/* Vendor identity */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full overflow-hidden bg-orange-500/15 border border-orange-500/20 shrink-0 flex items-center justify-center">
            {profile?.profileImage ? (
              <img
                src={profile.profileImage}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-orange-400 text-sm font-bold">
                {profile?.shopName?.[0] || "V"}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-gray-200 text-xs font-semibold truncate">
              {profile?.shopName || "My Kitchen"}
            </p>
            <p className="text-gray-600 text-[11px] truncate">
              {profile?.city || "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-0.5">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const active = activeView === id;
          return (
            <button
              key={id}
              onClick={() => setActiveView(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? "bg-orange-500/15 text-orange-400 border border-orange-500/20"
                  : "text-gray-500 hover:text-gray-300 hover:bg-white/[0.04]"
              }`}
            >
              <Icon size={15} className={active ? "text-orange-400" : ""} />
              {label}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-white/[0.05]">
        <button
          onClick={() => {
            logout();
            navigate("/auth");
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-600 hover:text-red-400 hover:bg-red-500/[0.06] transition-all"
        >
          <LogOut size={14} /> Logout
        </button>
      </div>
    </aside>
  );
}

// ── Root Dashboard ─────────────────────────────────────────────────────────────
export default function VendorDashboard() {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState("menu");
  const profile = user?.vendorProfile || {};

  return (
    <div
      className="min-h-screen bg-[#0f0f0f] flex"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        profile={profile}
      />

      <main className="ml-60 flex-1 min-h-screen overflow-hidden flex flex-col">
        {activeView === "menu" && <MenuView profile={profile} />}
        {activeView === "deals" && <DealsView />}
        {activeView === "overview" && <OverviewView profile={profile} />}
        {activeView === "settings" && <SettingsView profile={profile} />}
      </main>
    </div>
  );
}
