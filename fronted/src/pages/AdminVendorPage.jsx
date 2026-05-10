import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/api";
import { AdminLayout } from "./AdminOverviewPage";

// ── Constants ─────────────────────────────────────────────────────────────────
const SCALE_MAP = {
  home_chef: "Home Chef",
  small_kitchen: "Small Kitchen",
  medium_kitchen: "Medium Kitchen",
  professional: "Professional",
};

const STATUS_META = {
  pending: {
    label: "Pending",
    dot: "bg-amber-400",
    badge: "bg-amber-500/10 text-amber-400 border-amber-500/25",
  },
  approved: {
    label: "Approved",
    dot: "bg-emerald-400",
    badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25",
  },
  rejected: {
    label: "Rejected",
    dot: "bg-red-400",
    badge: "bg-red-500/10 text-red-400 border-red-500/25",
  },
};

// ── Reusable Avatar ───────────────────────────────────────────────────────────
function Avatar({ name, image, size = 10 }) {
  const initials = name ? name.slice(0, 2).toUpperCase() : "?";
  if (image) {
    return (
      <img
        src={image}
        alt={name}
        className={`w-${size} h-${size} rounded-full object-cover ring-2 ring-white/10`}
      />
    );
  }
  return (
    <div
      className={`w-${size} h-${size} rounded-full bg-[#FF8C00]/20 border border-[#FF8C00]/30 flex items-center justify-center text-[#FF8C00] font-bold text-xs shrink-0`}
    >
      {initials}
    </div>
  );
}

