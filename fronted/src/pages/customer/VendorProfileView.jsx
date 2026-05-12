import { useState, useEffect } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Star,
  ShoppingBag,
  UtensilsCrossed,
  MapPin,
  Phone,
  Clock,
  Tag,
  Flame,
  ChefHat,
  MessageSquare,
  Leaf,
  AlertCircle,
  X,
  Check,
  Zap,
  Heart,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import api from "../../utils/api";

// ── Constants ─────────────────────────────────────────────────────────────────
const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];
const DAY_SHORT = {
  monday: "Mon",
  tuesday: "Tue",
  wednesday: "Wed",
  thursday: "Thu",
  friday: "Fri",
  saturday: "Sat",
  sunday: "Sun",
};

const CATEGORY_COLORS = {
  Desi: "bg-orange-500/15 text-orange-400",
  "BBQ & Grill": "bg-red-500/15 text-red-400",
  "Fast Food": "bg-yellow-500/15 text-yellow-400",
  Biryani: "bg-amber-500/15 text-amber-400",
  Chinese: "bg-emerald-500/15 text-emerald-400",
  Continental: "bg-sky-500/15 text-sky-400",
  Seafood: "bg-blue-500/15 text-blue-400",
  Desserts: "bg-pink-500/15 text-pink-400",
  Beverages: "bg-cyan-500/15 text-cyan-400",
  Healthy: "bg-green-500/15 text-green-400",
  Vegan: "bg-teal-500/15 text-teal-400",
  Other: "bg-gray-500/15 text-gray-400",
};

// ── Star rating display ───────────────────────────────────────────────────────
function StarRow({ rating, size = 14 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={size}
          className={
            s <= Math.round(rating)
              ? "text-yellow-400 fill-yellow-400"
              : "text-gray-700"
          }
        />
      ))}
    </div>
  );
}

