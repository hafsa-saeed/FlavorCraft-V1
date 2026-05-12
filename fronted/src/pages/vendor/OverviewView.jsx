import { useState, useEffect, useMemo } from "react";
import api from "../../utils/api";
import {
  TrendingUp,
  ShoppingBag,
  Star,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
  XCircle,
  RefreshCw,
  Clock,
  ChevronDown,
  Check,
  X,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const ALL_STATUSES = [
  "pending",
  "confirmed",
  "preparing",
  "on_way",
  "delivered",
  "cancelled",
];

const STATUS_META = {
  pending: {
    icon: Clock,
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    label: "Pending",
  },
  confirmed: {
    icon: Check,
    color: "text-sky-400",
    bg: "bg-sky-500/10",
    label: "Confirmed",
  },
  preparing: {
    icon: RefreshCw,
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    label: "Preparing",
  },
  on_way: {
    icon: TrendingUp,
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    label: "Out for delivery",
  },
  delivered: {
    icon: CheckCircle,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    label: "Delivered",
  },
  cancelled: {
    icon: XCircle,
    color: "text-red-400",
    bg: "bg-red-500/10",
    label: "Cancelled",
  },
};

const PIE_COLORS = {
  pending: "#eab308",
  confirmed: "#38bdf8",
  preparing: "#f97316",
  on_way: "#a78bfa",
  delivered: "#22c55e",
  cancelled: "#ef4444",
};

function buildSalesSeries(orders, rangeDays) {
  const cutoff = Date.now() - rangeDays * 86400000;
  const map = Object.fromEntries(
    DAY_LABELS.map((d) => [d, { day: d, revenue: 0, orders: 0 }]),
  );
  (orders || []).forEach((o) => {
    const t = new Date(o.createdAt).getTime();
    if (t < cutoff) return;
    const d = new Date(o.createdAt);
    const idx = (d.getDay() + 6) % 7;
    const label = DAY_LABELS[idx];
    map[label].revenue += Number(o.subtotal) || 0;
    map[label].orders += 1;
  });
  return DAY_LABELS.map((d) => map[d]);
}

function buildPieData(orders) {
  const counts = {};
  ALL_STATUSES.forEach((s) => {
    counts[s] = 0;
  });
  (orders || []).forEach((o) => {
    if (counts[o.status] !== undefined) counts[o.status] += 1;
  });
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  if (!total) {
    return [{ name: "No orders", value: 100, color: "#3f3f46" }];
  }
  return ALL_STATUSES.filter((s) => counts[s] > 0).map((s) => ({
    name: STATUS_META[s]?.label || s,
    value: Math.round((counts[s] / total) * 100),
    color: PIE_COLORS[s] || "#71717a",
  }));
}

function ChefItemNotes({ item }) {
  const parts = [];
  if (item.spiceLevel && item.spiceLevel !== "medium") {
    parts.push(`Spice: ${item.spiceLevel}`);
  }
  if (item.addons?.length) {
    parts.push(`Add: ${item.addons.map((a) => a.name).join(", ")}`);
  }
  if (item.removals?.length) {
    parts.push(`Remove: ${item.removals.join(", ")}`);
  }
  if (item.tastePrefs?.length) {
    parts.push(`Prefs: ${item.tastePrefs.join(" · ")}`);
  }
  if (item.extras?.ingredients?.length) {
    const ingLine = item.extras.ingredients
      .map((x) => {
        const n = x.name || x;
        if (x.removed) return `−${n}`;
        if (x.addedAsPaidAddon) return `+${n}`;
        return String(n);
      })
      .join(", ");
    parts.push(`Ingredients: ${ingLine}`);
  }
  if (item.specialNote?.trim()) {
    parts.push(`Note: ${item.specialNote}`);
  }
  if (!parts.length) return null;
  return (
    <p className="text-gray-500 text-[11px] leading-relaxed border-l border-orange-500/30 pl-2 mt-1">
      {parts.join(" · ")}
    </p>
  );
}

function OrderDetailModal({ order, onClose }) {
  if (!order) return null;
  const da = order.deliveryAddress || {};
  let customizationText = "";
  if (order.customizations != null && order.customizations !== "") {
    customizationText =
      typeof order.customizations === "string"
        ? order.customizations
        : JSON.stringify(order.customizations, null, 2);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative bg-[#121212] border border-white/[0.08] rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06] shrink-0">
          <div>
            <p className="text-white font-semibold text-sm">Order details</p>
            <p className="text-gray-600 text-xs font-mono mt-0.5">
              #{String(order._id).slice(-8).toUpperCase()}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto p-5 space-y-5">
          <section className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <p className="text-[10px] uppercase tracking-widest text-gray-600 font-bold mb-3">
              Customer
            </p>
            <p className="text-gray-100 text-sm font-semibold">
              {order.customerName}
            </p>
            <p className="text-gray-500 text-xs mt-2 flex items-center gap-2">
              <Mail size={13} className="shrink-0 text-gray-600" />
              {order.customerEmail}
            </p>
            {order.customerPhone ? (
              <p className="text-gray-500 text-xs mt-2 flex items-center gap-2">
                <Phone size={13} className="shrink-0 text-gray-600" />
                {order.customerPhone}
              </p>
            ) : null}
          </section>

          <section className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <p className="text-[10px] uppercase tracking-widest text-gray-600 font-bold mb-3 flex items-center gap-2">
              <MapPin size={12} /> Delivery
            </p>
            <p className="text-gray-300 text-sm">
              {da.type ? `${da.type} · ` : ""}
              {da.addressLine || "—"}
            </p>
            {da.city ? (
              <p className="text-gray-600 text-xs mt-1">{da.city}</p>
            ) : null}
            {da.instructions ? (
              <p className="text-gray-500 text-xs mt-3 leading-relaxed border-l border-orange-500/30 pl-3">
                <span className="text-gray-600 font-semibold">Drop-off: </span>
                {da.instructions}
              </p>
            ) : null}
          </section>

          {order.notes?.trim() ? (
            <section className="rounded-xl border border-amber-500/15 bg-amber-500/[0.04] p-4">
              <p className="text-[10px] uppercase tracking-widest text-amber-500/80 font-bold mb-2">
                Order note
              </p>
              <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">
                {order.notes.trim()}
              </p>
            </section>
          ) : null}

          {customizationText ? (
            <section className="rounded-xl border border-white/[0.06] bg-[#0d0d0d] p-4">
              <p className="text-[10px] uppercase tracking-widest text-gray-600 font-bold mb-2">
                Full customization snapshot
              </p>
              <pre className="text-[11px] text-gray-400 leading-relaxed whitespace-pre-wrap font-mono max-h-40 overflow-y-auto">
                {customizationText}
              </pre>
            </section>
          ) : null}

          <section>
            <p className="text-[10px] uppercase tracking-widest text-gray-600 font-bold mb-3">
              Line items & chef instructions
            </p>
            <div className="space-y-3">
              {(order.items || []).map((line, idx) => (
                <div
                  key={line._id || idx}
                  className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
                >
                  <p className="text-gray-200 text-sm font-semibold">
                    {line.quantity}× {line.dishName}
                  </p>
                  <ChefItemNotes item={line} />
                </div>
              ))}
            </div>
          </section>

          <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
            <span className="text-gray-600 text-xs">Total paid</span>
            <span className="text-orange-400 font-bold">
              ₨{(order.totalAmount ?? 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  iconColor,
  trend,
  trendValue,
}) {
  const isUp = trend === "up";
  return (
    <div className="bg-[#161616] border border-white/[0.06] rounded-2xl p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconColor}`}
        >
          <Icon size={18} />
        </div>
        {trendValue && (
          <span
            className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
              isUp
                ? "bg-emerald-500/10 text-emerald-400"
                : "bg-red-500/10 text-red-400"
            }`}
          >
            {isUp ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
            {trendValue}
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-gray-600 text-xs mt-0.5">{label}</p>
        {sub && <p className="text-gray-700 text-[11px] mt-1">{sub}</p>}
      </div>
    </div>
  );
}

// ── Custom tooltip ────────────────────────────────────────────────────────────
const LineTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1e1e1e] border border-white/10 rounded-xl px-4 py-3 shadow-xl">
      <p className="text-gray-400 text-xs mb-2 font-medium">{label}</p>
      <p className="text-orange-400 text-sm font-bold">
        ₨{payload[0]?.value?.toLocaleString()}
      </p>
      <p className="text-gray-500 text-xs">{payload[1]?.value} orders</p>
    </div>
  );
};

const PieLegend = ({ data }) => (
  <div className="flex flex-col gap-2.5 justify-center">
    {data.map((entry) => (
      <div key={entry.name} className="flex items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ background: entry.color }}
          />
          <span className="text-gray-400 text-xs">{entry.name}</span>
        </div>
        <span className="text-gray-300 text-xs font-semibold">
          {entry.value}%
        </span>
      </div>
    ))}
  </div>
);

// ── Status dropdown ───────────────────────────────────────────────────────────
function StatusDropdown({ orderId, currentStatus, onChange }) {
  const [open, setOpen] = useState(false);
  const meta = STATUS_META[currentStatus] || STATUS_META.pending;
  const Icon = meta.icon;

  const handleSelect = (s) => {
    onChange(orderId, s);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold transition-all ${meta.bg} ${meta.color} border-current/20`}
      >
        <Icon
          size={11}
          className={currentStatus === "preparing" ? "animate-spin" : ""}
        />
        {meta.label}
        <ChevronDown
          size={10}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-40 bg-[#1e1e1e] border border-white/[0.09] rounded-xl shadow-2xl shadow-black/60 overflow-hidden z-20 py-1">
          {ALL_STATUSES.map((s) => {
            const m = STATUS_META[s];
            const I = m.icon;
            const active = s === currentStatus;
            return (
              <button
                key={s}
                onClick={() => handleSelect(s)}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium transition-colors ${
                  active
                    ? `${m.bg} ${m.color}`
                    : "text-gray-500 hover:text-gray-300 hover:bg-white/[0.04]"
                }`}
              >
                <I size={12} />
                {m.label}
                {active && <span className="ml-auto text-[10px]">✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
const RANGE_OPTIONS = ["7D", "30D", "90D"];

export default function OverviewView({ profile }) {
  const [range, setRange] = useState("7D");
  const [animKey, setAnimKey] = useState(0);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const rangeDays = range === "7D" ? 7 : range === "30D" ? 30 : 90;

  useEffect(() => {
    let cancelled = false;
    setLoadingOrders(true);
    api
      .get("/vendor/orders")
      .then((res) => {
        if (!cancelled) setOrders(res.data?.data || []);
      })
      .catch(() => {
        if (!cancelled) setOrders([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingOrders(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredByRange = useMemo(() => {
    const cutoff = Date.now() - rangeDays * 86400000;
    return (orders || []).filter(
      (o) => new Date(o.createdAt).getTime() >= cutoff,
    );
  }, [orders, rangeDays]);

  const salesChartData = useMemo(
    () => buildSalesSeries(orders, rangeDays),
    [orders, rangeDays],
  );

  const pieData = useMemo(() => buildPieData(orders), [orders]);

  const totalRevenue = useMemo(
    () => filteredByRange.reduce((s, o) => s + (Number(o.subtotal) || 0), 0),
    [filteredByRange],
  );

  const totalOrders = filteredByRange.length;

  const uniqueCustomers = useMemo(() => {
    const set = new Set(
      filteredByRange.map((o) => String(o.customerId || "")),
    );
    set.delete("");
    return set.size;
  }, [filteredByRange]);

  const handleRange = (r) => {
    setRange(r);
    setAnimKey((k) => k + 1);
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      setOrders((prev) =>
        prev.map((o) =>
          String(o._id) === String(orderId) ? { ...o, status: newStatus } : o,
        ),
      );
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1
            className="text-2xl font-bold text-white"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Overview
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            {profile?.shopName} ·{" "}
            {new Date().toLocaleDateString("en-PK", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
        </div>
        <div className="flex bg-[#161616] border border-white/[0.07] rounded-xl overflow-hidden">
          {RANGE_OPTIONS.map((r) => (
            <button
              key={r}
              onClick={() => handleRange(r)}
              className={`px-4 py-2 text-xs font-semibold transition-all ${r === range ? "bg-orange-500/20 text-orange-400" : "text-gray-600 hover:text-gray-400"}`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Total revenue"
          value={`₨${totalRevenue.toLocaleString()}`}
          sub={`Last ${range}`}
          icon={TrendingUp}
          iconColor="bg-orange-500/15 text-orange-400"
        />
        <StatCard
          label="Total orders"
          value={loadingOrders ? "…" : String(totalOrders)}
          sub={`Last ${range}`}
          icon={ShoppingBag}
          iconColor="bg-sky-500/15 text-sky-400"
        />
        <StatCard
          label="Avg. rating"
          value="—"
          sub="Reviews coming soon"
          icon={Star}
          iconColor="bg-yellow-500/15 text-yellow-400"
        />
        <StatCard
          label="Customers"
          value={loadingOrders ? "…" : String(uniqueCustomers)}
          sub={`Unique in last ${range}`}
          icon={Users}
          iconColor="bg-emerald-500/15 text-emerald-400"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Line chart */}
        <div className="xl:col-span-2 bg-[#161616] border border-white/[0.06] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-white font-semibold text-sm">Sales Overview</p>
              <p className="text-gray-600 text-xs mt-0.5">
                Revenue & orders — last {range}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-orange-500 rounded-full inline-block" />
                <span className="text-gray-600 text-[11px]">Revenue</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-sky-500 rounded-full inline-block" />
                <span className="text-gray-600 text-[11px]">Orders</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220} key={animKey}>
            <LineChart
              data={salesChartData}
              margin={{ top: 4, right: 4, bottom: 0, left: -20 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.04)"
              />
              <XAxis
                dataKey="day"
                tick={{ fill: "#4b4b4b", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#4b4b4b", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `₨${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                content={<LineTooltip />}
                cursor={{ stroke: "rgba(255,255,255,0.06)" }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#f97316"
                strokeWidth={2.5}
                dot={false}
                activeDot={{
                  r: 5,
                  fill: "#f97316",
                  stroke: "#1e1e1e",
                  strokeWidth: 2,
                }}
              />
              <Line
                type="monotone"
                dataKey="orders"
                stroke="#38bdf8"
                strokeWidth={2}
                dot={false}
                activeDot={{
                  r: 4,
                  fill: "#38bdf8",
                  stroke: "#1e1e1e",
                  strokeWidth: 2,
                }}
                strokeDasharray="5 3"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div className="bg-[#161616] border border-white/[0.06] rounded-2xl p-6 flex flex-col">
          <div className="mb-4">
            <p className="text-white font-semibold text-sm">Order Status</p>
            <p className="text-gray-600 text-xs mt-0.5">
              Distribution this week
            </p>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center gap-6">
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={72}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} opacity={0.9} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <PieLegend data={pieData} />
          </div>
        </div>
      </div>

      {/* Recent orders — with status dropdown ── FIXED ─────────────────────── */}
      <div className="bg-[#161616] border border-white/[0.06] rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/[0.05] flex items-center justify-between">
          <p className="text-white font-semibold text-sm">Recent Orders</p>
          <p className="text-gray-600 text-xs">Click status to update</p>
        </div>

        {/* Table header */}
        <div className="grid grid-cols-[2fr_1fr_1fr_auto] gap-4 px-6 py-2.5 border-b border-white/[0.04]">
          {["Order / customer", "Amount", "Status", ""].map((h, i) => (
            <p
              key={i}
              className="text-[10px] uppercase tracking-widest text-gray-700 font-semibold"
            >
              {h}
            </p>
          ))}
        </div>

        <div className="divide-y divide-white/[0.04]">
          {loadingOrders && (
            <p className="px-6 py-8 text-center text-gray-600 text-sm">
              Loading orders…
            </p>
          )}
          {!loadingOrders && orders.length === 0 && (
            <p className="px-6 py-8 text-center text-gray-600 text-sm">
              No orders yet. They will appear here when customers place them.
            </p>
          )}
          {!loadingOrders &&
            orders.map((order) => {
              const first = order.items?.[0];
              const label = first?.dishName || "Order";
              const oid = String(order._id).slice(-8).toUpperCase();
              return (
                <div key={order._id} className="hover:bg-white/[0.015] transition-colors">
                  <div className="grid grid-cols-[2fr_1fr_1fr_auto] gap-4 px-6 py-3.5 items-center">
                    <div>
                      <p className="text-gray-200 text-sm font-medium">
                        {label}
                        {(order.items?.length || 0) > 1 && (
                          <span className="text-gray-600 font-normal">
                            {" "}
                            +{order.items.length - 1}
                          </span>
                        )}
                      </p>
                      <p className="text-gray-600 text-xs">#{oid}</p>
                      <p className="text-gray-500 text-xs mt-1.5">
                        {order.customerName}
                        {order.customerEmail
                          ? ` · ${order.customerEmail}`
                          : ""}
                      </p>
                      {order.customerPhone ? (
                        <p className="text-gray-600 text-[11px] mt-0.5">
                          {order.customerPhone}
                        </p>
                      ) : null}
                    </div>
                    <p className="text-orange-400 text-sm font-bold">
                      ₨{(order.totalAmount ?? 0).toLocaleString()}
                    </p>
                    <div className="flex justify-start">
                      <StatusDropdown
                        orderId={order._id}
                        currentStatus={order.status}
                        onChange={updateOrderStatus}
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => setSelectedOrder(order)}
                        className="text-xs font-bold text-orange-400 hover:text-orange-300 px-3 py-1.5 rounded-lg border border-orange-500/25 hover:bg-orange-500/10 transition-colors whitespace-nowrap"
                      >
                        View details
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
}
