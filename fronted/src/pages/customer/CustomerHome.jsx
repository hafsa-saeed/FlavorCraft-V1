import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Search,
  X,
  Flame,
  Heart,
  Star,
  ShoppingBag,
  Leaf,
  Zap,
  Droplets,
  ChevronRight,
  TrendingUp,
  Filter,
  LayoutGrid,
  List,
  Tag,
  Percent,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import api from "../../utils/api";
import { getDishVendorIdString } from "../../utils/dishVendor";

// ── Constants ─────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { label: "All", icon: "🍽️" },
  { label: "Desi", icon: "🍛" },
  { label: "BBQ & Grill", icon: "🔥" },
  { label: "Fast Food", icon: "🍔" },
  { label: "Biryani", icon: "🍚" },
  { label: "Chinese", icon: "🥢" },
  { label: "Continental", icon: "🥩" },
  { label: "Seafood", icon: "🦐" },
  { label: "Desserts", icon: "🍮" },
  { label: "Healthy", icon: "🥗" },
  { label: "Vegan", icon: "🌿" },
];

const HEALTH_TAG_META = {
  "Diabetic Friendly": {
    bg: "bg-blue-500/20",
    text: "text-blue-300",
    icon: "💙",
  },
  "Low Oil": { bg: "bg-green-500/20", text: "text-green-300", icon: "🫒" },
  "High Protein": { bg: "bg-red-500/20", text: "text-red-300", icon: "💪" },
  Vegan: { bg: "bg-emerald-500/20", text: "text-emerald-300", icon: "🌿" },
  Keto: { bg: "bg-purple-500/20", text: "text-purple-300", icon: "⚡" },
  "Low Calorie": { bg: "bg-sky-500/20", text: "text-sky-300", icon: "🎯" },
  "Gluten Free": { bg: "bg-amber-500/20", text: "text-amber-300", icon: "🌾" },
  Spicy: { bg: "bg-orange-500/20", text: "text-orange-300", icon: "🌶️" },
};

// Mock health tags per category (until backend supports it)
const MOCK_HEALTH_TAGS = {
  Healthy: ["Low Calorie", "Low Oil", "High Protein"],
  Vegan: ["Vegan", "Low Oil", "Gluten Free"],
  Desi: ["High Protein", "Spicy"],
  Biryani: ["High Protein"],
  Chinese: ["Low Oil"],
};

// ── Skeleton ──────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="animate-pulse flex flex-col">
      <div className="w-full aspect-[4/3] rounded-2xl bg-[#1e1e1e] mb-3" />
      <div className="flex gap-2.5 items-start">
        <div className="w-9 h-9 rounded-full bg-[#1e1e1e] shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-[#1e1e1e] rounded-full w-4/5" />
          <div className="h-2.5 bg-[#1e1e1e] rounded-full w-3/5" />
          <div className="h-2 bg-[#1e1e1e] rounded-full w-2/5" />
        </div>
      </div>
    </div>
  );
}

