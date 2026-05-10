// ── FIXED: api import path corrected to ../../utils/api ──────────────────────
// This is the complete DealsView with the correct import.
// Replace your existing src/pages/vendor/DealsView.jsx with this file.

import { useState, useEffect } from "react";
import {
  Tag,
  Plus,
  Trash2,
  Search,
  Calendar,
  ToggleLeft,
  ToggleRight,
  Check,
  AlertCircle,
  X,
  Percent,
  Sparkles,
} from "lucide-react";
import api from "../../utils/api"; // ← FIXED (was incorrectly ../utils/api in some setups)

// ── Deal Form Modal ────────────────────────────────────────────────────────────
function DealFormModal({ onClose, onSuccess, editDeal = null, allDishes }) {
  const [form, setForm] = useState({
    title: editDeal?.title || "",
    description: editDeal?.description || "",
    items:
      editDeal?.items?.map((i) => ({
        dish: i.dish._id || i.dish,
        quantity: i.quantity,
      })) || [],
    dealPrice: editDeal?.dealPrice || "",
    expiresAt: editDeal?.expiresAt
      ? new Date(editDeal.expiresAt).toISOString().slice(0, 10)
      : "",
  });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const filteredDishes = allDishes.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()),
  );

  const isDishInDeal = (id) => form.items.some((i) => i.dish === id);

  const toggleDish = (dish) => {
    if (isDishInDeal(dish._id)) {
      setForm((f) => ({
        ...f,
        items: f.items.filter((i) => i.dish !== dish._id),
      }));
    } else {
      setForm((f) => ({
        ...f,
        items: [...f.items, { dish: dish._id, quantity: 1 }],
      }));
    }
  };

  const updateQty = (dishId, qty) =>
    setForm((f) => ({
      ...f,
      items: f.items.map((i) =>
        i.dish === dishId ? { ...i, quantity: Math.max(1, Number(qty)) } : i,
      ),
    }));

  const originalPrice = form.items.reduce((sum, item) => {
    const dish = allDishes.find((d) => d._id === item.dish);
    return sum + (dish ? dish.price * item.quantity : 0);
  }, 0);

  const savings = Math.max(0, originalPrice - Number(form.dealPrice || 0));
  const savingsPercent =
    originalPrice > 0 ? Math.round((savings / originalPrice) * 100) : 0;

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.items.length || !form.dealPrice) {
      setError("Title, at least one dish, and deal price are required.");
      return;
    }
    if (Number(form.dealPrice) <= 0) {
      setError("Deal price must be greater than zero.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const payload = {
        ...form,
        dealPrice: Number(form.dealPrice),
        expiresAt: form.expiresAt || null,
      };
      if (editDeal) {
        await api.patch(`/deals/${editDeal._id}`, payload);
      } else {
        await api.post("/deals", payload);
      }
      setSaved(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 800);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className="relative bg-[#161616] border border-white/[0.07] rounded-2xl w-full shadow-2xl flex overflow-hidden"
        style={{ maxWidth: 760, maxHeight: "90vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left — dish picker */}
        <div className="w-72 shrink-0 border-r border-white/[0.06] flex flex-col">
          <div className="px-5 py-4 border-b border-white/[0.06]">
            <p className="text-white font-semibold text-sm">Select Dishes</p>
            <p className="text-gray-600 text-xs mt-0.5">
              {form.items.length} selected
            </p>
          </div>
          <div className="px-4 py-3 border-b border-white/[0.05]">
            <div className="relative">
              <Search
                size={12}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search dishes..."
                className="w-full bg-[#111] border border-white/[0.07] text-gray-300 rounded-xl pl-8 pr-3 py-2 text-xs outline-none focus:border-orange-500/40 transition-all placeholder-gray-700"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto py-2">
            {filteredDishes.length === 0 && (
              <p className="text-center text-gray-700 text-xs py-8">
                {allDishes.length === 0
                  ? "Add dishes to your menu first."
                  : "No dishes found."}
              </p>
            )}
            {filteredDishes.map((dish) => {
              const selected = isDishInDeal(dish._id);
              return (
                <button
                  key={dish._id}
                  type="button"
                  onClick={() => toggleDish(dish)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.03] transition-colors text-left ${selected ? "bg-orange-500/[0.07]" : ""}`}
                >
                  <div
                    className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all ${selected ? "bg-orange-500 border-orange-500" : "border-white/[0.15]"}`}
                  >
                    {selected && (
                      <Check
                        size={11}
                        className="text-white"
                        strokeWidth={2.5}
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-gray-200 text-xs font-medium truncate">
                      {dish.name}
                    </p>
                    <p className="text-gray-600 text-[11px]">
                      ₨{dish.price} · {dish.category}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right — form */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
            <div>
              <h2
                className="text-white font-bold"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {editDeal ? "Edit Deal" : "Create Deal"}
              </h2>
              <p className="text-gray-600 text-xs mt-0.5">
                Bundle dishes at a special price
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-gray-500 hover:text-gray-300 flex items-center justify-center transition-all"
            >
              <X size={15} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-widest text-gray-500 mb-2">
                Deal Title <span className="text-orange-500">*</span>
              </label>
              <input
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder='"Weekend Family Feast" or "Sehri Special"'
                className="w-full bg-[#111] border border-white/[0.08] focus:border-orange-500/60 text-gray-200 rounded-xl px-4 py-3 text-sm outline-none transition-all placeholder-gray-700"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-widest text-gray-500 mb-2">
                Description
              </label>
              <textarea
                rows={2}
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="What makes this deal special?"
                className="w-full bg-[#111] border border-white/[0.08] focus:border-orange-500/60 text-gray-200 rounded-xl px-4 py-3 text-sm outline-none transition-all resize-none placeholder-gray-700"
              />
            </div>

            {form.items.length > 0 && (
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-widest text-gray-500 mb-2">
                  Included Items · Set Quantities
                </label>
                <div className="space-y-2">
                  {form.items.map((item) => {
                    const dish = allDishes.find((d) => d._id === item.dish);
                    if (!dish) return null;
                    return (
                      <div
                        key={item.dish}
                        className="flex items-center gap-3 bg-[#111] border border-white/[0.06] rounded-xl px-4 py-3"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-200 text-sm font-medium truncate">
                            {dish.name}
                          </p>
                          <p className="text-gray-600 text-xs">
                            ₨{dish.price} each
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() =>
                              updateQty(item.dish, item.quantity - 1)
                            }
                            className="w-7 h-7 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-gray-400 text-sm flex items-center justify-center transition-all"
                          >
                            −
                          </button>
                          <span className="w-6 text-center text-gray-200 text-sm font-semibold">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              updateQty(item.dish, item.quantity + 1)
                            }
                            className="w-7 h-7 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-gray-400 text-sm flex items-center justify-center transition-all"
                          >
                            +
                          </button>
                        </div>
                        <p className="text-orange-400 text-sm font-semibold w-16 text-right">
                          ₨{dish.price * item.quantity}
                        </p>
                        <button
                          type="button"
                          onClick={() => toggleDish(dish)}
                          className="text-gray-700 hover:text-red-400 transition-colors ml-1"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-3 bg-[#111] border border-white/[0.06] rounded-xl px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] text-gray-600 uppercase tracking-wider">
                      Original price
                    </p>
                    <p className="text-gray-300 font-semibold">
                      ₨{originalPrice.toLocaleString()}
                    </p>
                  </div>
                  {savingsPercent > 0 && (
                    <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
                      <Percent size={11} className="text-emerald-400" />
                      <span className="text-emerald-400 text-xs font-bold">
                        {savingsPercent}% off
                      </span>
                    </div>
                  )}
                  <div className="text-right">
                    <p className="text-[11px] text-gray-600 uppercase tracking-wider">
                      You save
                    </p>
                    <p className="text-emerald-400 font-semibold">
                      ₨{savings.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-widest text-gray-500 mb-2">
                  Deal Price (₨) <span className="text-orange-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.dealPrice}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, dealPrice: e.target.value }))
                  }
                  placeholder="e.g. 1800"
                  className="w-full bg-[#111] border border-white/[0.08] focus:border-orange-500/60 text-gray-200 rounded-xl px-4 py-3 text-sm outline-none transition-all placeholder-gray-700"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-widest text-gray-500 mb-2">
                  Expiry Date{" "}
                  <span className="text-gray-700 normal-case font-normal">
                    (optional)
                  </span>
                </label>
                <input
                  type="date"
                  value={form.expiresAt}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, expiresAt: e.target.value }))
                  }
                  min={new Date().toISOString().slice(0, 10)}
                  className="w-full bg-[#111] border border-white/[0.08] focus:border-orange-500/60 text-gray-200 rounded-xl px-4 py-3 text-sm outline-none transition-all"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <AlertCircle size={13} /> {error}
              </div>
            )}
          </div>

          <div className="border-t border-white/[0.06] px-6 py-4 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 bg-white/[0.05] hover:bg-white/[0.09] text-gray-400 border border-white/[0.07] rounded-xl text-sm font-medium transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || saved}
              className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition-all flex items-center gap-2"
            >
              {saved ? (
                <>
                  <Check size={14} /> Saved!
                </>
              ) : loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />{" "}
                  Saving...
                </>
              ) : editDeal ? (
                "Save Changes"
              ) : (
                "Create Deal"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Deal Card ─────────────────────────────────────────────────────────────────
function DealCard({ deal, onEdit, onRefresh }) {
  const [toggling, setToggling] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const isExpired = deal.expiresAt && new Date(deal.expiresAt) < new Date();

  const handleToggle = async () => {
    setToggling(true);
    try {
      await api.patch(`/deals/${deal._id}/toggle`);
      onRefresh();
    } finally {
      setToggling(false);
    }
  };
  const handleDelete = async () => {
    if (!confirm) {
      setConfirm(true);
      return;
    }
    setDeleting(true);
    try {
      await api.delete(`/deals/${deal._id}`);
      onRefresh();
    } finally {
      setDeleting(false);
      setConfirm(false);
    }
  };

  return (
    <div
      className={`bg-[#161616] border rounded-2xl overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/40 ${deal.isActive && !isExpired ? "border-white/[0.07]" : "border-white/[0.04] opacity-55"}`}
    >
      {deal.savingsPercent > 0 && (
        <div className="bg-gradient-to-r from-orange-500/20 to-amber-500/10 border-b border-orange-500/15 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={13} className="text-orange-400" />
            <span className="text-orange-400 text-xs font-bold">
              {deal.savingsPercent}% OFF
            </span>
            <span className="text-gray-600 text-xs">
              — Save ₨{deal.savings?.toLocaleString()}
            </span>
          </div>
          {isExpired && (
            <span className="text-red-400 text-[11px] font-semibold">
              Expired
            </span>
          )}
          {deal.expiresAt && !isExpired && (
            <div className="flex items-center gap-1 text-[11px] text-gray-600">
              <Calendar size={10} />
              {new Date(deal.expiresAt).toLocaleDateString("en-PK", {
                day: "numeric",
                month: "short",
              })}
            </div>
          )}
        </div>
      )}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h3
              className="text-gray-100 font-semibold"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {deal.title}
            </h3>
            {deal.description && (
              <p className="text-gray-600 text-xs mt-1 line-clamp-2">
                {deal.description}
              </p>
            )}
          </div>
          <div className="text-right shrink-0">
            <p className="text-orange-400 font-bold text-lg">
              ₨{deal.dealPrice?.toLocaleString()}
            </p>
            {deal.originalPrice > 0 && (
              <p className="text-gray-700 text-xs line-through">
                ₨{deal.originalPrice?.toLocaleString()}
              </p>
            )}
          </div>
        </div>
        <div className="space-y-1.5 mb-4">
          {deal.items?.map((item, i) => (
            <div key={i} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-orange-500/10 text-orange-400 font-bold flex items-center justify-center text-[10px]">
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
        <div className="flex items-center gap-2 pt-3 border-t border-white/[0.05]">
          <button
            onClick={() => onEdit(deal)}
            className="flex-1 py-2 bg-white/[0.05] hover:bg-white/[0.09] text-gray-400 hover:text-gray-200 rounded-xl text-xs font-semibold border border-white/[0.07] transition-all"
          >
            Edit
          </button>
          <button
            onClick={handleToggle}
            disabled={toggling}
            className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all ${deal.isActive ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20" : "bg-white/[0.04] border-white/[0.07] text-gray-600 hover:text-gray-400"}`}
          >
            {deal.isActive ? (
              <ToggleRight size={15} />
            ) : (
              <ToggleLeft size={15} />
            )}
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            onBlur={() => setConfirm(false)}
            className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all ${confirm ? "bg-red-500/20 border-red-500/40 text-red-400" : "bg-white/[0.04] border-white/[0.07] text-gray-600 hover:text-red-400 hover:border-red-500/20"}`}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main DealsView ─────────────────────────────────────────────────────────────
export default function DealsView() {
  const [deals, setDeals] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editDeal, setEditDeal] = useState(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [dealsRes, dishesRes] = await Promise.all([
        api.get("/deals"),
        api.get("/dishes"),
      ]);
      setDeals(dealsRes.data.deals);
      setDishes(dishesRes.data.dishes);
    } catch (err) {
      console.error("DealsView fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const openEdit = (deal) => {
    setEditDeal(deal);
    setShowModal(true);
  };
  const closeModal = () => {
    setShowModal(false);
    setEditDeal(null);
  };

  const activeDeals = deals.filter((d) => d.isActive);
  const inactiveDeals = deals.filter((d) => !d.isActive);

  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1
            className="text-2xl font-bold text-white"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Deals & Offers
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            {deals.length} deal{deals.length !== 1 ? "s" : ""} ·{" "}
            {activeDeals.length} active
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-orange-500/20"
        >
          <Plus size={15} /> Create Deal
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-52 bg-[#161616] border border-white/[0.05] rounded-2xl animate-pulse"
            />
          ))}
        </div>
      ) : deals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.04] flex items-center justify-center mb-4">
            <Tag size={28} className="text-gray-700" />
          </div>
          <p className="text-gray-400 font-medium mb-1">No deals yet</p>
          <p className="text-gray-700 text-sm mb-5">
            Create bundles to attract more customers
          </p>
          {dishes.length === 0 ? (
            <p className="text-amber-400/70 text-xs">
              Add dishes to your menu first before creating deals.
            </p>
          ) : (
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-orange-500/15 hover:bg-orange-500/25 text-orange-400 border border-orange-500/25 rounded-xl text-sm font-semibold transition-all"
            >
              <Plus size={14} /> Create Your First Deal
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {activeDeals.length > 0 && (
            <div>
              <p className="text-[11px] uppercase tracking-widest text-gray-600 font-semibold mb-3">
                Active ({activeDeals.length})
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {activeDeals.map((deal) => (
                  <DealCard
                    key={deal._id}
                    deal={deal}
                    onEdit={openEdit}
                    onRefresh={fetchAll}
                  />
                ))}
              </div>
            </div>
          )}
          {inactiveDeals.length > 0 && (
            <div>
              <p className="text-[11px] uppercase tracking-widest text-gray-600 font-semibold mb-3">
                Inactive ({inactiveDeals.length})
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {inactiveDeals.map((deal) => (
                  <DealCard
                    key={deal._id}
                    deal={deal}
                    onEdit={openEdit}
                    onRefresh={fetchAll}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {showModal && (
        <DealFormModal
          onClose={closeModal}
          onSuccess={fetchAll}
          editDeal={editDeal}
          allDishes={dishes}
        />
      )}
    </div>
  );
}
