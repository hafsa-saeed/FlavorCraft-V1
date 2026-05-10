import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  UtensilsCrossed,
  LayoutGrid,
  Settings,
  LogOut,
  Plus,
  Search,
  SlidersHorizontal,
  ChefHat,
  TrendingUp,
  Star,
  Clock,
  ShoppingBag,
  Flame,
  Beef,
  Droplets,
  Wheat,
  Filter,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
// VendorDashboard.jsx mein ye lines check karein:
import DishCard from "../components/vendor/DishCard";
import AddDishModal from "../components/vendor/AddDishModal";

// ── Constants ─────────────────────────────────────────────────────────────────
const CATEGORIES = [
  "All",
  "Desi",
  "BBQ & Grill",
  "Fast Food",
  "Biryani",
  "Chinese",
  "Continental",
  "Seafood",
  "Desserts",
  "Beverages",
  "Breakfast",
  "Healthy",
  "Vegan",
  "Baked Goods",
  "Other",
];

// ── Sidebar nav ───────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: "menu", label: "My Menu", icon: UtensilsCrossed },
  { id: "overview", label: "Overview", icon: LayoutGrid },
  { id: "settings", label: "Settings", icon: Settings },
];

function Sidebar({ activeView, setActiveView, profile }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

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
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-600 hover:text-red-400 hover:bg-red-500/[0.06] transition-all"
        >
          <LogOut size={14} /> Logout
        </button>
      </div>
    </aside>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color, sub }) {
  return (
    <div
      className={`bg-[#161616] border border-white/[0.06] rounded-2xl p-4 flex items-center gap-4`}
    >
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}
      >
        <Icon size={18} />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-100">{value ?? "—"}</p>
        <p className="text-[11px] text-gray-600">{label}</p>
        {sub && <p className="text-[10px] text-gray-700 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ── My Menu view ──────────────────────────────────────────────────────────────
function MenuView({ profile }) {
  const [dishes, setDishes] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editDish, setEditDish] = useState(null);
  const [availability, setAvailability] = useState("all"); // all | available | unavailable

  const fetchDishes = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category !== "All") params.set("category", category);
      if (search.trim()) params.set("search", search.trim());
      if (availability !== "all")
        params.set(
          "available",
          availability === "available" ? "true" : "false",
        );

      const [dishRes, statRes] = await Promise.all([
        api.get(`/dishes?${params}`),
        api.get("/dishes/stats"),
      ]);
      setDishes(dishRes.data.dishes);
      setStats(statRes.data.stats);
    } finally {
      setLoading(false);
    }
  }, [category, search, availability]);

  useEffect(() => {
    const t = setTimeout(fetchDishes, 250);
    return () => clearTimeout(t);
  }, [fetchDishes]);

  const openEdit = (dish) => {
    setEditDish(dish);
    setShowModal(true);
  };
  const closeModal = () => {
    setShowModal(false);
    setEditDish(null);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-8 pt-8 pb-0">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1
              className="text-2xl font-bold text-white"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              My Menu
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              {stats
                ? `${stats.total} dishes · ${stats.available} live`
                : "Loading..."}
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-orange-500/20"
          >
            <Plus size={15} /> Add Dish
          </button>
        </div>

        {/* Stats strip */}
        {stats && (
          <div className="grid grid-cols-4 gap-3 mb-6">
            <StatCard
              label="Total Dishes"
              value={stats.total}
              icon={UtensilsCrossed}
              color="bg-orange-500/15 text-orange-400"
            />
            <StatCard
              label="Live Now"
              value={stats.available}
              icon={TrendingUp}
              color="bg-emerald-500/15 text-emerald-400"
            />
            <StatCard
              label="Hidden"
              value={stats.unavailable}
              icon={Clock}
              color="bg-gray-500/15 text-gray-400"
            />
            <StatCard
              label="Categories"
              value={stats.byCategory?.length || 0}
              icon={Filter}
              color="bg-sky-500/15 text-sky-400"
            />
          </div>
        )}

        {/* Filters row */}
        <div className="flex items-center gap-3 mb-5">
          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search
              size={13}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search dishes..."
              className="w-full bg-[#161616] border border-white/[0.07] text-gray-300 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:border-orange-500/40 transition-all placeholder-gray-700"
            />
          </div>

          {/* Availability filter */}
          <div className="flex bg-[#161616] border border-white/[0.07] rounded-xl overflow-hidden">
            {[
              { val: "all", label: "All" },
              { val: "available", label: "Live" },
              { val: "unavailable", label: "Hidden" },
            ].map(({ val, label }) => (
              <button
                key={val}
                onClick={() => setAvailability(val)}
                className={`px-3 py-2 text-xs font-medium transition-all ${
                  availability === val
                    ? "bg-orange-500/20 text-orange-400"
                    : "text-gray-600 hover:text-gray-400"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Category pills */}
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all shrink-0 ${
                category === cat
                  ? "bg-orange-500/20 border-orange-500/35 text-orange-400"
                  : "bg-transparent border-white/[0.07] text-gray-600 hover:border-white/15 hover:text-gray-400"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto px-8 pb-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-80 bg-[#161616] border border-white/[0.05] rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : dishes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.04] flex items-center justify-center mb-4">
              <ChefHat size={28} className="text-gray-700" />
            </div>
            <p className="text-gray-400 font-medium mb-1">No dishes found</p>
            <p className="text-gray-700 text-sm mb-5">
              {search || category !== "All"
                ? "Try adjusting your filters"
                : "Add your first dish to get started"}
            </p>
            {!search && category === "All" && (
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-orange-500/15 hover:bg-orange-500/25 text-orange-400 border border-orange-500/25 rounded-xl text-sm font-semibold transition-all"
              >
                <Plus size={14} /> Add Your First Dish
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {dishes.map((dish) => (
              <DishCard
                key={dish._id}
                dish={dish}
                onEdit={openEdit}
                onDelete={fetchDishes}
                onRefresh={fetchDishes}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <AddDishModal
          onClose={closeModal}
          onSuccess={fetchDishes}
          editDish={editDish}
        />
      )}
    </div>
  );
}

// ── Overview placeholder ──────────────────────────────────────────────────────
function OverviewView({ profile }) {
  return (
    <div className="p-8">
      <h1
        className="text-2xl font-bold text-white mb-2"
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        Overview
      </h1>
      <p className="text-gray-600 text-sm mb-8">
        Coming in the next task — orders, revenue & analytics.
      </p>
      <div className="grid grid-cols-2 gap-4 max-w-xl">
        {[
          {
            label: "Total Orders",
            value: "—",
            icon: ShoppingBag,
            color: "bg-orange-500/15 text-orange-400",
          },
          {
            label: "Avg. Rating",
            value: "—",
            icon: Star,
            color: "bg-yellow-500/15 text-yellow-400",
          },
        ].map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>
    </div>
  );
}

// ── Settings placeholder ──────────────────────────────────────────────────────
function SettingsView({ profile }) {
  return (
    <div className="p-8">
      <h1
        className="text-2xl font-bold text-white mb-2"
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        Settings
      </h1>
      <p className="text-gray-600 text-sm">
        Profile editing and account settings — coming soon.
      </p>
      <div className="mt-6 bg-[#161616] border border-white/[0.06] rounded-2xl p-5 max-w-md">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-full overflow-hidden bg-orange-500/15 border border-orange-500/20 flex items-center justify-center">
            {profile?.profileImage ? (
              <img
                src={profile.profileImage}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-orange-400 text-xl font-bold">
                {profile?.shopName?.[0] || "V"}
              </span>
            )}
          </div>
          <div>
            <p className="text-white font-semibold">
              {profile?.shopName || "My Kitchen"}
            </p>
            <p className="text-gray-600 text-sm">{profile?.city}</p>
            <p className="text-[11px] text-gray-700 mt-0.5">
              {profile?.cuisineTypes?.join(" · ")}
            </p>
          </div>
        </div>
        <div className="bg-[#111] rounded-xl p-3 text-sm text-gray-500 leading-relaxed">
          {profile?.bio || "No bio set."}
        </div>
      </div>
    </div>
  );
}

// ── Root Dashboard ────────────────────────────────────────────────────────────
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

      {/* Main content area */}
      <main className="ml-60 flex-1 min-h-screen overflow-hidden flex flex-col">
        {activeView === "menu" && <MenuView profile={profile} />}
        {activeView === "overview" && <OverviewView profile={profile} />}
        {activeView === "settings" && <SettingsView profile={profile} />}
      </main>
    </div>
  );
}