// ── Reject Modal ──────────────────────────────────────────────────────────────
function RejectModal({ vendor, onConfirm, onClose, loading }) {
  const [reason, setReason] = useState("");
  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-start gap-3 mb-5">
          <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center shrink-0 mt-0.5">
            <span className="text-red-400 text-lg">✕</span>
          </div>
          <div>
            <h3
              className="text-white font-semibold text-lg"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Reject Application
            </h3>
            <p className="text-gray-500 text-sm mt-0.5">
              Rejecting{" "}
              <span className="text-gray-300">
                {vendor?.vendorApplication?.kitchenName || vendor?.email}
              </span>
            </p>
          </div>
        </div>

        <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
          Reason for rejection <span className="text-gray-600">(optional)</span>
        </label>
        <textarea
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. Incomplete CNIC information, insufficient business details..."
          className="w-full bg-[#111] border border-white/10 text-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-500/50 transition-colors resize-none placeholder-gray-700 mb-5"
        />

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-gray-400 rounded-xl text-sm font-medium transition-colors border border-white/10"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(reason)}
            disabled={loading}
            className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-colors"
          >
            {loading ? "Rejecting..." : "Confirm Reject"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Detail Drawer ─────────────────────────────────────────────────────────────
function VendorDrawer({
  vendor,
  onClose,
  onApprove,
  onRejectClick,
  actionLoading,
}) {
  if (!vendor) return null;
  const app = vendor.vendorApplication || {};
  const meta = STATUS_META[vendor.status] || STATUS_META.pending;

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-[#141414] border-l border-white/5 h-full overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-[#141414] border-b border-white/5 px-6 py-4 flex items-center justify-between z-10">
          <h2
            className="text-white font-semibold"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Application Detail
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors text-xl"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Identity */}
          <div className="flex items-center gap-4">
            <Avatar name={app.kitchenName || vendor.email} size={14} />
            <div>
              <p className="text-white font-semibold text-lg">
                {app.kitchenName || "—"}
              </p>
              <p className="text-gray-500 text-sm">{vendor.email}</p>
              <span
                className={`mt-1 inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-medium ${meta.badge}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                {meta.label}
              </span>
            </div>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "City", value: app.city },
              { label: "CNIC / ID", value: app.cnic },
              { label: "Business Scale", value: SCALE_MAP[app.businessScale] },
              {
                label: "Applied",
                value: app.submittedAt
                  ? new Date(app.submittedAt).toLocaleDateString("en-PK", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "—",
              },
            ].map((d) => (
              <div
                key={d.label}
                className="bg-[#1a1a1a] rounded-xl p-3 border border-white/5"
              >
                <p className="text-[10px] uppercase tracking-wider text-gray-600 mb-1">
                  {d.label}
                </p>
                <p className="text-gray-200 text-sm font-medium">
                  {d.value || "—"}
                </p>
              </div>
            ))}
          </div>

          {/* Business motive */}
          {app.businessMotive && (
            <div className="bg-[#1a1a1a] rounded-xl p-4 border border-white/5">
              <p className="text-[10px] uppercase tracking-wider text-gray-600 mb-2">
                Business Motive
              </p>
              <p className="text-gray-300 text-sm leading-relaxed">
                {app.businessMotive}
              </p>
            </div>
          )}

          {/* Admin note */}
          {vendor.adminNote && (
            <div className="bg-red-500/5 rounded-xl p-4 border border-red-500/15">
              <p className="text-[10px] uppercase tracking-wider text-red-500/70 mb-2">
                Admin Note
              </p>
              <p className="text-gray-400 text-sm">{vendor.adminNote}</p>
            </div>
          )}

          {/* Actions */}
          {vendor.status === "pending" && (
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => onApprove(vendor._id)}
                disabled={actionLoading}
                className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-colors"
              >
                {actionLoading === vendor._id + "_approve"
                  ? "Approving..."
                  : "✓ Approve"}
              </button>
              <button
                onClick={() => onRejectClick(vendor)}
                disabled={actionLoading}
                className="flex-1 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/25 font-semibold rounded-xl text-sm transition-colors"
              >
                ✕ Reject
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminVendorPage() {
  const { status = "pending" } = useParams();
  const navigate = useNavigate();

  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  // Drawer + modal state
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);

  const fetchVendors = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ status });
      if (search.trim()) params.set("search", search.trim());
      const res = await api.get(`/admin/vendors?${params}`);
      setVendors(res.data.vendors);
    } finally {
      setLoading(false);
    }
  }, [status, search]);

  useEffect(() => {
    const timer = setTimeout(fetchVendors, 300); // debounce search
    return () => clearTimeout(timer);
  }, [fetchVendors]);

  const handleApprove = async (id) => {
    setActionLoading(id + "_approve");
    try {
      await api.patch(`/admin/vendors/${id}/approve`);
      setSelectedVendor(null);
      fetchVendors();
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (reason) => {
    if (!rejectTarget) return;
    setActionLoading(rejectTarget._id + "_reject");
    try {
      await api.patch(`/admin/vendors/${rejectTarget._id}/reject`, { reason });
      setRejectTarget(null);
      setSelectedVendor(null);
      fetchVendors();
    } finally {
      setActionLoading(null);
    }
  };

  const PAGE_TITLE = {
    pending: "Pending Applications",
    approved: "Approved Vendors",
    rejected: "Rejected Vendors",
  };
  const meta = STATUS_META[status] || STATUS_META.pending;

  return (
    <AdminLayout>
      <div className="p-8">
        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1
              className="text-2xl font-bold text-white"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {PAGE_TITLE[status]}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {vendors.length} vendor{vendors.length !== 1 ? "s" : ""} found
            </p>
          </div>

          {/* Search */}
          <div className="relative w-72">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
              ⌕
            </span>
            <input
              type="text"
              placeholder="Search by name, email, city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-white/10 text-gray-300 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#FF8C00]/50 transition-colors placeholder-gray-600"
            />
          </div>
        </div>

        {/* Status tabs */}
        <div className="flex gap-2 mb-6">
          {["pending", "approved", "rejected"].map((s) => {
            const m = STATUS_META[s];
            return (
              <button
                key={s}
                onClick={() => navigate(`/admin/vendors/${s}`)}
                className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all border flex items-center gap-2 ${
                  status === s
                    ? m.badge
                    : "bg-transparent text-gray-500 border-white/10 hover:border-white/20"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />
                {m.label}
              </button>
            );
          })}
        </div>

        {/* Table */}
        <div className="bg-[#141414] border border-white/5 rounded-2xl overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_auto] gap-4 px-6 py-3 border-b border-white/5">
            {[
              "Kitchen / Email",
              "Location & Scale",
              "Applied",
              "Status",
              "",
            ].map((h) => (
              <p
                key={h}
                className="text-[10px] uppercase tracking-wider text-gray-600 font-medium"
              >
                {h}
              </p>
            ))}
          </div>

          {/* Rows */}
          {loading ? (
            <div className="divide-y divide-white/5">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="grid grid-cols-[2fr_1.5fr_1fr_1fr_auto] gap-4 px-6 py-4 animate-pulse"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-white/5" />
                    <div className="space-y-1.5">
                      <div className="h-3 w-28 bg-white/5 rounded" />
                      <div className="h-2.5 w-36 bg-white/5 rounded" />
                    </div>
                  </div>
                  {[...Array(3)].map((_, j) => (
                    <div
                      key={j}
                      className="h-3 bg-white/5 rounded self-center"
                    />
                  ))}
                  <div className="h-7 w-16 bg-white/5 rounded-lg self-center" />
                </div>
              ))}
            </div>
          ) : vendors.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-4xl mb-3">🍽️</p>
              <p className="text-gray-500">No {status} vendors found.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {vendors.map((v) => {
                const app = v.vendorApplication || {};
                const vm = STATUS_META[v.status] || meta;
                return (
                  <div
                    key={v._id}
                    className="grid grid-cols-[2fr_1.5fr_1fr_1fr_auto] gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors cursor-pointer items-center"
                    onClick={() => setSelectedVendor(v)}
                  >
                    {/* Col 1 — identity */}
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar name={app.kitchenName || v.email} size={9} />
                      <div className="min-w-0">
                        <p className="text-gray-200 text-sm font-medium truncate">
                          {app.kitchenName || "—"}
                        </p>
                        <p className="text-gray-600 text-xs truncate">
                          {v.email}
                        </p>
                      </div>
                    </div>

                    {/* Col 2 — location / scale */}
                    <div>
                      <p className="text-gray-300 text-sm">{app.city || "—"}</p>
                      <p className="text-gray-600 text-xs">
                        {SCALE_MAP[app.businessScale] || "—"}
                      </p>
                    </div>

                    {/* Col 3 — applied date */}
                    <p className="text-gray-500 text-xs">
                      {app.submittedAt
                        ? new Date(app.submittedAt).toLocaleDateString(
                            "en-PK",
                            { day: "numeric", month: "short" },
                          )
                        : "—"}
                    </p>

                    {/* Col 4 — status badge */}
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-medium w-fit ${vm.badge}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${vm.dot}`} />
                      {vm.label}
                    </span>

                    {/* Col 5 — action buttons (pending only) */}
                    <div
                      className="flex items-center gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {v.status === "pending" ? (
                        <>
                          <button
                            onClick={() => handleApprove(v._id)}
                            disabled={!!actionLoading}
                            className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                          >
                            {actionLoading === v._id + "_approve"
                              ? "..."
                              : "Approve"}
                          </button>
                          <button
                            onClick={() => setRejectTarget(v)}
                            disabled={!!actionLoading}
                            className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setSelectedVendor(v)}
                          className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-400 border border-white/10 rounded-lg text-xs font-medium transition-colors"
                        >
                          View
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Detail Drawer */}
      <VendorDrawer
        vendor={selectedVendor}
        onClose={() => setSelectedVendor(null)}
        onApprove={handleApprove}
        onRejectClick={(v) => {
          setRejectTarget(v);
          setSelectedVendor(null);
        }}
        actionLoading={actionLoading}
      />

      {/* Reject Modal */}
      {rejectTarget && (
        <RejectModal
          vendor={rejectTarget}
          onConfirm={handleReject}
          onClose={() => setRejectTarget(null)}
          loading={!!actionLoading}
        />
      )}
    </AdminLayout>
  );
}
