import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ShoppingBag,
  MapPin,
  CreditCard,
  CheckCircle,
  Trash2,
  ChevronRight,
  RefreshCw,
  Package,
  Truck,
  Check,
  Tag,
  X,
  ArrowLeft,
  Flame,
} from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";
import {
  buildCreateOrderBody,
  statusToTrackerIndex,
  TRACK_FLOW,
} from "../../utils/orderApi";

// ── Step indicator ─────────────────────────────────────────────────────────────
const STEPS = ["Cart", "Address", "Payment", "Tracking"];

function StepBar({ current }) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {STEPS.map((step, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all ${
                  done
                    ? "bg-emerald-500 border-emerald-500 text-white"
                    : active
                      ? "bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/30"
                      : "bg-[#161616] border-white/[0.10] text-gray-600"
                }`}
              >
                {done ? <Check size={14} strokeWidth={2.5} /> : i + 1}
              </div>
              <span
                className={`text-[11px] font-semibold ${active ? "text-orange-400" : done ? "text-emerald-400" : "text-gray-600"}`}
              >
                {step}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`flex-1 h-0.5 mb-5 mx-1 rounded-full transition-all ${done ? "bg-emerald-500/60" : "bg-white/[0.06]"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Step 1 — Cart ──────────────────────────────────────────────────────────────
function CartStep({ onNext }) {
  const {
    items,
    updateQty,
    removeItem,
    subtotal,
    deliveryFee,
    platformFee,
    grandTotal,
    promoCode,
    promoDiscount,
    promoAmt,
    promoError,
    applyPromo,
    removePromo,
  } = useCart();
  const [promoInput, setPromoInput] = useState(promoCode);

  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-4">🛒</div>
        <p className="text-gray-400 font-semibold mb-1">Your cart is empty</p>
        <Link
          to="/"
          className="text-orange-400 text-sm hover:text-orange-300 transition-colors"
        >
          ← Browse the feed
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-[#111] border border-white/[0.06] rounded-2xl overflow-hidden">
        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-white/[0.05]">
          <ShoppingBag size={16} className="text-orange-400" />
          <h2 className="text-white font-bold">Your Cart</h2>
        </div>
        <div className="divide-y divide-white/[0.04]">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 px-5 py-4">
              {item.image && (
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-14 h-14 rounded-xl object-cover shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-gray-200 text-sm font-semibold truncate">
                  {item.name}
                </p>
                <p className="text-gray-600 text-xs">{item.vendorName}</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {item.addons?.map((a) => (
                    <span
                      key={a.name}
                      className="text-[10px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded-full"
                    >
                      +{a.name}
                    </span>
                  ))}
                  {item.removals?.map((r) => (
                    <span
                      key={r}
                      className="text-[10px] bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded-full"
                    >
                      −{r}
                    </span>
                  ))}
                  {item.spiceLevel && item.spiceLevel !== "medium" && (
                    <span className="text-[10px] bg-orange-500/10 text-orange-400 px-1.5 py-0.5 rounded-full">
                      🌶️ {item.spiceLevel}
                    </span>
                  )}
                  {item.tastePrefs?.map((t) => (
                    <span
                      key={t}
                      className="text-[10px] bg-sky-500/10 text-sky-400 px-1.5 py-0.5 rounded-full"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                {item.specialNote && (
                  <p className="text-[11px] text-amber-400/70 mt-1 italic truncate">
                    "{item.specialNote}"
                  </p>
                )}
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <span className="text-orange-400 font-bold text-sm">
                  ₨{item.lineTotal?.toLocaleString()}
                </span>
                <div className="flex items-center gap-1 bg-[#0d0d0d] border border-white/[0.07] rounded-lg px-0.5">
                  <button
                    onClick={() => updateQty(item.id, item.quantity - 1)}
                    className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-white transition-colors text-sm"
                  >
                    −
                  </button>
                  <span className="text-white text-sm font-bold w-5 text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQty(item.id, item.quantity + 1)}
                    className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-white transition-colors text-sm"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-gray-700 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Promo code */}
      <div className="bg-[#111] border border-white/[0.06] rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Tag size={14} className="text-amber-400" />
          <h3 className="text-white font-semibold text-sm">Promo Code</h3>
        </div>
        {promoDiscount > 0 ? (
          <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
            <div>
              <p className="text-emerald-400 font-bold text-sm">{promoCode}</p>
              <p className="text-emerald-300/70 text-xs">
                {promoDiscount * 100}% discount applied — saves ₨{promoAmt}
              </p>
            </div>
            <button
              onClick={removePromo}
              className="text-gray-500 hover:text-red-400 transition-colors"
            >
              <X size={15} />
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              value={promoInput}
              onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
              placeholder="Enter code (e.g. FLEX10)"
              className="flex-1 bg-[#0d0d0d] border border-white/[0.08] text-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-500/50 transition-all placeholder-gray-700"
            />
            <button
              onClick={() => applyPromo(promoInput)}
              className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm rounded-xl transition-all"
            >
              Apply
            </button>
          </div>
        )}
        {promoError && (
          <p className="text-red-400 text-xs mt-2">{promoError}</p>
        )}
      </div>

      {/* Bill breakdown */}
      <div className="bg-[#111] border border-white/[0.06] rounded-2xl p-5 space-y-2.5">
        <h3 className="text-white font-semibold text-sm mb-4">
          Bill Breakdown
        </h3>
        {[
          {
            label: "Subtotal",
            value: `₨${subtotal.toLocaleString()}`,
            color: "text-gray-400",
          },
          {
            label: "Delivery fee",
            value: `₨${deliveryFee}`,
            color: "text-gray-400",
          },
          {
            label: "Platform fee",
            value: `₨${platformFee}`,
            color: "text-gray-400",
          },
          ...(promoDiscount > 0
            ? [
                {
                  label: `Promo (${promoCode})`,
                  value: `-₨${promoAmt}`,
                  color: "text-emerald-400",
                },
              ]
            : []),
        ].map(({ label, value, color }) => (
          <div key={label} className="flex justify-between text-sm">
            <span className="text-gray-500">{label}</span>
            <span className={color}>{value}</span>
          </div>
        ))}
        <div className="flex justify-between pt-3 border-t border-white/[0.07]">
          <span className="text-white font-bold">Total</span>
          <span className="text-orange-400 font-black text-lg">
            ₨{grandTotal.toLocaleString()}
          </span>
        </div>
      </div>

      <button
        onClick={onNext}
        className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-orange-500/20"
      >
        Continue to Address →
      </button>
    </div>
  );
}

// ── Step 2 — Address (synced with profile / persisted settings) ───────────────
const ADDR_TYPES = [
  { id: "Home", icon: "🏠" },
  { id: "Office", icon: "💼" },
  { id: "Other", icon: "📍" },
];

function AddressStep({
  onNext,
  onBack,
  addressType,
  setAddressType,
  addressLine,
  setAddressLine,
  city,
  setCity,
  instructions,
  setInstructions,
}) {
  const canContinue = addressLine.trim().length >= 8;

  return (
    <div className="space-y-4">
      <div className="bg-[#111] border border-white/[0.06] rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <MapPin size={15} className="text-orange-400" />
          <h2 className="text-white font-bold">Delivery address</h2>
        </div>

        <div className="flex gap-2 mb-4">
          {ADDR_TYPES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setAddressType(t.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                addressType === t.id
                  ? "bg-orange-500/10 border-orange-500/30 text-orange-300"
                  : "bg-[#161616] border-white/[0.06] text-gray-500 hover:border-white/[0.12]"
              }`}
            >
              <span>{t.icon}</span> {t.id}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          <textarea
            rows={3}
            value={addressLine}
            onChange={(e) => setAddressLine(e.target.value)}
            placeholder="Street, house / flat, area, landmark…"
            className="w-full bg-[#0d0d0d] border border-white/[0.07] text-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-500/50 transition-all resize-none placeholder-gray-700"
          />
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="City"
            className="w-full bg-[#0d0d0d] border border-white/[0.07] text-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-500/50 transition-all placeholder-gray-700"
          />
          <input
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Delivery instructions (gate code, floor, etc.)"
            className="w-full bg-[#0d0d0d] border border-white/[0.07] text-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-500/50 transition-all placeholder-gray-700"
          />
        </div>
        {!canContinue && (
          <p className="text-gray-600 text-xs mt-3">
            Enter a full address (at least 8 characters) to continue.
          </p>
        )}
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-3 bg-white/[0.05] border border-white/[0.07] text-gray-400 rounded-xl text-sm font-medium hover:bg-white/[0.09] transition-colors"
        >
          <ArrowLeft size={15} />
        </button>
        <button
          type="button"
          disabled={!canContinue}
          onClick={onNext}
          className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:pointer-events-none text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-orange-500/20"
        >
          Continue to payment →
        </button>
      </div>
    </div>
  );
}

// ── Step 3 — Payment ───────────────────────────────────────────────────────────
const PAYMENT_METHODS = [
  { id: "card", icon: "💳", label: "Credit / Debit Card" },
  { id: "cash", icon: "💵", label: "Cash on Delivery" },
  { id: "jazz", icon: "📱", label: "JazzCash" },
  { id: "easypaisa", icon: "🟢", label: "EasyPaisa" },
];

function PaymentStep({ onBack, onPlaceOrder, submitting, submitError }) {
  const { grandTotal } = useCart();
  const [method, setMethod] = useState("cash");
  const [card, setCard] = useState({ num: "", exp: "", cvv: "", name: "" });

  return (
    <div className="space-y-4">
      <div className="bg-[#111] border border-white/[0.06] rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard size={15} className="text-orange-400" />
          <h2 className="text-white font-bold">Payment method</h2>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          {PAYMENT_METHODS.map((pm) => (
            <button
              key={pm.id}
              type="button"
              onClick={() => setMethod(pm.id)}
              className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                method === pm.id
                  ? "bg-orange-500/10 border-orange-500/30"
                  : "bg-[#161616] border-white/[0.06] hover:border-white/[0.12]"
              }`}
            >
              <span className="text-xl">{pm.icon}</span>
              <span
                className={`text-xs font-semibold ${method === pm.id ? "text-orange-300" : "text-gray-400"}`}
              >
                {pm.label}
              </span>
              {method === pm.id && (
                <Check size={12} className="text-orange-400 ml-auto shrink-0" />
              )}
            </button>
          ))}
        </div>

        {method === "card" && (
          <div className="space-y-3 bg-[#161616] border border-white/[0.07] rounded-xl p-4">
            <input
              value={card.num}
              onChange={(e) => setCard((c) => ({ ...c, num: e.target.value }))}
              placeholder="Card number"
              className="w-full bg-[#0d0d0d] border border-white/[0.07] text-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-500/50 transition-all placeholder-gray-700"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                value={card.exp}
                onChange={(e) =>
                  setCard((c) => ({ ...c, exp: e.target.value }))
                }
                placeholder="MM/YY"
                className="w-full bg-[#0d0d0d] border border-white/[0.07] text-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-500/50 transition-all placeholder-gray-700"
              />
              <input
                value={card.cvv}
                onChange={(e) =>
                  setCard((c) => ({ ...c, cvv: e.target.value }))
                }
                placeholder="CVV"
                type="password"
                className="w-full bg-[#0d0d0d] border border-white/[0.07] text-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-500/50 transition-all placeholder-gray-700"
              />
            </div>
            <input
              value={card.name}
              onChange={(e) => setCard((c) => ({ ...c, name: e.target.value }))}
              placeholder="Name on card"
              className="w-full bg-[#0d0d0d] border border-white/[0.07] text-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-500/50 transition-all placeholder-gray-700"
            />
          </div>
        )}
      </div>

      {submitError && (
        <p className="text-red-400 text-sm px-1">{submitError}</p>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={submitting}
          className="px-5 py-3 bg-white/[0.05] border border-white/[0.07] text-gray-400 rounded-xl text-sm font-medium hover:bg-white/[0.09] transition-colors"
        >
          <ArrowLeft size={15} />
        </button>
        <button
          type="button"
          disabled={submitting}
          onClick={() => onPlaceOrder(method)}
          className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-orange-500/20"
        >
          {submitting ? "Placing order…" : `Place order → ₨${grandTotal.toLocaleString()}`}
        </button>
      </div>
    </div>
  );
}

// ── Step 4 — Order tracking (synced with vendor status updates) ───────────────
const TRACK_UI = [
  { key: "pending", label: "Placed", icon: Package },
  { key: "confirmed", label: "Confirmed", icon: Check },
  { key: "preparing", label: "Preparing", icon: RefreshCw },
  { key: "on_way", label: "Out for delivery", icon: Truck },
  { key: "delivered", label: "Delivered", icon: CheckCircle },
];

function TrackingStep({ initialOrder }) {
  const navigate = useNavigate();
  const [order, setOrder] = useState(initialOrder);

  const refresh = useCallback(async () => {
    if (!initialOrder?._id) return;
    try {
      const res = await api.get(`/orders/${initialOrder._id}`);
      if (res.data?.data) setOrder(res.data.data);
    } catch {
      /* keep last */
    }
  }, [initialOrder?._id]);

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 5000);
    return () => clearInterval(t);
  }, [refresh]);

  const status = order?.status || "pending";
  const stageIdx = statusToTrackerIndex(status);
  const last = TRACK_UI.length - 1;
  const pct = status === "cancelled" ? 0 : (stageIdx / last) * 100;
  const shortId = order?._id ? String(order._id).slice(-8).toUpperCase() : "—";
  const displayId = order?.trackingId || shortId;

  if (status === "cancelled") {
    return (
      <div className="space-y-6">
        <div className="bg-red-500/10 border border-red-500/25 rounded-2xl p-6 text-center">
          <p className="text-red-400 font-semibold">This order was cancelled.</p>
          <p className="text-gray-500 text-sm mt-2">Order #{displayId}</p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex-1 py-3 bg-white/[0.05] border border-white/[0.07] text-gray-300 rounded-xl text-sm font-medium hover:bg-white/[0.09] transition-colors"
          >
            Back to feed
          </button>
          <Link
            to="/dashboard"
            className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-bold text-center transition-all"
          >
            View my orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20 rounded-2xl p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-3">
          <CheckCircle size={32} className="text-emerald-400" />
        </div>
        <h2
          className="text-white font-black text-xl mb-1"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Order placed
        </h2>
        <p className="text-gray-500 text-sm">
          Order #{displayId} · Kitchen is updating your status here in real time
        </p>
        <p className="text-orange-400/90 text-xs font-bold uppercase tracking-widest mt-2">
          {TRACK_FLOW.includes(status) ? status.replace(/_/g, " ") : status}
        </p>
      </div>

      <div className="bg-[#111] border border-white/[0.06] rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-5">
          <Truck size={15} className="text-orange-400" />
          <h3 className="text-white font-bold">Order tracking</h3>
        </div>

        <div className="relative h-1.5 bg-white/[0.06] rounded-full mb-6 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="flex justify-between gap-1">
          {TRACK_UI.map((stage, i) => {
            const Icon = stage.icon;
            const done = i < stageIdx;
            const active = i === stageIdx;
            return (
              <div key={stage.key} className="flex flex-col items-center gap-2 flex-1 min-w-0">
                <div
                  className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${
                    done
                      ? "bg-emerald-500 border-emerald-500 text-white"
                      : active
                        ? "bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/40"
                        : "bg-[#161616] border-white/[0.10] text-gray-700"
                  }`}
                >
                  <Icon
                    size={14}
                    className={
                      active && stage.key === "preparing" ? "animate-spin" : ""
                    }
                  />
                </div>
                <span
                  className={`text-[10px] font-semibold text-center leading-tight px-0.5 ${active ? "text-orange-400" : done ? "text-emerald-400" : "text-gray-700"}`}
                >
                  {stage.label}
                </span>
              </div>
            );
          })}
        </div>
        <p className="text-center text-gray-600 text-[11px] mt-4">
          Refreshes every few seconds while you stay on this page.
        </p>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="flex-1 py-3 bg-white/[0.05] border border-white/[0.07] text-gray-300 rounded-xl text-sm font-medium hover:bg-white/[0.09] transition-colors"
        >
          Back to feed
        </button>
        <Link
          to="/dashboard"
          className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-bold text-center transition-all"
        >
          View my orders
        </Link>
      </div>
    </div>
  );
}

// ── Root checkout ──────────────────────────────────────────────────────────────
export default function CheckoutPage() {
  const [step, setStep] = useState(0);
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    items,
    subtotal,
    deliveryFee,
    platformFee,
    grandTotal,
    promoCode,
    promoDiscount,
    promoAmt,
    clearCart,
  } = useCart();

  const [addressType, setAddressType] = useState("Home");
  const [addressLine, setAddressLine] = useState("");
  const [city, setCity] = useState("");
  const [instructions, setInstructions] = useState("");
  const [placedOrder, setPlacedOrder] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (!user?.address) return;
    setAddressLine((prev) => (prev?.trim() ? prev : user.address));
  }, [user?.address]);

  const handlePlaceOrder = async (paymentMethod) => {
    setSubmitError("");
    if (!items.length) {
      setSubmitError("Your cart is empty.");
      return;
    }
    setSubmitting(true);
    try {
      const body = buildCreateOrderBody({
        items,
        deliveryAddress: {
          type: addressType,
          addressLine: addressLine.trim(),
          city: city.trim(),
          instructions: instructions.trim(),
        },
        paymentMethod,
        subtotal,
        deliveryFee,
        platformFee,
        promoCode,
        promoAmt,
        grandTotal,
      });
      const res = await api.post("/orders", body);
      const created = res.data?.data;
      if (!created?._id) throw new Error("Invalid response from server.");
      setPlacedOrder(created);
      clearCart();
      setStep(3);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Could not place order. Try again.";
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!user)
    return (
      <div
        className="min-h-screen bg-[#09090b] flex items-center justify-center"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        <div className="text-center max-w-xs">
          <ShoppingBag size={36} className="text-orange-400 mx-auto mb-4" />
          <h2
            className="text-white font-bold text-xl mb-2"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Sign in to checkout
          </h2>
          <p className="text-gray-500 text-sm mb-5">
            Create an account to place orders.
          </p>
          <Link
            to="/auth"
            className="block w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-sm transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );

  return (
    <div
      className="min-h-screen bg-[#09090b]"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Header */}
      <div className="sticky top-0 z-30 bg-[#09090b]/95 backdrop-blur-xl border-b border-white/[0.05] px-4 sm:px-6 py-3.5 flex items-center gap-3">
        <button
          onClick={() => (step > 0 ? setStep((s) => s - 1) : navigate("/"))}
          className="text-gray-500 hover:text-gray-300 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-orange-500 flex items-center justify-center text-sm">
            🔥
          </div>
          <span
            className="text-white font-black hidden sm:block"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            FlavorCraft
          </span>
        </div>
        <span className="text-gray-500 text-sm ml-1">· Checkout</span>
      </div>

      <main className="max-w-lg mx-auto px-4 sm:px-6 py-8">
        <StepBar current={step} />
        {step === 0 && <CartStep onNext={() => setStep(1)} />}
        {step === 1 && (
          <AddressStep
            onNext={() => setStep(2)}
            onBack={() => setStep(0)}
            addressType={addressType}
            setAddressType={setAddressType}
            addressLine={addressLine}
            setAddressLine={setAddressLine}
            city={city}
            setCity={setCity}
            instructions={instructions}
            setInstructions={setInstructions}
          />
        )}
        {step === 2 && (
          <PaymentStep
            onBack={() => setStep(1)}
            onPlaceOrder={handlePlaceOrder}
            submitting={submitting}
            submitError={submitError}
          />
        )}
        {step === 3 && placedOrder && <TrackingStep initialOrder={placedOrder} />}
      </main>
    </div>
  );
}
