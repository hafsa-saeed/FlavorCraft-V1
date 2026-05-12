import { useState, useEffect, useMemo } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Minus,
  X,
  Check,
  Flame,
  Leaf,
  StickyNote,
  ShoppingBag,
  Star,
  Info,
  Zap,
  Heart,
  ChevronDown,
} from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";

// ── Constants ─────────────────────────────────────────────────────────────────
const SPICE_LEVELS = [
  { key: "mild", label: "Mild", color: "bg-green-500", icon: "🟢" },
  { key: "medium", label: "Medium", color: "bg-yellow-500", icon: "🟡" },
  { key: "hot", label: "Hot", color: "bg-orange-500", icon: "🟠" },
  { key: "extra-hot", label: "Extra Hot", color: "bg-red-500", icon: "🔴" },
];

const TASTE_PREFS = [
  { key: "Low Oil", icon: "🫒", desc: "Minimal cooking oil" },
  { key: "Less Salt", icon: "🧂", desc: "Reduced sodium" },
  { key: "No MSG", icon: "🚫", desc: "No artificial flavor enhancers" },
  { key: "Extra Crispy", icon: "🍟", desc: "Well-done & crispy" },
  { key: "Extra Sauce", icon: "🥫", desc: "More sauce/gravy" },
  { key: "Diabetic Friendly", icon: "💙", desc: "Low sugar, healthy fats" },
];

