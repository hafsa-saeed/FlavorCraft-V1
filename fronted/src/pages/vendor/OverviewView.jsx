import { useState } from "react";
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

// ── Dummy data ────────────────────────────────────────────────────────────────
const SALES_DATA = [
  { day: "Mon", revenue: 4200, orders: 14 },
  { day: "Tue", revenue: 6100, orders: 21 },
  { day: "Wed", revenue: 5400, orders: 18 },
  { day: "Thu", revenue: 7800, orders: 26 },
  { day: "Fri", revenue: 9200, orders: 31 },
  { day: "Sat", revenue: 12500, orders: 42 },
  { day: "Sun", revenue: 11000, orders: 37 },
];

const ORDER_STATUS_DATA = [
  { name: "Delivered", value: 68, color: "#22c55e" },
  { name: "Preparing", value: 15, color: "#f97316" },
  { name: "Pending", value: 10, color: "#eab308" },
  { name: "Cancelled", value: 7, color: "#ef4444" },
];

const INITIAL_ORDERS = [
  { id: "#FC-1042", dish: "Chicken Karahi", amount: 850, status: "delivered" },
  {
    id: "#FC-1041",
    dish: "Deal: Family Feast",
    amount: 2200,
    status: "preparing",
  },
  { id: "#FC-1040", dish: "Beef Biryani", amount: 450, status: "pending" },
  { id: "#FC-1039", dish: "Zinger Burger", amount: 320, status: "delivered" },
  { id: "#FC-1038", dish: "2x Naan + Daal", amount: 380, status: "cancelled" },
];

const ALL_STATUSES = ["pending", "preparing", "delivered", "cancelled"];

const STATUS_META = {
  delivered: {
    icon: CheckCircle,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    label: "Delivered",
  },
  preparing: {
    icon: RefreshCw,
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    label: "Preparing",
  },
  pending: {
    icon: Clock,
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    label: "Pending",
  },
  cancelled: {
    icon: XCircle,
    color: "text-red-400",
    bg: "bg-red-500/10",
    label: "Cancelled",
  },
};

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
  const [orders, setOrders] = useState(INITIAL_ORDERS);

  const handleRange = (r) => {
    setRange(r);
    setAnimKey((k) => k + 1);
  };

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)),
    );
    // TODO: call API when real Order model exists
    // api.patch(`/orders/${orderId}/status`, { status: newStatus });
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
          label="Total Revenue"
          value="₨56,200"
          sub="This week"
          icon={TrendingUp}
          iconColor="bg-orange-500/15 text-orange-400"
          trend="up"
          trendValue="+18.4%"
        />
        <StatCard
          label="Total Orders"
          value="189"
          sub="This week"
          icon={ShoppingBag}
          iconColor="bg-sky-500/15 text-sky-400"
          trend="up"
          trendValue="+7.2%"
        />
        <StatCard
          label="Avg. Rating"
          value="4.8 ★"
          sub="64 reviews"
          icon={Star}
          iconColor="bg-yellow-500/15 text-yellow-400"
          trend="up"
          trendValue="+0.2"
        />
        <StatCard
          label="Customers"
          value="143"
          sub="This month"
          icon={Users}
          iconColor="bg-emerald-500/15 text-emerald-400"
          trend="down"
          trendValue="-3.1%"
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
              data={SALES_DATA}
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
                  data={ORDER_STATUS_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={72}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {ORDER_STATUS_DATA.map((entry, i) => (
                    <Cell key={i} fill={entry.color} opacity={0.9} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <PieLegend data={ORDER_STATUS_DATA} />
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
        <div className="grid grid-cols-[2fr_1fr_1fr] gap-4 px-6 py-2.5 border-b border-white/[0.04]">
          {["Order / Dish", "Amount", "Status"].map((h) => (
            <p
              key={h}
              className="text-[10px] uppercase tracking-widest text-gray-700 font-semibold"
            >
              {h}
            </p>
          ))}
        </div>

        <div className="divide-y divide-white/[0.04]">
          {orders.map((order) => (
            <div
              key={order.id}
              className="grid grid-cols-[2fr_1fr_1fr] gap-4 px-6 py-3.5 items-center hover:bg-white/[0.015] transition-colors"
            >
              <div>
                <p className="text-gray-200 text-sm font-medium">
                  {order.dish}
                </p>
                <p className="text-gray-600 text-xs">{order.id}</p>
              </div>
              <p className="text-orange-400 text-sm font-bold">
                ₨{order.amount.toLocaleString()}
              </p>
              <div className="flex justify-start">
                <StatusDropdown
                  orderId={order.id}
                  currentStatus={order.status}
                  onChange={updateOrderStatus}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