// ── Menu dish card ────────────────────────────────────────────────────────────
function MenuDishCard({ dish, favoriteIds, onFavoriteChange }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const catStyle = CATEGORY_COLORS[dish.category] || CATEGORY_COLORS["Other"];
  const [favBusy, setFavBusy] = useState(false);
  const liked = favoriteIds?.has(String(dish._id)) ?? false;

  const handleHeart = async (e) => {
    e.stopPropagation();
    if (!user) {
      navigate("/auth");
      return;
    }
    if (user.role !== "customer" || favBusy) return;
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
    <div className="bg-[#161616] border border-white/[0.06] rounded-2xl overflow-hidden hover:border-white/[0.12] hover:-translate-y-0.5 transition-all group">
      {/* Image */}
      <div className="relative h-40 bg-[#111] overflow-hidden">
        {dish.image ? (
          <img
            src={dish.image}
            alt={dish.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ChefHat size={28} className="text-gray-800" />
          </div>
        )}

        {/* Category badge */}
        <span
          className={`absolute top-2.5 left-2.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${catStyle}`}
        >
          {dish.category}
        </span>

        {/* Like button */}
        <button
          type="button"
          onClick={handleHeart}
          disabled={favBusy}
          className={`absolute top-2.5 right-2.5 w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-sm border transition-all ${
            liked
              ? "bg-red-500/90 border-red-500 text-white"
              : "bg-black/60 border-white/20 text-gray-300 hover:text-red-400"
          } ${favBusy ? "opacity-60" : ""}`}
        >
          <Heart size={11} fill={liked ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-gray-200 font-semibold text-sm leading-snug line-clamp-2 flex-1">
            {dish.name}
          </h3>
          <span className="text-orange-400 font-bold text-sm shrink-0">
            ₨{dish.price?.toLocaleString()}
          </span>
        </div>

        {dish.description && (
          <p className="text-gray-600 text-xs line-clamp-2 mb-3">
            {dish.description}
          </p>
        )}

        {dish.ingredients?.length > 0 && (
          <div className="flex items-center gap-1.5 mb-3">
            <Leaf size={10} className="text-gray-700" />
            <span className="text-gray-700 text-[11px]">
              {dish.ingredients.length} customizable add-ons
            </span>
          </div>
        )}

        {dish.nutrition?.calories > 0 && (
          <div className="flex gap-3 mb-3 text-[11px]">
            {[
              ["kcal", dish.nutrition.calories, "text-orange-400"],
              ["P", dish.nutrition.protein, "text-red-400"],
              ["F", dish.nutrition.fats, "text-yellow-400"],
              ["C", dish.nutrition.carbs, "text-sky-400"],
            ].map(([label, value, color]) =>
              value ? (
                <span key={label}>
                  <span className={`font-bold ${color}`}>{value}</span>
                  <span className="text-gray-700"> {label}</span>
                </span>
              ) : null,
            )}
          </div>
        )}

        <button
          onClick={() =>
            navigate(`/customize/${dish._id}`, { state: { dish } })
          }
          className="w-full py-2.5 bg-orange-500/10 hover:bg-orange-500 text-orange-400 hover:text-white border border-orange-500/25 hover:border-orange-500 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
        >
          <Zap size={12} /> Customize & Order
        </button>
      </div>
    </div>
  );
}

// ── Deal card ─────────────────────────────────────────────────────────────────
function DealCard({ deal, onOrder }) {
  const navigate = useNavigate();

  return (
    <div className="bg-[#161616] border border-white/[0.06] rounded-2xl overflow-hidden hover:border-orange-500/20 hover:-translate-y-0.5 transition-all">
      {deal.savingsPercent > 0 && (
        <div className="bg-gradient-to-r from-orange-500/20 to-amber-500/10 border-b border-orange-500/15 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame size={12} className="text-orange-400" />
            <span className="text-orange-400 text-xs font-bold">
              {deal.savingsPercent}% OFF
            </span>
          </div>
          <span className="text-gray-600 text-[11px]">
            Save ₨{deal.savings?.toLocaleString()}
          </span>
        </div>
      )}

      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3
            className="text-gray-100 font-semibold text-base"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {deal.title}
          </h3>
          <div className="text-right shrink-0">
            <p className="text-orange-400 font-bold text-lg">
              ₨{deal.dealPrice?.toLocaleString()}
            </p>
            {deal.originalPrice > deal.dealPrice && (
              <p className="text-gray-700 text-xs line-through">
                ₨{deal.originalPrice?.toLocaleString()}
              </p>
            )}
          </div>
        </div>

        {deal.description && (
          <p className="text-gray-600 text-xs mb-3">{deal.description}</p>
        )}

        <div className="space-y-1.5 mb-4">
          {deal.items?.map((item, i) => (
            <div key={i} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-orange-500/10 text-orange-400 font-bold flex items-center justify-center text-[10px]">
                  {item.quantity}×
                </span>
                <span className="text-gray-400">{item.dish?.name || "—"}</span>
              </div>
              <span className="text-gray-600">
                ₨{((item.dish?.price || 0) * item.quantity).toLocaleString()}
              </span>
            </div>
          ))}
        </div>

        <button
          onClick={() =>
            alert("Deal ordering coming soon! Use individual dishes for now.")
          }
          className="w-full py-2.5 bg-orange-500/10 hover:bg-orange-500 text-orange-400 hover:text-white border border-orange-500/25 hover:border-orange-500 rounded-xl text-xs font-semibold transition-all"
        >
          Order This Deal
        </button>
      </div>
    </div>
  );
}

// ── Review card ───────────────────────────────────────────────────────────────
function ReviewCard({ review }) {
  const ago = (date) => {
    const d = Math.floor((Date.now() - new Date(date)) / 86400000);
    return d === 0 ? "Today" : d === 1 ? "Yesterday" : `${d} days ago`;
  };

  return (
    <div className="bg-[#161616] border border-white/[0.06] rounded-2xl p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-orange-500/15 border border-orange-500/20 flex items-center justify-center shrink-0">
            <span className="text-orange-400 text-sm font-bold">
              {review.customerName[0]}
            </span>
          </div>
          <div>
            <p className="text-gray-200 text-sm font-semibold">
              {review.customerName}
            </p>
            <p className="text-gray-700 text-[11px]">{ago(review.createdAt)}</p>
          </div>
        </div>
        <StarRow rating={review.rating} size={12} />
      </div>
      <p className="text-gray-400 text-sm leading-relaxed">{review.text}</p>
    </div>
  );
}

// ── Login prompt modal ────────────────────────────────────────────────────────
function LoginPromptModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-[#161616] border border-white/[0.08] rounded-2xl p-8 w-full max-w-sm text-center shadow-2xl">
        <div className="w-14 h-14 rounded-2xl bg-orange-500/15 flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={24} className="text-orange-400" />
        </div>
        <h3
          className="text-white font-bold text-lg mb-2"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Sign in to Order
        </h3>
        <p className="text-gray-500 text-sm mb-6">
          Create an account to place orders, customize dishes, and track
          deliveries.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-white/[0.05] text-gray-400 border border-white/[0.07] rounded-xl text-sm font-medium hover:bg-white/[0.09] transition-colors"
          >
            Cancel
          </button>
          <Link
            to="/auth"
            className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-semibold transition-colors text-center"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
const MENU_TABS = [
  "All",
  "Desi",
  "BBQ & Grill",
  "Fast Food",
  "Biryani",
  "Chinese",
  "Continental",
  "Seafood",
  "Desserts",
  "Healthy",
  "Other",
];

export default function VendorProfileView() {
  const { vendorId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [data, setData] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeSection, setActiveSection] = useState("menu");
  const [menuCategory, setMenuCategory] = useState("All");
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState(() => new Set());

  useEffect(() => {
    if (location.state?.openSection === "deals") {
      setActiveSection("deals");
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.pathname, location.state, navigate]);

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
        setFavoriteIds(
          new Set((res.data.favorites || []).map((d) => String(d._id))),
        );
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [vendorRes, reviewRes] = await Promise.all([
          api.get(`/customer/vendor/${vendorId}`),
          api.get(`/public/reviews/${vendorId}`).catch(() => ({ data: { reviews: [] } })),
        ]);
        if (vendorRes.data?.status === "success") {
          setData(vendorRes.data);
        } else {
          setError("Vendor not found.");
        }
        setReviews(reviewRes.data?.reviews || []);
      } catch (err) {
        const msg =
          err.response?.data?.message ||
          "We could not load this kitchen. The link may be invalid.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [vendorId]);

  const handleOrder = () => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }
  };

  if (loading) {
    return (
      <div
        className="min-h-screen bg-[#09090b] flex items-center justify-center"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        <div className="text-orange-500 text-3xl animate-pulse">🔥</div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="min-h-screen bg-[#09090b] flex items-center justify-center"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        <div className="text-center">
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="text-orange-400 text-sm hover:text-orange-300 transition-colors"
          >
            ← Go back
          </button>
        </div>
      </div>
    );
  }

  if (!data?.vendor) {
    return (
      <div
        className="min-h-screen bg-[#09090b] flex items-center justify-center"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        <div className="text-center text-gray-500 text-sm">Vendor not found.</div>
      </div>
    );
  }

  const { vendor, dishes = [], deals = [], stats = {} } = data;
  const profile = vendor.vendorProfile || {};
  const timings = profile.timings || {};
  const todayKey =
    DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];
  const todayT = timings[todayKey];

  const filteredDishes =
    menuCategory === "All"
      ? dishes
      : dishes.filter((d) => d.category === menuCategory);

  const availableCategories = [
    "All",
    ...new Set(dishes.map((d) => d.category)),
  ];

  return (
    <div
      className="min-h-screen bg-[#09090b]"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Sticky header */}
      <div className="sticky top-0 z-30 bg-[#09090b]/95 backdrop-blur-xl border-b border-white/[0.05] px-6 py-3 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-2 text-sm"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full overflow-hidden bg-orange-500/15 border border-orange-500/20 shrink-0 flex items-center justify-center">
            {profile.profileImage ? (
              <img
                src={profile.profileImage}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-orange-400 text-xs font-bold">
                {(profile.shopName || "K")[0]}
              </span>
            )}
          </div>
          <span className="text-gray-200 text-sm font-semibold">
            {profile.shopName}
          </span>
        </div>
      </div>

      {/* Cover image */}
      <div className="relative h-48 sm:h-64 bg-[#111] overflow-hidden">
        {profile.coverImage ? (
          <img
            src={profile.coverImage}
            alt="cover"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#1a0a00] to-[#0f0a00]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-transparent" />
      </div>

      {/* Profile header */}
      <div className="max-w-screen-lg mx-auto px-4 sm:px-6">
        <div className="relative -mt-12 mb-6 flex items-end gap-5">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-2xl overflow-hidden bg-[#1a1a1a] border-4 border-[#09090b] shrink-0 flex items-center justify-center shadow-xl">
            {profile.profileImage ? (
              <img
                src={profile.profileImage}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-orange-400 text-2xl font-bold">
                {(profile.shopName || "K")[0]}
              </span>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 pb-1">
            <h1
              className="text-2xl font-bold text-white"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {profile.shopName}
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
              {profile.city && (
                <span className="flex items-center gap-1 text-gray-500 text-xs">
                  <MapPin size={11} />
                  {profile.city}
                </span>
              )}
              {profile.phone && (
                <span className="flex items-center gap-1 text-gray-500 text-xs">
                  <Phone size={11} />
                  {profile.phone}
                </span>
              )}
              {todayT && !todayT.isClosed && (
                <span className="flex items-center gap-1 text-emerald-400 text-xs">
                  <Clock size={11} /> Open · {todayT.open}–{todayT.close}
                </span>
              )}
              {todayT?.isClosed && (
                <span className="flex items-center gap-1 text-red-400 text-xs">
                  <Clock size={11} /> Closed today
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            {
              label: "Rating",
              value: `${stats.rating} ★`,
              color: "text-yellow-400",
            },
            {
              label: "Orders",
              value: stats.totalOrders || "—",
              color: "text-orange-400",
            },
            {
              label: "Dishes",
              value: stats.totalDishes,
              color: "text-sky-400",
            },
            {
              label: "Deals",
              value: stats.totalDeals,
              color: "text-emerald-400",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-[#161616] border border-white/[0.06] rounded-2xl p-4 text-center"
            >
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-gray-600 text-xs mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="text-gray-400 text-sm leading-relaxed mb-4 max-w-2xl">
            {profile.bio}
          </p>
        )}

        {/* Cuisine types */}
        {profile.cuisineTypes?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {profile.cuisineTypes.map((c) => (
              <span
                key={c}
                className="px-3 py-1 bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-medium rounded-full"
              >
                {c}
              </span>
            ))}
          </div>
        )}

        {/* Timings grid */}
        {Object.keys(timings).length > 0 && (
          <div className="bg-[#161616] border border-white/[0.06] rounded-2xl p-5 mb-8">
            <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
              <Clock size={14} className="text-orange-400" /> Opening Hours
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {DAYS.map((day) => {
                const t = timings[day];
                const today = day === todayKey;
                if (!t) return null;
                return (
                  <div
                    key={day}
                    className={`rounded-xl px-3 py-2 border ${
                      today
                        ? "bg-orange-500/10 border-orange-500/20"
                        : "bg-[#111] border-white/[0.05]"
                    }`}
                  >
                    <p
                      className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${
                        today ? "text-orange-400" : "text-gray-600"
                      }`}
                    >
                      {DAY_SHORT[day]}
                    </p>
                    {t.isClosed ? (
                      <p className="text-red-400/70 text-xs">Closed</p>
                    ) : (
                      <p className="text-gray-300 text-xs">
                        {t.open}–{t.close}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Section tabs */}
        <div className="flex gap-2 mb-6 border-b border-white/[0.06] pb-0">
          {[
            {
              id: "menu",
              label: `Menu (${dishes.length})`,
              icon: UtensilsCrossed,
            },
            { id: "deals", label: `Deals (${deals.length})`, icon: Tag },
            {
              id: "reviews",
              label: `Reviews (${reviews.length})`,
              icon: MessageSquare,
            },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all -mb-px ${
                activeSection === id
                  ? "border-orange-500 text-orange-400"
                  : "border-transparent text-gray-600 hover:text-gray-400"
              }`}
            >
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>

        {/* MENU */}
        {activeSection === "menu" && (
          <div className="pb-12">
            <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide mb-5">
              {availableCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setMenuCategory(cat)}
                  className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-semibold border transition-all shrink-0 ${
                    menuCategory === cat
                      ? "bg-orange-500/20 border-orange-500/35 text-orange-400"
                      : "bg-transparent border-white/[0.07] text-gray-600 hover:text-gray-400"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            {filteredDishes.length === 0 ? (
              <p className="text-center text-gray-700 py-12">
                No dishes in this category.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDishes.map((dish) => (
                  <MenuDishCard
                    key={dish._id}
                    dish={dish}
                    favoriteIds={favoriteIds}
                    onFavoriteChange={(dishId, isFav) => {
                      setFavoriteIds((prev) => {
                        const n = new Set(prev);
                        const id = String(dishId);
                        if (isFav) n.add(id);
                        else n.delete(id);
                        return n;
                      });
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* DEALS */}
        {activeSection === "deals" && (
          <div className="pb-12">
            {deals.length === 0 ? (
              <div className="text-center py-20">
                <Tag size={28} className="text-gray-700 mx-auto mb-3" />
                <p className="text-gray-600">No active deals right now.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {deals.map((deal) => (
                  <DealCard key={deal._id} deal={deal} onOrder={handleOrder} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* REVIEWS */}
        {activeSection === "reviews" && (
          <div className="pb-12">
            <div className="bg-[#161616] border border-white/[0.06] rounded-2xl p-6 mb-6 flex items-center gap-8">
              <div className="text-center">
                <p className="text-5xl font-bold text-white">{stats.rating}</p>
                <StarRow rating={stats.rating} size={16} />
                <p className="text-gray-600 text-xs mt-2">
                  {reviews.length} reviews
                </p>
              </div>
              <div className="flex-1 space-y-2">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = reviews.filter((r) => r.rating === star).length;
                  const pct = reviews.length
                    ? (count / reviews.length) * 100
                    : 0;
                  return (
                    <div key={star} className="flex items-center gap-3">
                      <span className="text-xs text-gray-600 w-3">{star}</span>
                      <Star
                        size={11}
                        className="text-yellow-400 fill-yellow-400"
                      />
                      <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-400/70 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-700 w-4">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {reviews.length === 0 ? (
              <p className="text-center text-gray-700 py-12">No reviews yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {reviews.map((r) => (
                  <ReviewCard key={r._id} review={r} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {showLoginPrompt && (
        <LoginPromptModal onClose={() => setShowLoginPrompt(false)} />
      )}
    </div>
  );
}
