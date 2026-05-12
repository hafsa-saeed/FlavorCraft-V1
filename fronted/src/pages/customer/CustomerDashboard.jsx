import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Heart,
  MessageSquare,
  Settings,
  LogOut,
  Clock,
  Menu,
  X,
  ChevronRight,
  Search,
  Zap,
  LayoutGrid,
  IndianRupee,
  Truck,
  Sparkles,
  MapPin,
  Mail,
  Loader2,
  Send,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";

const glass =
  "bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl";
const glassTight =
  "bg-white/[0.04] backdrop-blur-md border border-white/[0.07] rounded-xl";

const STATUS_MAP = {
  pending: { label: "Pending", tone: "bg-amber-500/15 text-amber-300 border-amber-500/25" },
  confirmed: { label: "Confirmed", tone: "bg-sky-500/15 text-sky-300 border-sky-500/25" },
  preparing: { label: "Preparing", tone: "bg-orange-500/15 text-orange-300 border-orange-500/30" },
  on_way: { label: "Out for delivery", tone: "bg-violet-500/15 text-violet-300 border-violet-500/25" },
  delivered: { label: "Delivered", tone: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25" },
  cancelled: { label: "Cancelled", tone: "bg-red-500/10 text-red-400 border-red-500/20" },
};

function statusBadge(status) {
  const s = STATUS_MAP[status] || {
    label: status?.replace(/_/g, " ") || "—",
    tone: "bg-white/[0.06] text-gray-400 border-white/[0.1]",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${s.tone}`}
    >
      {s.label}
    </span>
  );
}

function OrderDetailsModal({ order, onClose }) {
  if (!order) return null;

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm border-0 cursor-pointer"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ type: "spring", damping: 26, stiffness: 320 }}
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col ${glass} shadow-2xl shadow-black/50 ring-1 ring-white/[0.05]`}
      >
        <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between gap-3 bg-white/[0.02]">
          <div>
            <p className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">
              Order #{String(order._id).slice(-8).toUpperCase()}
            </p>
            <h3
              className="text-lg font-semibold text-white mt-0.5"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Your customizations
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl border border-white/[0.08] text-gray-400 hover:text-white hover:bg-white/[0.05] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto p-6 space-y-5">
          {(order.items || []).map((item, idx) => (
            <div
              key={item._id || idx}
              className={`${glassTight} p-4 space-y-3`}
            >
              <div className="flex gap-3">
                {item.dishImage ? (
                  <img
                    src={item.dishImage}
                    alt=""
                    className="w-16 h-16 rounded-xl object-cover border border-white/[0.08] shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-xl shrink-0">
                    🍽️
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-white font-semibold text-sm leading-snug">
                    {item.dishName}
                  </p>
                  <p className="text-gray-500 text-xs mt-0.5">
                    Qty {item.quantity} · Line ₨
                    {item.lineTotal?.toLocaleString?.() ?? item.lineTotal}
                  </p>
                </div>
              </div>

              <div className="grid gap-2 text-xs">
                {item.spiceLevel && item.spiceLevel !== "medium" && (
                  <div className="flex gap-2">
                    <span className="text-gray-600 shrink-0">Spice</span>
                    <span className="text-orange-300 font-medium capitalize">
                      {item.spiceLevel.replace("-", " ")}
                    </span>
                  </div>
                )}
                {item.addons?.length > 0 && (
                  <div>
                    <span className="text-gray-600 block mb-1">Add-ons</span>
                    <ul className="text-gray-300 space-y-0.5">
                      {item.addons.map((a, i) => (
                        <li key={i}>
                          + {a.name}
                          {a.price > 0 ? ` (+₨${a.price})` : ""}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {item.removals?.length > 0 && (
                  <div>
                    <span className="text-gray-600 block mb-1">Removed</span>
                    <p className="text-gray-400">{item.removals.join(", ")}</p>
                  </div>
                )}
                {item.tastePrefs?.length > 0 && (
                  <div>
                    <span className="text-gray-600 block mb-1">Preferences</span>
                    <p className="text-gray-300">{item.tastePrefs.join(" · ")}</p>
                  </div>
                )}
                {item.specialNote?.trim() && (
                  <div className="pt-2 border-t border-white/[0.06]">
                    <span className="text-gray-600 block mb-1">Note</span>
                    <p className="text-gray-300 italic">{item.specialNote}</p>
                  </div>
                )}
                {!item.addons?.length &&
                  !item.removals?.length &&
                  (!item.tastePrefs || !item.tastePrefs.length) &&
                  (!item.specialNote || !item.specialNote.trim()) &&
                  (!item.spiceLevel || item.spiceLevel === "medium") && (
                    <p className="text-gray-600 text-xs">
                      Standard preparation — no extra customizations.
                    </p>
                  )}
              </div>
            </div>
          ))}

          {order.customizations?.lines?.length > 0 && (
            <div className={`${glassTight} p-4`}>
              <p className="text-[10px] uppercase tracking-widest text-gray-600 font-bold mb-2">
                Customization snapshot
              </p>
              <ul className="text-xs text-gray-400 space-y-1">
                {order.customizations.lines.map((ln, i) => (
                  <li key={i}>
                    {ln.quantity}× {ln.name}
                    {ln.spiceLevel && ln.spiceLevel !== "medium"
                      ? ` · ${ln.spiceLevel}`
                      : ""}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className={`${glassTight} p-4 text-xs text-gray-500 space-y-1`}>
            <p>
              <span className="text-gray-600">Payment:</span>{" "}
              <span className="text-gray-300 uppercase">{order.paymentMethod}</span>
            </p>
            <p>
              <span className="text-gray-600">Total:</span>{" "}
              <span className="text-white font-bold">
                ₨{order.totalAmount?.toLocaleString?.() ?? order.totalAmount}
              </span>
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function CustomerDashboard() {
  const { user, logout, setUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [orders, setOrders] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loadingDash, setLoadingDash] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [orderQuery, setOrderQuery] = useState("");
  const [detailOrder, setDetailOrder] = useState(null);
  const [settingsForm, setSettingsForm] = useState({
    name: "",
    phone: "",
    address: "",
  });
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsFeedback, setSettingsFeedback] = useState(null);
  const [msgPartnerId, setMsgPartnerId] = useState("");
  const [msgThread, setMsgThread] = useState([]);
  const [msgDraft, setMsgDraft] = useState("");
  const [msgLoading, setMsgLoading] = useState(false);
  const [msgSending, setMsgSending] = useState(false);

  const vendorContacts = useMemo(() => {
    const m = new Map();
    (orders || []).forEach((o) => {
      const id = o.vendorId ? String(o.vendorId) : "";
      if (!id || m.has(id)) return;
      m.set(id, { id, name: o.vendorName || "Kitchen" });
    });
    return [...m.values()];
  }, [orders]);

  const loadMessageThread = useCallback(async (partnerId) => {
    if (!partnerId) return;
    setMsgLoading(true);
    try {
      const res = await api.get(`/messages/conversation/${partnerId}`);
      setMsgThread(res.data?.data || []);
    } catch {
      setMsgThread([]);
    } finally {
      setMsgLoading(false);
    }
  }, []);

  const loadData = useCallback(async () => {
    setLoadingDash(true);
    try {
      const [ordersRes, favRes, profRes] = await Promise.all([
        api.get("/orders/my-orders"),
        api.get("/customer/favorites"),
        api.get("/customer/profile"),
      ]);

      if (ordersRes.data?.status === "success") {
        setOrders(ordersRes.data.data || []);
      }
      if (favRes.data?.status === "success") {
        setFavorites(favRes.data.favorites || []);
      }
      if (profRes.data?.status === "success" && profRes.data.user) {
        const u = profRes.data.user;
        setUser(u);
        setSettingsForm({
          name: u.name || "",
          phone: u.phone || "",
          address: u.address || "",
        });
      }
    } catch (err) {
      console.error("Dashboard load failed:", err);
    } finally {
      setLoadingDash(false);
    }
  }, [setUser]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (activeTab !== "chats") return;
    if (!msgPartnerId && vendorContacts.length) {
      setMsgPartnerId(vendorContacts[0].id);
      return;
    }
    if (!msgPartnerId) return;
    loadMessageThread(msgPartnerId);
    const t = setInterval(() => loadMessageThread(msgPartnerId), 15000);
    return () => clearInterval(t);
  }, [activeTab, msgPartnerId, vendorContacts, loadMessageThread]);

  useEffect(() => {
    if (activeTab !== "orders") return;
    const t = setInterval(() => {
      api.get("/orders/my-orders").then((r) => {
        if (r.data?.status === "success") setOrders(r.data.data || []);
      });
    }, 12000);
    return () => clearInterval(t);
  }, [activeTab]);

  useEffect(() => {
    if (user) {
      setSettingsForm((prev) => ({
        name: user.name ?? prev.name,
        phone: user.phone ?? prev.phone,
        address: user.address ?? prev.address,
      }));
    }
  }, [user?.name, user?.phone, user?.address]);

  const displayName = user?.name?.trim() || user?.email?.split("@")[0] || "there";

  const activeOrderCount = useMemo(
    () =>
      orders.filter(
        (o) => o.status && !["delivered", "cancelled"].includes(o.status),
      ).length,
    [orders],
  );

  const totalSpent = useMemo(() => {
    return orders
      .filter((o) => o.status !== "cancelled")
      .reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const q = orderQuery.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter((o) => {
      const id = String(o._id).toLowerCase();
      const names = (o.items || []).map((i) => (i.dishName || "").toLowerCase()).join(" ");
      return id.includes(q) || names.includes(q);
    });
  }, [orders, orderQuery]);

  const tabs = [
    { id: "overview", label: "Overview", icon: LayoutGrid },
    { id: "orders", label: "My orders", icon: Package },
    { id: "favorites", label: "Favorites", icon: Heart },
    { id: "chats", label: "Messages", icon: MessageSquare },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const sendVendorMessage = async () => {
    if (!msgPartnerId || !msgDraft.trim()) return;
    setMsgSending(true);
    try {
      await api.post("/messages", {
        to: msgPartnerId,
        body: msgDraft.trim(),
      });
      setMsgDraft("");
      await loadMessageThread(msgPartnerId);
    } catch (err) {
      console.error(err);
    } finally {
      setMsgSending(false);
    }
  };

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    setSettingsSaving(true);
    setSettingsFeedback(null);
    try {
      const res = await api.patch("/customer/profile", {
        name: settingsForm.name.trim(),
        phone: settingsForm.phone.trim(),
        address: settingsForm.address.trim(),
      });
      if (res.data?.user) setUser(res.data.user);
      setSettingsFeedback({ type: "ok", text: "Profile updated." });
    } catch (err) {
      setSettingsFeedback({
        type: "err",
        text: err.response?.data?.message || "Could not save changes.",
      });
    } finally {
      setSettingsSaving(false);
    }
  };

  const NavButtons = ({ onPick }) => (
    <nav className="space-y-1 p-2">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = activeTab === tab.id;
        return (
          <button
            type="button"
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              onPick?.();
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all border ${
              active
                ? "bg-orange-500/12 border-orange-500/30 text-orange-400 shadow-md shadow-orange-500/5"
                : "border-transparent text-gray-400 hover:bg-white/[0.04] hover:text-gray-200 hover:border-white/[0.06]"
            }`}
          >
            <Icon size={18} className="shrink-0 opacity-90" />
            {tab.label}
          </button>
        );
      })}
    </nav>
  );

  return (
    <div
      className="min-h-screen bg-[#09090b] text-white"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* pt-20 clears fixed Navbar (h-16) + spacing */}
      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)_300px] gap-6 lg:gap-8 items-start">
          {/* ── Mobile nav toggle ───────────────────────────────────────── */}
          <div className="flex items-center justify-between lg:hidden">
            <h1
              className="text-lg font-bold text-white"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Dashboard
          </h1>
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              className={`p-2.5 ${glassTight} text-gray-300`}
            >
              <Menu size={20} />
            </button>
          </div>

          {/* ── Column 1: Sidebar (desktop) ───────────────────────────── */}
          <aside className={`hidden lg:block ${glass} overflow-hidden sticky top-24`}>
            <div className="p-5 border-b border-white/[0.06] bg-white/[0.02]">
              <p
                className="text-white font-bold text-lg"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Flavor<span className="text-orange-500">Craft</span>
              </p>
              <p className="text-gray-600 text-xs mt-1">Your account</p>
            </div>
            <NavButtons />
            <div className="p-3 border-t border-white/[0.06] space-y-1">
              <Link
                to="/"
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-gray-500 hover:text-orange-400 hover:bg-white/[0.03] transition-colors"
              >
                <ChevronRight size={16} className="rotate-180" />
                Back to feed
              </Link>
          <button
                type="button"
            onClick={logout}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-gray-500 hover:text-red-400 hover:bg-red-500/5 transition-colors text-left"
          >
                <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>

          {/* ── Column 2: Main content ─────────────────────────────────── */}
          <main className="min-w-0 space-y-8 lg:pt-0 pt-0">
            {loadingDash ? (
              <div className={`${glass} flex flex-col items-center justify-center py-24 gap-3`}>
                <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                <p className="text-gray-500 text-sm">Loading your dashboard…</p>
              </div>
            ) : (
        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
                  <motion.section
              key="overview"
                    initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
                    className="space-y-8"
            >
              <header>
                      <h2
                        className="text-3xl sm:text-4xl font-bold text-white tracking-tight"
                        style={{ fontFamily: "'Playfair Display', serif" }}
                      >
                        Welcome back, {displayName}!
                </h2>
                      <p className="text-gray-500 mt-2 max-w-xl text-sm leading-relaxed">
                        Track orders, revisit saved dishes, and keep your profile up to date.
                </p>
              </header>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {[
                        {
                          title: "Active orders",
                          value: activeOrderCount,
                          sub: "In progress",
                          icon: Truck,
                          accent: "text-orange-400",
                          ring: "from-orange-500/20 to-transparent",
                        },
                        {
                          title: "Total spent",
                          value: `₨${totalSpent.toLocaleString()}`,
                          sub: "All orders (excl. cancelled)",
                          icon: IndianRupee,
                          accent: "text-emerald-400",
                          ring: "from-emerald-500/20 to-transparent",
                        },
                        {
                          title: "Saved items",
                          value: favorites.length,
                          sub: "Favorite dishes",
                          icon: Heart,
                          accent: "text-rose-400",
                          ring: "from-rose-500/20 to-transparent",
                        },
                      ].map((card) => (
                        <div
                          key={card.title}
                          className={`${glass} p-5 relative overflow-hidden group hover:border-orange-500/20 transition-colors`}
                        >
                          <div
                            className={`absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gradient-to-br ${card.ring} opacity-60 pointer-events-none`}
                          />
                          <div className="flex items-start justify-between gap-3 relative">
                            <div
                              className={`p-3 rounded-xl bg-white/[0.04] border border-white/[0.08] ${card.accent}`}
                            >
                              <card.icon size={22} strokeWidth={1.75} />
                      </div>
                    </div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-4">
                            {card.title}
                          </p>
                          <p className="text-2xl sm:text-3xl font-bold text-white mt-1 tabular-nums">
                            {card.value}
                          </p>
                          <p className="text-gray-600 text-xs mt-1">{card.sub}</p>
                  </div>
                ))}
              </div>

                    <div className={`${glass} overflow-hidden`}>
                      <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between bg-white/[0.02]">
                        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                          <Sparkles size={16} className="text-orange-400" />
                          Recent orders
                  </h3>
                  <button
                          type="button"
                    onClick={() => setActiveTab("orders")}
                          className="text-xs font-bold text-orange-400 hover:text-orange-300"
                  >
                          View all
                  </button>
                </div>
                      <div className="divide-y divide-white/[0.05]">
                        {orders.length === 0 ? (
                          <p className="p-10 text-center text-gray-500 text-sm">
                            No orders yet.{" "}
                            <Link to="/" className="text-orange-400 hover:underline font-medium">
                              Browse the feed
                            </Link>
                          </p>
                        ) : (
                          orders.slice(0, 5).map((o) => {
                            const img = o.items?.[0]?.dishImage;
                            return (
                    <div
                      key={o._id}
                                className="p-4 flex items-center gap-4 hover:bg-white/[0.02] transition-colors"
                              >
                                {img ? (
                                  <img
                                    src={img}
                                    alt=""
                                    className="w-12 h-12 rounded-xl object-cover border border-white/[0.08] shrink-0"
                                  />
                                ) : (
                                  <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0 text-lg opacity-40">
                                    🍽️
                        </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-100 truncate">
                                    {o.items?.[0]?.dishName || "Order"}
                                  </p>
                                  <p className="text-[11px] text-gray-600 mt-0.5">
                                    {new Date(o.createdAt).toLocaleString(undefined, {
                                      dateStyle: "medium",
                                      timeStyle: "short",
                                    })}
                          </p>
                        </div>
                                <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
                                  {statusBadge(o.status)}
                                  <span className="text-xs font-bold text-white">
                                    ₨{o.totalAmount?.toLocaleString?.() ?? o.totalAmount}
                                  </span>
                                </div>
                      </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </motion.section>
          )}

          {activeTab === "orders" && (
                  <motion.section
              key="orders"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                      <div>
                        <h2
                          className="text-2xl sm:text-3xl font-bold text-white"
                          style={{ fontFamily: "'Playfair Display', serif" }}
                        >
                          My orders
                        </h2>
                        <p className="text-gray-500 text-sm mt-1">
                          Dish photos, dates, and status — open any order for full customization details.
                        </p>
                      </div>
                      <div className="relative w-full sm:max-w-xs">
                  <Search
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600"
                          size={16}
                  />
                  <input
                          type="search"
                          value={orderQuery}
                          onChange={(e) => setOrderQuery(e.target.value)}
                          placeholder="Search by dish or order id…"
                          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl py-2.5 pl-10 pr-4 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-orange-500/35 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-4">
                      {filteredOrders.length === 0 ? (
                        <div className={`${glass} p-12 text-center text-gray-500 text-sm`}>
                          {orders.length === 0
                            ? "You have not placed any orders yet."
                            : "No orders match your search."}
                        </div>
                      ) : (
                        filteredOrders.map((o) => {
                          const first = o.items?.[0];
                          return (
                  <div
                    key={o._id}
                              className={`${glass} p-4 sm:p-5 flex flex-col sm:flex-row gap-4 sm:items-center hover:border-orange-500/20 transition-colors`}
                            >
                              <div className="flex gap-4 flex-1 min-w-0">
                                {first?.dishImage ? (
                                  <img
                                    src={first.dishImage}
                                    alt=""
                                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border border-white/[0.08] shrink-0"
                                  />
                                ) : (
                                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-3xl opacity-30 shrink-0">
                                    🍽️
                      </div>
                                )}
                                <div className="min-w-0 flex flex-col justify-center">
                                  <h4 className="text-base font-semibold text-white leading-snug line-clamp-2">
                                    {first?.dishName || "Order"}
                                    {(o.items?.length || 0) > 1 && (
                                      <span className="text-gray-500 font-normal text-sm">
                                        {" "}
                                        +{o.items.length - 1} more
                                      </span>
                                    )}
                                  </h4>
                                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
                                    <Clock size={12} />
                                    {new Date(o.createdAt).toLocaleString(undefined, {
                                      dateStyle: "long",
                                      timeStyle: "short",
                                    })}
                                  </p>
                                  <div className="mt-2">{statusBadge(o.status)}</div>
                        </div>
                      </div>
                              <div className="flex flex-row sm:flex-col items-center justify-between sm:items-end gap-3 border-t sm:border-t-0 border-white/[0.06] pt-4 sm:pt-0 shrink-0">
                                <p className="text-lg font-bold text-white tabular-nums">
                                  ₨{o.totalAmount?.toLocaleString?.() ?? o.totalAmount}
                                </p>
                                <button
                                  type="button"
                                  onClick={() => setDetailOrder(o)}
                                  className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide bg-orange-500/15 border border-orange-500/35 text-orange-400 hover:bg-orange-500 hover:text-white transition-all"
                                >
                                  View details
                      </button>
                    </div>
                  </div>
                          );
                        })
                      )}
              </div>
                  </motion.section>
          )}

          {activeTab === "favorites" && (
                  <motion.section
                    key="favorites"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <h2
                      className="text-2xl sm:text-3xl font-bold text-white"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      Favorites
                    </h2>
                    {favorites.length === 0 ? (
                      <div className={`${glass} p-12 text-center text-gray-500 text-sm`}>
                        Save dishes from the feed or customize page to see them here.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                        {favorites.map((d) => {
                          const v = d.vendorId;
                          const vid = typeof v === "object" && v?._id ? v._id : v;
                          const shop =
                            (typeof v === "object" && v?.vendorProfile?.shopName) || "Kitchen";
                          return (
                            <div
                              key={d._id}
                              className={`${glass} overflow-hidden flex flex-col hover:border-orange-500/25 transition-colors`}
                            >
                              <div className="aspect-[4/3] bg-[#111] relative">
                                {d.image ? (
                                  <img
                                    src={d.image}
                                    alt={d.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-5xl opacity-20">
                                    🍽️
                    </div>
                                )}
                        <Heart
                                  size={18}
                                  className="absolute top-3 right-3 text-rose-400 fill-rose-400 drop-shadow-md"
                        />
                      </div>
                              <div className="p-4 flex flex-col flex-1">
                                <h4 className="font-semibold text-gray-100 line-clamp-2 text-sm leading-snug">
                                  {d.name}
                                </h4>
                                <p className="text-orange-400 font-bold mt-2">
                                  ₨{d.price?.toLocaleString?.() ?? d.price}
                                </p>
                                {vid && (
                                  <button
                                    type="button"
                                    onClick={() => navigate(`/vendor/${vid}`)}
                                    className="text-left text-xs text-gray-500 hover:text-orange-400 mt-2"
                                  >
                                    {shop} →
                      </button>
                                )}
                                <Link
                                  to={`/customize/${d._id}`}
                                  state={{ dish: d }}
                                  className="mt-auto pt-4 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold bg-orange-500/12 border border-orange-500/30 text-orange-400 hover:bg-orange-500 hover:text-white transition-all"
                                >
                                  <Zap size={14} /> Customize
                                </Link>
                    </div>
                  </div>
                          );
                        })}
              </div>
                    )}
                  </motion.section>
          )}

          {activeTab === "chats" && (
                  <motion.section
              key="chats"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
                    className={`${glass} min-h-[420px] flex flex-col lg:flex-row overflow-hidden`}
                  >
                    <div className="w-full lg:w-56 border-b lg:border-b-0 lg:border-r border-white/[0.06] p-3 max-h-48 lg:max-h-none overflow-y-auto">
                      <p className="text-[10px] uppercase tracking-widest text-gray-600 font-bold px-2 mb-2">
                        Kitchens
                      </p>
                      {vendorContacts.length === 0 ? (
                        <p className="text-gray-600 text-xs px-2 py-4">
                          Place an order first to message a vendor.
                        </p>
                      ) : (
                        vendorContacts.map((v) => (
                          <button
                            type="button"
                            key={v.id}
                            onClick={() => setMsgPartnerId(v.id)}
                            className={`w-full text-left px-3 py-2 rounded-xl text-sm mb-1 transition-colors ${
                              msgPartnerId === v.id
                                ? "bg-orange-500/15 text-orange-400 border border-orange-500/25"
                                : "text-gray-400 hover:bg-white/[0.04] border border-transparent"
                            }`}
                          >
                            {v.name}
                          </button>
                        ))
                      )}
                    </div>
                    <div className="flex-1 flex flex-col min-h-[320px]">
                      <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {msgLoading && (
                          <p className="text-gray-600 text-sm text-center py-8">
                            Loading…
                          </p>
                        )}
                        {!msgLoading &&
                          msgThread.map((m) => {
                            const mine = String(m.from?._id || m.from) === String(user?._id);
                            return (
                              <div
                                key={m._id}
                                className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm border ${
                                  mine
                                    ? "ml-auto bg-orange-500/12 border-orange-500/25 text-gray-100"
                                    : "mr-auto bg-white/[0.04] border-white/[0.08] text-gray-300"
                                }`}
                              >
                                {m.body}
                                <p className="text-[10px] text-gray-600 mt-1">
                                  {new Date(m.createdAt).toLocaleString()}
                                </p>
                              </div>
                            );
                          })}
                        {!msgLoading && msgPartnerId && msgThread.length === 0 && (
                          <p className="text-gray-600 text-sm text-center py-8">
                            No messages yet. Say hello to your kitchen.
                          </p>
                        )}
                      </div>
                      <div className="p-3 border-t border-white/[0.06] flex gap-2">
                        <input
                          value={msgDraft}
                          onChange={(e) => setMsgDraft(e.target.value)}
                          disabled={!msgPartnerId || msgSending}
                          placeholder="Type a message…"
                          className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/35"
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              sendVendorMessage();
                            }
                          }}
                        />
                        <button
                          type="button"
                          disabled={!msgPartnerId || msgSending || !msgDraft.trim()}
                          onClick={sendVendorMessage}
                          className="px-4 py-2 rounded-xl bg-orange-500 text-white disabled:opacity-40 flex items-center gap-2 text-sm font-bold"
                        >
                          <Send size={16} />
                        </button>
                </div>
              </div>
                  </motion.section>
          )}

          {activeTab === "settings" && (
                  <motion.section
              key="settings"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-xl space-y-6"
                  >
                    <div>
                      <h2
                        className="text-2xl sm:text-3xl font-bold text-white"
                        style={{ fontFamily: "'Playfair Display', serif" }}
                      >
                        Settings
                      </h2>
                      <p className="text-gray-500 text-sm mt-1">
                        Update how we reach you and deliver your orders.
                      </p>
                    </div>

                    <form
                      onSubmit={handleSettingsSubmit}
                      className={`${glass} p-6 sm:p-8 space-y-5`}
                    >
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                          Profile name
                        </label>
                        <input
                          type="text"
                          value={settingsForm.name}
                          onChange={(e) =>
                            setSettingsForm((s) => ({ ...s, name: e.target.value }))
                          }
                          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/40 transition-colors"
                          placeholder="Your name"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                          Phone
                        </label>
                        <input
                          type="tel"
                          value={settingsForm.phone}
                          onChange={(e) =>
                            setSettingsForm((s) => ({ ...s, phone: e.target.value }))
                          }
                          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/40 transition-colors"
                          placeholder="+92 …"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                          Address
                        </label>
                        <textarea
                          value={settingsForm.address}
                          onChange={(e) =>
                            setSettingsForm((s) => ({ ...s, address: e.target.value }))
                          }
                          rows={4}
                          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/40 transition-colors resize-y min-h-[100px]"
                          placeholder="Street, area, city — used for delivery notes"
                        />
                      </div>

                      {settingsFeedback && (
                        <p
                          className={`text-sm ${settingsFeedback.type === "ok" ? "text-emerald-400" : "text-red-400"}`}
                        >
                          {settingsFeedback.text}
                        </p>
                      )}

                      <button
                        type="submit"
                        disabled={settingsSaving}
                        className="w-full sm:w-auto px-8 py-3 rounded-xl text-sm font-bold bg-orange-500 hover:bg-orange-600 text-white border border-orange-500/30 shadow-lg shadow-orange-500/20 disabled:opacity-50 disabled:pointer-events-none transition-all flex items-center justify-center gap-2"
                      >
                        {settingsSaving ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" /> Saving…
                          </>
                        ) : (
                          "Save changes"
                        )}
                      </button>
                    </form>
                  </motion.section>
                )}
              </AnimatePresence>
            )}
          </main>

          {/* ── Column 3: Account rail (xl+) ───────────────────────────── */}
          <aside className={`hidden xl:block ${glass} sticky top-24 p-5 space-y-5 h-fit`}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/35 to-orange-600/10 border border-orange-500/30 flex items-center justify-center text-lg font-bold text-orange-200 shrink-0">
                {displayName[0]?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-white font-semibold text-sm truncate">{displayName}</p>
                <p className="text-gray-500 text-xs truncate flex items-center gap-1 mt-0.5">
                  <Mail size={11} className="shrink-0" />
                  {user?.email}
                </p>
              </div>
            </div>
            <div className="space-y-2 text-xs">
              <div className={`${glassTight} px-3 py-2 flex justify-between text-gray-400`}>
                <span>Active</span>
                <span className="text-white font-bold tabular-nums">{activeOrderCount}</span>
              </div>
              <div className={`${glassTight} px-3 py-2 flex justify-between text-gray-400`}>
                <span>Favorites</span>
                <span className="text-white font-bold tabular-nums">{favorites.length}</span>
              </div>
              <div className={`${glassTight} px-3 py-2 flex justify-between text-gray-400`}>
                <span>Orders</span>
                <span className="text-white font-bold tabular-nums">{orders.length}</span>
              </div>
            </div>
            {user?.address ? (
              <div className="text-xs text-gray-500 flex gap-2 leading-relaxed">
                <MapPin size={14} className="text-orange-400/80 shrink-0 mt-0.5" />
                <span>{user.address}</span>
              </div>
            ) : (
              <p className="text-xs text-gray-600">
                Add a delivery address in Settings for faster checkout.
              </p>
            )}
            <Link
              to="/"
              className="block text-center text-xs font-bold uppercase tracking-wider py-2.5 rounded-xl border border-white/[0.08] text-gray-400 hover:text-orange-400 hover:border-orange-500/30 transition-all"
            >
              Browse dishes
            </Link>
          </aside>
        </div>
      </div>

      {/* Mobile drawer nav */}
      <AnimatePresence>
        {mobileNavOpen && (
          <motion.div
            key="mobile-shell"
            className="fixed inset-0 z-[150] lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              aria-label="Close menu"
              className="absolute inset-0 bg-black/65 backdrop-blur-sm border-0 cursor-pointer"
              onClick={() => setMobileNavOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className={`absolute top-0 left-0 bottom-0 w-[260px] ${glass} rounded-none border-y-0 border-l-0 flex flex-col shadow-2xl`}
            >
              <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
                <span
                  className="font-bold text-white"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Menu
                </span>
                <button
                  type="button"
                  onClick={() => setMobileNavOpen(false)}
                  className="p-2 rounded-lg border border-white/[0.08] text-gray-400"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto py-2">
                <NavButtons onPick={() => setMobileNavOpen(false)} />
              </div>
              <div className="p-3 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setMobileNavOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-red-400/90 hover:bg-red-500/10"
                >
                  <LogOut size={16} /> Sign out
                </button>
              </div>
            </motion.aside>
            </motion.div>
          )}
        </AnimatePresence>

      <AnimatePresence>
        {detailOrder && (
          <OrderDetailsModal
            key={detailOrder._id}
            order={detailOrder}
            onClose={() => setDetailOrder(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
