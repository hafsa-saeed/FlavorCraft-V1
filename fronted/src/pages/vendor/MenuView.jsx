// ─── src/pages/vendor/MenuView.jsx ───────────────────────────────────────────
// This is your existing MenuView from Task 3's VendorDashboard.jsx,
// extracted into its own file so the updated VendorDashboard can import it cleanly.
//
// ── INSTRUCTIONS ──────────────────────────────────────────────────────────────
// 1. Open your Task 3 VendorDashboard.jsx
// 2. Find the `function MenuView({ profile }) { ... }` block
// 3. Cut it out of that file entirely
// 4. Paste it below this comment block, replacing this entire comment
// 5. Add the import at the top and the export at the bottom
//
// The final file should look exactly like this template:

import { useState, useEffect, useCallback } from "react";
import {
  UtensilsCrossed,
  Plus,
  Search,
  ChefHat,
  TrendingUp,
  Clock,
  Filter,
} from "lucide-react";
import api from "../../utils/api";
import DishCard from "../../components/vendor/DishCard";
import AddDishModal from "../../components/vendor/AddDishModal";

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

function StatCard({ label, value, icon: Icon, color }) {
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
      </div>
    </div>
  );
}

export default function MenuView({ profile }) {
  const [dishes, setDishes] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editDish, setEditDish] = useState(null);
  const [availability, setAvailability] = useState("all");

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

        {/* Stats */}
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
              value={stats.byCategory?.length}
              icon={Filter}
              color="bg-sky-500/15 text-sky-400"
            />
          </div>
        )}

        {/* Filters */}
        <div className="flex items-center gap-3 mb-5">
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
          <div className="flex bg-[#161616] border border-white/[0.07] rounded-xl overflow-hidden">
            {[
              { val: "all", label: "All" },
              { val: "available", label: "Live" },
              { val: "unavailable", label: "Hidden" },
            ].map(({ val, label }) => (
              <button
                key={val}
                onClick={() => setAvailability(val)}
                className={`px-3 py-2 text-xs font-medium transition-all ${availability === val ? "bg-orange-500/20 text-orange-400" : "text-gray-600 hover:text-gray-400"}`}
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