// ── Nutrition bar ─────────────────────────────────────────────────────────────
function NutritionBar({ label, value, max, color }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-gray-500 text-xs">{label}</span>
        <span className="text-gray-300 text-xs font-semibold">
          {value}
          {label === "Calories" ? " kcal" : "g"}
        </span>
      </div>
      <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function CustomizePage() {
  const { dishId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const { addItem, openDrawer } = useCart();
  const { user } = useAuth();

  const [dish, setDish] = useState(state?.dish || null);
  const [loading, setLoading] = useState(!state?.dish);

  // Customization state
  const [quantity, setQuantity] = useState(1);
  const [addons, setAddons] = useState([]); // [{name, price}] — added extras
  const [removals, setRemovals] = useState([]); // string[] — removed ingredients
  const [spiceLevel, setSpiceLevel] = useState("medium");
  const [tastePrefs, setTastePrefs] = useState([]); // string[]
  const [specialNote, setSpecialNote] = useState("");
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const fromState = state?.dish;
    const stateMatches =
      fromState &&
      String(fromState._id ?? fromState.id) === String(dishId);

    if (stateMatches) {
      setDish(fromState);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    api
      .get(`/customer/dish/${dishId}`)
      .then((r) => {
        if (!cancelled) setDish(r.data.dish);
      })
      .catch(() => {
        if (!cancelled) navigate("/");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [dishId, state, navigate]);

  // Price calculation
  const addonTotal = useMemo(
    () => addons.reduce((s, a) => s + a.price, 0),
    [addons],
  );
  const unitPrice = useMemo(
    () => (dish?.price || 0) + addonTotal,
    [dish, addonTotal],
  );
  const totalPrice = useMemo(() => unitPrice * quantity, [unitPrice, quantity]);

  const toggleAddon = (ingredient) => {
    if (!ingredient.isRemovable && !ingredient.extraPrice) return;
    const key = ingredient.name;
    setAddons((prev) => {
      const exists = prev.find((a) => a.name === key);
      if (exists) return prev.filter((a) => a.name !== key);
      return [...prev, { name: key, price: ingredient.extraPrice || 0 }];
    });
  };

  const toggleRemoval = (name) => {
    setRemovals((prev) =>
      prev.includes(name) ? prev.filter((r) => r !== name) : [...prev, name],
    );
  };

  const toggleTastePref = (key) => {
    setTastePrefs((prev) =>
      prev.includes(key) ? prev.filter((t) => t !== key) : [...prev, key],
    );
  };

  const handleAddToCart = () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (!dish) return;

    const v = dish.vendorId;
    let vendorId = "";
    let vendorName = "Kitchen";
    if (v != null) {
      if (typeof v === "object" && v._id != null) {
        vendorId = String(v._id);
        vendorName = v.vendorProfile?.shopName || vendorName;
      } else {
        vendorId = String(v);
      }
    }

    const ingredientsSnapshot = (dish.ingredients || []).map((ing) => {
      const name = typeof ing === "string" ? ing : ing?.name;
      if (!name) return null;
      return {
        name,
        removed: removals.includes(name),
        addedAsPaidAddon: addons.some((a) => a.name === name),
      };
    }).filter(Boolean);

    addItem({
      id: `${dish._id}-${Date.now()}`,
      dishId: dish._id,
      name: dish.name,
      image: dish.image || "",
      basePrice: dish.price,
      quantity,
      addons,
      removals,
      spiceLevel,
      tastePrefs,
      specialNote,
      vendorId,
      vendorName,
      customizations: {
        spiceLevel,
        addons,
        removals,
        tastePrefs,
        specialNote,
        quantity,
        extras: { ingredients: ingredientsSnapshot },
      },
    });

    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      openDrawer();
    }, 700);
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

  if (!dish) {
    return (
      <div
        className="min-h-screen bg-[#09090b] flex items-center justify-center"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        <div className="text-center">
          <p className="text-gray-500 mb-4">Dish not found.</p>
          <button
            onClick={() => navigate("/")}
            className="text-orange-400 hover:text-orange-300 transition-colors"
          >
            ← Back to Feed
          </button>
        </div>
      </div>
    );
  }

  const vendor = dish.vendorId || {};
  const profile = vendor.vendorProfile || {};
  const nut = dish.nutrition || {};
  const ingredients = dish.ingredients || [];

  return (
    <div
      className="min-h-screen bg-[#09090b]"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Sticky header */}
      <div className="sticky top-0 z-30 bg-[#09090b]/95 backdrop-blur-xl border-b border-white/[0.05] px-4 sm:px-6 py-3.5 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-300 transition-colors text-sm"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <span className="text-white font-bold truncate flex-1">
          {dish.name}
        </span>
        <div className="flex items-center gap-1.5">
          <span className="w-7 h-7 rounded-full overflow-hidden bg-orange-500/15 border border-orange-500/20 flex items-center justify-center shrink-0">
            {profile.profileImage ? (
              <img
                src={profile.profileImage}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-orange-400 text-[10px] font-bold">
                {(profile.shopName || "K")[0]}
              </span>
            )}
          </span>
          <span className="text-gray-500 text-xs hidden sm:block">
            {profile.shopName}
          </span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
          {/* ── Left panel ─────────────────────────────────────────────────── */}
          <div className="space-y-6">
            {/* Dish hero */}
            <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden bg-[#161616] border border-white/[0.05]">
              {dish.image ? (
                <img
                  src={dish.image}
                  alt={dish.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-6xl opacity-20">🍽️</span>
                </div>
              )}
              {/* Category + health tags overlay */}
              <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                <span className="bg-orange-500/90 backdrop-blur-sm text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
                  {dish.category}
                </span>
                {dish.nutrition?.calories < 400 && (
                  <span className="bg-blue-500/80 backdrop-blur-sm text-blue-100 text-[11px] font-semibold px-2.5 py-1 rounded-full">
                    💙 Low Calorie
                  </span>
                )}
                {dish.nutrition?.protein > 30 && (
                  <span className="bg-red-500/80 backdrop-blur-sm text-red-100 text-[11px] font-semibold px-2.5 py-1 rounded-full">
                    💪 High Protein
                  </span>
                )}
              </div>
            </div>

            {/* Name, rating, description */}
            <div>
              <div className="flex items-start justify-between gap-4">
                <h1
                  className="text-2xl sm:text-3xl font-black text-white"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {dish.name}
                </h1>
                <div className="flex items-center gap-1.5 bg-yellow-500/15 border border-yellow-500/25 px-2.5 py-1.5 rounded-xl shrink-0">
                  <Star size={13} className="text-yellow-400 fill-yellow-400" />
                  <span className="text-yellow-300 font-bold text-sm">4.7</span>
                </div>
              </div>
              {dish.description && (
                <p className="text-gray-400 text-sm leading-relaxed mt-2">
                  {dish.description}
                </p>
              )}
            </div>

            {/* Ingredients — Add/Remove */}
            {ingredients.length > 0 && (
              <div className="bg-[#111] border border-white/[0.06] rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Leaf size={15} className="text-green-400" />
                  <h3 className="text-white font-bold">Ingredients</h3>
                  <span className="text-gray-600 text-xs">(tap to toggle)</span>
                </div>

                <div className="space-y-2">
                  {ingredients.map((ing, i) => {
                    const isRemoved = removals.includes(ing.name);
                    const isAdded = addons.find((a) => a.name === ing.name);
                    return (
                      <div
                        key={i}
                        className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                          isRemoved
                            ? "bg-red-500/[0.08] border-red-500/20 opacity-60"
                            : isAdded
                              ? "bg-emerald-500/[0.08] border-emerald-500/20"
                              : "bg-[#161616] border-white/[0.05] hover:border-white/[0.10]"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-gray-300 text-sm font-medium">
                            {ing.name}
                          </span>
                          {ing.extraPrice > 0 && (
                            <span className="text-orange-400 text-xs font-semibold">
                              +₨{ing.extraPrice}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {/* Remove button */}
                          {ing.isRemovable && (
                            <button
                              onClick={() => toggleRemoval(ing.name)}
                              title={isRemoved ? "Add back" : "Remove"}
                              className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold border transition-all ${
                                isRemoved
                                  ? "bg-red-500 border-red-500 text-white"
                                  : "bg-transparent border-white/[0.12] text-gray-600 hover:border-red-500/40 hover:text-red-400"
                              }`}
                            >
                              {isRemoved ? (
                                <Check size={11} />
                              ) : (
                                <X size={11} />
                              )}
                            </button>
                          )}
                          {/* Add extra */}
                          {ing.extraPrice > 0 && (
                            <button
                              onClick={() => toggleAddon(ing)}
                              title={isAdded ? "Remove add-on" : "Add extra"}
                              className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold border transition-all ${
                                isAdded
                                  ? "bg-emerald-500 border-emerald-500 text-white"
                                  : "bg-transparent border-white/[0.12] text-gray-600 hover:border-emerald-500/40 hover:text-emerald-400"
                              }`}
                            >
                              {isAdded ? (
                                <Check size={11} />
                              ) : (
                                <Plus size={11} />
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Removals summary */}
                {removals.length > 0 && (
                  <div className="mt-3 flex items-center gap-2 bg-red-500/[0.07] border border-red-500/15 rounded-xl px-3 py-2">
                    <X size={12} className="text-red-400 shrink-0" />
                    <p className="text-red-300/80 text-xs">
                      Removed: {removals.join(", ")}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Spice Level */}
            <div className="bg-[#111] border border-white/[0.06] rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Flame size={15} className="text-orange-400" />
                <h3 className="text-white font-bold">Spice Level</h3>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {SPICE_LEVELS.map((s) => (
                  <button
                    key={s.key}
                    onClick={() => setSpiceLevel(s.key)}
                    className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border text-xs font-bold transition-all ${
                      spiceLevel === s.key
                        ? `${s.color} border-transparent text-white shadow-lg`
                        : "bg-[#161616] border-white/[0.07] text-gray-500 hover:border-white/[0.16]"
                    }`}
                  >
                    <span className="text-lg">{s.icon}</span>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Taste Preferences */}
            <div className="bg-[#111] border border-white/[0.06] rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Zap size={15} className="text-sky-400" />
                <h3 className="text-white font-bold">Taste Preferences</h3>
                <span className="text-gray-600 text-xs">
                  (optional, multi-select)
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {TASTE_PREFS.map((tp) => {
                  const on = tastePrefs.includes(tp.key);
                  return (
                    <button
                      key={tp.key}
                      onClick={() => toggleTastePref(tp.key)}
                      className={`flex items-start gap-2.5 p-3 rounded-xl border text-left transition-all ${
                        on
                          ? "bg-sky-500/10 border-sky-500/30 text-sky-300"
                          : "bg-[#161616] border-white/[0.07] text-gray-500 hover:border-white/[0.14]"
                      }`}
                    >
                      <span className="text-base shrink-0">{tp.icon}</span>
                      <div>
                        <p className="text-xs font-semibold">{tp.key}</p>
                        <p className="text-[10px] text-gray-600 leading-tight mt-0.5">
                          {tp.desc}
                        </p>
                      </div>
                      {on && (
                        <Check
                          size={11}
                          className="ml-auto text-sky-400 shrink-0 mt-0.5"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Special Note */}
            <div className="bg-[#111] border border-white/[0.06] rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <StickyNote size={15} className="text-amber-400" />
                <h3 className="text-white font-bold">
                  Special Health Instructions
                </h3>
              </div>
              <textarea
                rows={3}
                value={specialNote}
                onChange={(e) => setSpecialNote(e.target.value)}
                maxLength={300}
                placeholder="e.g. I'm diabetic — please use minimal sugar. Avoid red chili. No garlic please..."
                className="w-full bg-[#0d0d0d] border border-white/[0.08] focus:border-orange-500/50 text-gray-200 rounded-xl px-4 py-3 text-sm outline-none transition-all resize-none placeholder-gray-700"
              />
              <p className="text-[11px] text-gray-700 text-right mt-1">
                {specialNote.length}/300
              </p>
            </div>
          </div>

          {/* ── Right panel — sticky order summary ──────────────────────────── */}
          <div className="lg:sticky lg:top-24 lg:h-fit space-y-4">
            {/* Live Nutrition */}
            {(nut.calories || nut.protein || nut.fats || nut.carbs) && (
              <div className="bg-[#111] border border-white/[0.06] rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Info size={14} className="text-emerald-400" />
                  <h3 className="text-white font-bold text-sm">
                    Live Nutrition & Price
                  </h3>
                </div>
                <div className="space-y-3">
                  <NutritionBar
                    label="Calories"
                    value={nut.calories * quantity}
                    max={2500}
                    color="bg-orange-400"
                  />
                  <NutritionBar
                    label="Protein"
                    value={nut.protein * quantity}
                    max={200}
                    color="bg-red-400"
                  />
                  <NutritionBar
                    label="Carbohydrates"
                    value={nut.carbs * quantity}
                    max={300}
                    color="bg-sky-400"
                  />
                  <NutritionBar
                    label="Fat"
                    value={nut.fats * quantity}
                    max={100}
                    color="bg-yellow-400"
                  />
                </div>
                {/* Health warnings */}
                <div className="mt-4 space-y-1.5">
                  {nut.calories * quantity < 500 && (
                    <p className="text-blue-300 text-xs flex items-center gap-1.5">
                      <span>💙</span> Low calorie meal
                    </p>
                  )}
                  {nut.protein * quantity > 30 && (
                    <p className="text-red-300 text-xs flex items-center gap-1.5">
                      <span>💪</span> High protein dish
                    </p>
                  )}
                  {tastePrefs.includes("Diabetic Friendly") && (
                    <p className="text-emerald-300 text-xs flex items-center gap-1.5">
                      <span>✅</span> Diabetic-friendly preferences applied
                    </p>
                  )}
                  {tastePrefs.includes("Low Oil") && (
                    <p className="text-green-300 text-xs flex items-center gap-1.5">
                      <span>🫒</span> Low oil preparation requested
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Order summary card */}
            <div className="bg-[#111] border border-white/[0.06] rounded-2xl p-5">
              <h3 className="text-white font-bold mb-4">Order Summary</h3>

              {/* Quantity */}
              <div className="flex items-center justify-between mb-5">
                <span className="text-gray-400 text-sm">Quantity</span>
                <div className="flex items-center gap-3 bg-[#0d0d0d] border border-white/[0.08] rounded-xl px-1">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-8 h-9 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="text-white font-bold w-6 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-8 h-9 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* Price breakdown */}
              <div className="space-y-2 text-sm border-b border-white/[0.06] pb-4 mb-4">
                <div className="flex justify-between text-gray-500">
                  <span>Base price × {quantity}</span>
                  <span>₨{(dish.price * quantity).toLocaleString()}</span>
                </div>
                {addons.map((a) => (
                  <div
                    key={a.name}
                    className="flex justify-between text-emerald-400/80"
                  >
                    <span>
                      + {a.name} × {quantity}
                    </span>
                    <span>₨{(a.price * quantity).toLocaleString()}</span>
                  </div>
                ))}
                {removals.map((r) => (
                  <div key={r} className="flex justify-between text-red-400/60">
                    <span className="line-through">− {r}</span>
                    <span className="text-gray-600">removed</span>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="flex items-baseline justify-between mb-5">
                <span className="text-gray-300 font-semibold">Total</span>
                <span className="text-orange-400 font-black text-2xl">
                  ₨{totalPrice.toLocaleString()}
                </span>
              </div>

              {/* Customization tags */}
              {(tastePrefs.length > 0 || spiceLevel !== "medium") && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {spiceLevel !== "medium" && (
                    <span className="bg-orange-500/15 text-orange-400 text-[11px] px-2 py-0.5 rounded-full border border-orange-500/20">
                      🌶️ {spiceLevel}
                    </span>
                  )}
                  {tastePrefs.map((t) => (
                    <span
                      key={t}
                      className="bg-sky-500/10 text-sky-400 text-[11px] px-2 py-0.5 rounded-full border border-sky-500/15"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}

              {/* Add to cart */}
              <button
                onClick={handleAddToCart}
                disabled={added}
                className={`w-full py-3.5 font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 ${
                  added
                    ? "bg-emerald-500 text-white"
                    : "bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/25 active:scale-98"
                }`}
              >
                {added ? (
                  <>
                    <Check size={16} /> Added to Cart!
                  </>
                ) : (
                  <>
                    <ShoppingBag size={16} /> Add to Cart · ₨
                    {totalPrice.toLocaleString()}
                  </>
                )}
              </button>
            </div>

            {/* Vendor card */}
            <div className="bg-[#111] border border-white/[0.06] rounded-2xl p-4 flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl overflow-hidden bg-orange-500/15 border border-orange-500/20 flex items-center justify-center shrink-0">
                {profile.profileImage ? (
                  <img
                    src={profile.profileImage}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-orange-400 font-bold">
                    {(profile.shopName || "K")[0]}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-gray-200 text-sm font-semibold truncate">
                  {profile.shopName}
                </p>
                <p className="text-gray-600 text-xs">{profile.city}</p>
              </div>
              <button
                onClick={() => navigate(`/vendor/${vendor._id}`)}
                className="text-orange-400 text-xs hover:text-orange-300 transition-colors font-semibold whitespace-nowrap"
              >
                View Menu →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