// ── Dish feed card (YouTube/Instagram style) ──────────────────────────────────
function DishFeedCard({ dish, index, favoriteIds, onFavoriteChange }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [imgErr, setImgErr] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [favBusy, setFavBusy] = useState(false);
  const liked = favoriteIds?.has(String(dish._id)) ?? false;

  const vendor = dish.vendorId || {};
  const profile = vendor.vendorProfile || {};
  const vendorRouteId = getDishVendorIdString(dish);
  const healthTags = MOCK_HEALTH_TAGS[dish.category] || [];
  const isTrending = (dish.orderCount || 0) > 10;
  const rating = (4 + Math.random()).toFixed(1);
  const likes = Math.floor(Math.random() * 300) + 20;

  const handleCustomize = (e) => {
    e.stopPropagation();
    navigate(`/customize/${dish._id}`, { state: { dish } });
  };

  const handleVendorClick = (e) => {
    e.stopPropagation();
    if (vendorRouteId) navigate(`/vendor/${vendorRouteId}`);
  };

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!user) {
      navigate("/auth");
      return;
    }
    if (user.role !== "customer" || favBusy || String(dish._id).startsWith("mock-")) {
      return;
    }
    setFavBusy(true);
    try {
      const res = await api.post("/customer/favorites/toggle", {
        dishId: dish._id,
      });
      onFavoriteChange?.(dish._id, Boolean(res.data?.isFavorite));
    } catch {
      /* ignore */
    } finally {
      setFavBusy(false);
    }
  };

  return (
    <article
      className="group cursor-pointer"
      style={{ animationDelay: `${index * 35}ms` }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => {
        if (vendorRouteId) navigate(`/vendor/${vendorRouteId}`);
        else navigate(`/customize/${dish._id}`, { state: { dish } });
      }}
    >
      {/* Thumbnail */}
      <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-[#161616] mb-3 border border-white/[0.04]">
        {dish.image && !imgErr ? (
          <img
            src={dish.image}
            alt={dish.name}
            onError={() => setImgErr(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
            style={{ transform: hovered ? "scale(1.08)" : "scale(1)" }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d]">
            <span className="text-5xl opacity-15">🍽️</span>
          </div>
        )}

        {/* Dark overlay on hover */}
        <div
          className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${hovered ? "opacity-100" : "opacity-0"}`}
        />

        {/* Top badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
          {isTrending && (
            <span className="flex items-center gap-1 bg-orange-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
              <Flame size={9} /> Trending
            </span>
          )}
          {healthTags.slice(0, 2).map((tag) => {
            const meta = HEALTH_TAG_META[tag] || {};
            return (
              <span
                key={tag}
                className={`${meta.bg} backdrop-blur-sm ${meta.text} text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1`}
              >
                <span className="text-[9px]">{meta.icon}</span> {tag}
              </span>
            );
          })}
        </div>

        {/* Price badge */}
        <div className="absolute top-2.5 right-2.5">
          <span className="bg-black/75 backdrop-blur-sm text-white text-sm font-bold px-3 py-1 rounded-full border border-white/10">
            ₨{dish.price?.toLocaleString()}
          </span>
        </div>

        {/* Like button */}
        <button
          type="button"
          onClick={handleLike}
          disabled={favBusy}
          className={`absolute bottom-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm border transition-all ${
            liked
              ? "bg-red-500/90 border-red-500 text-white"
              : "bg-black/60 border-white/20 text-gray-300 hover:text-red-400"
          } ${favBusy ? "opacity-60" : ""}`}
        >
          <Heart size={13} fill={liked ? "currentColor" : "none"} />
        </button>

        {/* Hover CTA */}
        <div
          className={`absolute inset-0 flex items-end justify-center pb-5 transition-all duration-300 ${hovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
        >
          <button
            onClick={handleCustomize}
            className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm rounded-full shadow-lg shadow-orange-500/40 transition-all active:scale-95"
          >
            <Zap size={14} /> Customize & Add
          </button>
        </div>
      </div>

      {/* Below thumbnail — YouTube-style */}
      <div className="flex gap-2.5">
        {/* Vendor avatar */}
        <button
          onClick={handleVendorClick}
          className="w-9 h-9 rounded-full overflow-hidden shrink-0 mt-0.5 border border-white/[0.07] hover:border-orange-500/40 transition-colors bg-[#1a1a1a]"
          title={`Visit ${profile.shopName}`}
        >
          {profile.profileImage ? (
            <img
              src={profile.profileImage}
              alt={profile.shopName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-orange-500/15">
              <span className="text-orange-400 text-xs font-bold">
                {(profile.shopName || "K")[0]}
              </span>
            </div>
          )}
        </button>

        <div className="flex-1 min-w-0">
          <h3 className="text-gray-200 text-sm font-semibold leading-snug line-clamp-2 group-hover:text-white transition-colors">
            {dish.name}
          </h3>
          <button
            onClick={handleVendorClick}
            className="text-gray-500 text-xs hover:text-orange-400 transition-colors font-medium block mt-0.5 mb-1"
          >
            {profile.shopName || "Kitchen"}
          </button>
          <div className="flex items-center gap-2.5 text-[11px] text-gray-600">
            <span className="flex items-center gap-0.5">
              <Star size={10} className="text-yellow-400 fill-yellow-400" />{" "}
              {rating}
            </span>
            <span>·</span>
            <span className="flex items-center gap-0.5">
              <Heart size={9} className={liked ? "text-red-400" : ""} /> {likes}
            </span>
            {dish.orderCount > 0 && (
              <>
                <span>·</span>
                <span>{dish.orderCount} orders</span>
              </>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

// ── Deal feed card (home feed) ───────────────────────────────────────────────
function DealFeedCard({ deal, index }) {
  const navigate = useNavigate();
  const [imgErr, setImgErr] = useState(false);
  const [hovered, setHovered] = useState(false);
  const vendor = deal.vendorId || {};
  const profile = vendor.vendorProfile || {};
  const vendorId = getDishVendorIdString(deal);
  const cover =
    deal.image || deal.items?.find((i) => i.dish?.image)?.dish?.image || "";
  const pct =
    typeof deal.savingsPercent === "number"
      ? deal.savingsPercent
      : deal.originalPrice > 0
        ? Math.round(
            ((deal.originalPrice - deal.dealPrice) / deal.originalPrice) * 100,
          )
        : 0;

  const goVendorDeals = (e) => {
    e.stopPropagation();
    if (vendorId)
      navigate(`/vendor/${vendorId}`, { state: { openSection: "deals" } });
  };

  return (
    <article
      className="group cursor-pointer"
      style={{ animationDelay: `${index * 35}ms` }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => {
        if (vendorId)
          navigate(`/vendor/${vendorId}`, { state: { openSection: "deals" } });
      }}
    >
      <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-[#161616] mb-3 border border-white/[0.04]">
        {cover && !imgErr ? (
          <img
            src={cover}
            alt={deal.title}
            onError={() => setImgErr(true)}
            className="w-full h-full object-cover transition-transform duration-500"
            style={{ transform: hovered ? "scale(1.08)" : "scale(1)" }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-900/30 to-[#0d0d0d]">
            <Tag size={40} className="text-orange-500/25" />
          </div>
        )}
        <div
          className={`absolute inset-0 bg-black/45 transition-opacity duration-300 ${hovered ? "opacity-100" : "opacity-0"}`}
        />
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
          <span className="flex items-center gap-1 bg-violet-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
            <Tag size={9} /> Deal
          </span>
          {pct > 0 && (
            <span className="flex items-center gap-1 bg-emerald-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
              <Percent size={9} /> {pct}% off
            </span>
          )}
        </div>
        <div className="absolute top-2.5 right-2.5">
          <span className="bg-black/75 backdrop-blur-sm text-orange-300 text-sm font-bold px-3 py-1 rounded-full border border-orange-500/25">
            ₨{deal.dealPrice?.toLocaleString()}
          </span>
        </div>
        <div
          className={`absolute inset-0 flex items-end justify-center pb-5 transition-all duration-300 ${hovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
        >
          <button
            type="button"
            onClick={goVendorDeals}
            className="flex items-center gap-2 px-5 py-2.5 bg-violet-500 hover:bg-violet-600 text-white font-bold text-sm rounded-full shadow-lg transition-all active:scale-95"
          >
            <Tag size={14} /> View on kitchen
          </button>
        </div>
      </div>
      <div className="flex gap-2.5">
        <button
          type="button"
          onClick={goVendorDeals}
          className="w-9 h-9 rounded-full overflow-hidden shrink-0 mt-0.5 border border-white/[0.07] hover:border-violet-500/40 transition-colors bg-[#1a1a1a]"
        >
          {profile.profileImage ? (
            <img
              src={profile.profileImage}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-violet-500/15">
              <span className="text-violet-300 text-xs font-bold">
                {(profile.shopName || "K")[0]}
              </span>
            </div>
          )}
        </button>
        <div className="flex-1 min-w-0">
          <h3 className="text-gray-200 text-sm font-semibold leading-snug line-clamp-2 group-hover:text-white transition-colors">
            {deal.title}
          </h3>
          <button
            type="button"
            onClick={goVendorDeals}
            className="text-gray-500 text-xs hover:text-violet-400 transition-colors font-medium block mt-0.5"
          >
            {profile.shopName || "Kitchen"} · bundle
          </button>
          {deal.description && (
            <p className="text-gray-600 text-[11px] line-clamp-2 mt-1">
              {deal.description}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}

// ── Header ────────────────────────────────────────────────────────────────────
function FeedHeader({ search, setSearch, category, setCategory }) {
  const { user } = useAuth();
  const { itemCount, openDrawer } = useCart();
  const navigate = useNavigate();
  const [focused, setFocused] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#09090b]/95 backdrop-blur-2xl border-b border-white/[0.06]">
      {/* Top row */}
      <div className="flex items-center gap-4 px-4 sm:px-6 py-3.5">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-8 h-8 rounded-xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30 group-hover:shadow-orange-500/50 transition-all">
            🔥
          </div>
          <span
            className="text-white font-black text-xl hidden sm:block"
            style={{
              fontFamily: "'Playfair Display', serif",
              letterSpacing: "-0.02em",
            }}
          >
            FlavorCraft
          </span>
        </Link>

        {/* Search */}
        <div
          className={`flex-1 max-w-xl mx-auto relative transition-all ${focused ? "max-w-2xl" : ""}`}
        >
          <div
            className={`flex items-center bg-[#18181b] border rounded-2xl px-4 gap-3 transition-all ${focused ? "border-orange-500/50 shadow-lg shadow-orange-500/10" : "border-white/[0.06]"}`}
          >
            <Search
              size={15}
              className={`shrink-0 transition-colors ${focused ? "text-orange-400" : "text-gray-600"}`}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="Search dishes, kitchens, cuisines..."
              className="flex-1 bg-transparent text-gray-200 text-sm py-2.5 outline-none placeholder-gray-600"
            />
            {search && (
              <button onClick={() => setSearch("")}>
                <X size={14} className="text-gray-600 hover:text-gray-400" />
              </button>
            )}
          </div>
        </div>

        {/* Nav actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Cart */}
          <button
            onClick={openDrawer}
            className="relative w-10 h-10 rounded-xl bg-[#18181b] border border-white/[0.06] flex items-center justify-center text-gray-400 hover:text-orange-400 hover:border-orange-500/30 transition-all"
          >
            <ShoppingBag size={17} />
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-lg shadow-orange-500/50">
                {itemCount}
              </span>
            )}
          </button>

          {user ? (
            <Link
              to="/dashboard"
              className="w-9 h-9 rounded-full overflow-hidden bg-orange-500/15 border border-orange-500/20 flex items-center justify-center"
            >
              <span className="text-orange-400 text-xs font-bold">
                {(user.name || user.email)[0].toUpperCase()}
              </span>
            </Link>
          ) : (
            <Link
              to="/auth"
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-orange-500/30"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>

      {/* Category pills */}
      <div className="flex items-center gap-2 px-4 sm:px-6 pb-3 overflow-x-auto scrollbar-hide">
        {CATEGORIES.map((cat) => {
          const active = category === cat.label;
          return (
            <button
              key={cat.label}
              onClick={() => setCategory(cat.label)}
              className={`flex items-center gap-1.5 whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all shrink-0 ${
                active
                  ? "bg-orange-500 border-transparent text-white shadow-md shadow-orange-500/30"
                  : "bg-transparent border-white/[0.08] text-gray-500 hover:text-gray-300 hover:border-white/[0.16]"
              }`}
            >
              <span className="text-sm">{cat.icon}</span> {cat.label}
            </button>
          );
        })}
      </div>
    </header>
  );
}

// ── Hero ──────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <div className="relative overflow-hidden rounded-3xl mb-10 border border-orange-500/10">
      {/* Background layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a0800] via-[#140c00] to-[#0a0a0a]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_60%,rgba(249,115,22,0.18),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(249,115,22,0.08),transparent_50%)]" />
      {/* Grain */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E\")",
        }}
      />

      <div className="relative z-10 px-8 py-14 max-w-2xl">
        <div className="inline-flex items-center gap-2 bg-orange-500/15 border border-orange-500/25 text-orange-400 text-[11px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full mb-5">
          <Flame size={11} /> Your Food Feed
        </div>
        <h1
          className="text-4xl sm:text-5xl font-black text-white leading-tight mb-4"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Crafted food, exactly{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">
            your way.
          </span>
        </h1>
        <p className="text-gray-400 text-base leading-relaxed mb-7 max-w-lg">
          Discover dishes from home chefs and professional kitchens. Every meal
          customized — your ingredients, your spice, your health rules.
        </p>
        <div className="flex flex-wrap gap-3">
          {[
            "Diabetic Friendly 💙",
            "Low Oil 🫒",
            "High Protein 💪",
            "Keto ⚡",
          ].map((tag) => (
            <span
              key={tag}
              className="bg-white/[0.06] border border-white/[0.08] text-gray-300 text-xs font-semibold px-3 py-1.5 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Decorative food emojis */}
      <div className="absolute right-12 top-1/2 -translate-y-1/2 hidden lg:grid grid-cols-2 gap-4 opacity-20 select-none text-5xl">
        <span
          className="rotate-12 animate-bounce"
          style={{ animationDelay: "0s" }}
        >
          🍛
        </span>
        <span
          className="-rotate-6 animate-bounce"
          style={{ animationDelay: "0.3s" }}
        >
          🔥
        </span>
        <span
          className="rotate-6 animate-bounce"
          style={{ animationDelay: "0.6s" }}
        >
          🥗
        </span>
        <span
          className="-rotate-12 animate-bounce"
          style={{ animationDelay: "0.9s" }}
        >
          🍖
        </span>
      </div>
    </div>
  );
}

// ── Cart drawer (mini) ────────────────────────────────────────────────────────
function CartDrawer() {
  const {
    items,
    drawerOpen,
    closeDrawer,
    updateQty,
    removeItem,
    subtotal,
    grandTotal,
    deliveryFee,
    platformFee,
    itemCount,
  } = useCart();
  const navigate = useNavigate();

  if (!drawerOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={closeDrawer}
      />
      <div className="relative w-full max-w-sm bg-[#111] border-l border-white/[0.07] h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.07]">
          <div className="flex items-center gap-2">
            <ShoppingBag size={17} className="text-orange-400" />
            <span className="text-white font-bold">Cart</span>
            {itemCount > 0 && (
              <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {itemCount}
              </span>
            )}
          </div>
          <button
            onClick={closeDrawer}
            className="text-gray-500 hover:text-gray-300 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto py-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
              <div className="text-5xl mb-4">🛒</div>
              <p className="text-gray-400 font-medium mb-1">
                Your cart is empty
              </p>
              <p className="text-gray-700 text-sm">Add dishes from the feed</p>
            </div>
          ) : (
            <div className="space-y-3 px-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#161616] border border-white/[0.06] rounded-xl p-3.5"
                >
                  <div className="flex items-start gap-3 mb-2">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 rounded-lg object-cover shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-200 text-sm font-semibold truncate">
                        {item.name}
                      </p>
                      <p className="text-gray-600 text-xs">{item.vendorName}</p>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-gray-700 hover:text-red-400 transition-colors ml-1"
                    >
                      <X size={13} />
                    </button>
                  </div>

                  {/* Customizations */}
                  {item.addons?.length > 0 && (
                    <p className="text-gray-600 text-[11px] mb-1.5">
                      + {item.addons.map((a) => a.name).join(", ")}
                    </p>
                  )}
                  {item.removals?.length > 0 && (
                    <p className="text-gray-700 text-[11px] mb-1.5">
                      − {item.removals.join(", ")}
                    </p>
                  )}
                  {item.spiceLevel && item.spiceLevel !== "medium" && (
                    <p className="text-orange-400/70 text-[11px] mb-1.5">
                      🌶️ {item.spiceLevel}
                    </p>
                  )}

                  <div className="flex items-center justify-between mt-2">
                    {/* Qty stepper */}
                    <div className="flex items-center gap-2 bg-[#1e1e1e] rounded-lg px-1">
                      <button
                        onClick={() => updateQty(item.id, item.quantity - 1)}
                        className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-white text-sm"
                      >
                        −
                      </button>
                      <span className="text-gray-200 text-sm font-bold w-4 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQty(item.id, item.quantity + 1)}
                        className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-white text-sm"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-orange-400 font-bold text-sm">
                      ₨{item.lineTotal?.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-white/[0.07] p-4 space-y-3">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span>₨{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Delivery</span>
                <span>₨{deliveryFee}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Platform fee</span>
                <span>₨{platformFee}</span>
              </div>
              <div className="flex justify-between text-white font-bold pt-1.5 border-t border-white/[0.07]">
                <span>Total</span>
                <span className="text-orange-400">
                  ₨{grandTotal.toLocaleString()}
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                closeDrawer();
                navigate("/checkout");
              }}
              className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-orange-500/25"
            >
              Proceed to Checkout →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function CustomerHome() {
  const { user } = useAuth();
  const [dishes, setDishes] = useState([]);
  const [deals, setDeals] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState(() => new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinel = useRef(null);

  useEffect(() => {
    if (!user || user.role !== "customer") {
      setFavoriteIds(new Set());
      return;
    }
    let cancelled = false;
    api
      .get("/customer/favorites")
      .then((res) => {
        if (cancelled || res.data?.status !== "success") return;
        const ids = new Set(
          (res.data.favorites || []).map((d) => String(d._id)),
        );
        setFavoriteIds(ids);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [user]);

  const handleFavoriteChange = useCallback((dishId, isFavorite) => {
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      const id = String(dishId);
      if (isFavorite) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const fetchDishes = useCallback(
    async (reset = true) => {
      const pg = reset ? 1 : page;
      if (reset) {
        setLoading(true);
        setDishes([]);
      } else setLoadingMore(true);
      try {
        const params = new URLSearchParams({ page: pg, limit: 20 });
        if (category !== "All") params.set("category", category);
        if (search.trim()) params.set("search", search.trim());
        const res = await api.get(`/public/feed?${params}`);
        if (res.data?.status !== "success" || !Array.isArray(res.data.dishes)) {
          throw new Error(
            res.data?.message || "Unexpected response from the server.",
          );
        }
        const d = res.data.dishes;
        const pages = Math.max(1, Number(res.data.pages) || 1);
        const feedDeals = res.data.deals;
        if (reset) setError("");
        if (reset) setDeals(Array.isArray(feedDeals) ? feedDeals : []);
        setDishes((prev) => (reset ? d : [...prev, ...d]));
        setPage(pg + 1);
        setHasMore(pg < pages);
      } catch (err) {
        const msg =
          err.response?.data?.message ||
          err.message ||
          "Could not load dishes. Start the API (port 5000) and refresh.";
        if (reset) {
          setError(msg);
          setDishes([]);
          setDeals([]);
        }
        setHasMore(false);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [category, search, page],
  );

  useEffect(() => {
    setPage(1);
    fetchDishes(true);
  }, [category, search]);

  // Infinite scroll
  useEffect(() => {
    const el = sentinel.current;
    if (!el || !hasMore || loadingMore) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) fetchDishes(false);
      },
      { rootMargin: "300px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasMore, loadingMore, fetchDishes]);

  const trending = dishes.slice(0, 8);
  const rest = dishes.slice(8);

  return (
    <div
      className="min-h-screen bg-[#09090b]"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <FeedHeader
        search={search}
        setSearch={setSearch}
        category={category}
        setCategory={setCategory}
      />
      <CartDrawer />

      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
        {/* Hero — only on All tab with no search */}
        {category === "All" && !search && <Hero />}

        {loading ? (
          <div>
            {category === "All" && !search && (
              <section className="mb-10">
                <div className="flex items-center gap-2 mb-5">
                  <Flame size={16} className="text-orange-400" />
                  <h2
                    className="text-white font-bold text-lg"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    Trending Now
                  </h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
                  {[...Array(8)].map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              </section>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
              {[...Array(12)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </div>
        ) : dishes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 text-center">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-gray-400 font-semibold mb-1">
              {error ? "Could not load dishes" : "No dishes found"}
            </p>
            <p className="text-gray-700 text-sm max-w-md mx-auto px-4">
              {error
                ? error
                : search
                  ? `No results for "${search}"`
                  : "Check back later!"}
            </p>
            {error ? (
              <button
                type="button"
                onClick={() => fetchDishes(true)}
                className="mt-5 text-orange-400 hover:text-orange-300 text-sm font-semibold transition-colors"
              >
                Tap to retry
              </button>
            ) : null}
          </div>
        ) : (
          <>
            {/* Trending */}
            {category === "All" && !search && trending.length > 0 && (
              <section className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-orange-500/15 flex items-center justify-center">
                      <Flame size={15} className="text-orange-400" />
                    </div>
                    <div>
                      <h2
                        className="text-white font-bold text-lg"
                        style={{ fontFamily: "'Playfair Display', serif" }}
                      >
                        Trending Now
                      </h2>
                      <p className="text-gray-600 text-xs">
                        Most ordered this week
                      </p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-7">
                  {trending.map((dish, i) => (
                    <DishFeedCard
                      key={dish._id}
                      dish={dish}
                      index={i}
                      favoriteIds={favoriteIds}
                      onFavoriteChange={handleFavoriteChange}
                    />
                  ))}
                </div>
              </section>
            )}

            {category === "All" && !search && deals.length > 0 && (
              <section className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-violet-500/15 flex items-center justify-center">
                      <Tag size={15} className="text-violet-400" />
                    </div>
                    <div>
                      <h2
                        className="text-white font-bold text-lg"
                        style={{ fontFamily: "'Playfair Display', serif" }}
                      >
                        Kitchen deals
                      </h2>
                      <p className="text-gray-600 text-xs">
                        Bundles from approved kitchens
                      </p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-7">
                  {deals.map((deal, i) => (
                    <DealFeedCard key={deal._id} deal={deal} index={i} />
                  ))}
                </div>
              </section>
            )}

            {/* All dishes */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-sky-500/15 flex items-center justify-center">
                    <TrendingUp size={15} className="text-sky-400" />
                  </div>
                  <div>
                    <h2
                      className="text-white font-bold text-lg"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      {search
                        ? `Results for "${search}"`
                        : category !== "All"
                          ? category
                          : "All Dishes"}
                    </h2>
                    <p className="text-gray-600 text-xs">
                      {dishes.length} dishes
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-7">
                {(search || category !== "All" ? dishes : rest).map(
                  (dish, i) => (
                    <DishFeedCard
                      key={dish._id}
                      dish={dish}
                      index={i}
                      favoriteIds={favoriteIds}
                      onFavoriteChange={handleFavoriteChange}
                    />
                  ),
                )}
              </div>
            </section>

            {/* Sentinel + loader */}
            <div ref={sentinel} className="h-4 mt-8" />
            {loadingMore && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-7 mt-6">
                {[...Array(8)].map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            )}
            {!hasMore && dishes.length > 12 && (
              <p className="text-center text-gray-700 text-xs py-10">
                You've explored everything 🍽️
              </p>
            )}
          </>
        )}
      </main>
    </div>
  );
}
