import { useState, useEffect, useCallback } from "react";
import api from "../utils/api";
import { AdminLayout } from "./AdminOverviewPage";

const STATUSES = ["received", "in_progress", "resolved", "closed"];

export default function AdminSupportPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [adminNote, setAdminNote] = useState("");
  const [status, setStatus] = useState("received");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    api
      .get("/admin/contact-messages?limit=200")
      .then((r) => setMessages(r.data.messages || []))
      .catch(() => setMessages([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!selected) return;
    setAdminNote(selected.adminNote || "");
    setStatus(selected.status || "received");
  }, [selected]);

  const save = async () => {
    if (!selected?._id) return;
    setErr("");
    setSaving(true);
    try {
      await api.patch(`/admin/contact-messages/${selected._id}`, {
        status,
        adminNote: adminNote.trim(),
        read: true,
      });
      await load();
      const updated = (await api.get("/admin/contact-messages?limit=200")).data
        .messages;
      const row = updated?.find((m) => m._id === selected._id);
      setSelected(row || null);
    } catch (e) {
      setErr(
        e.response?.data?.message || e.message || "Could not save changes.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1
            className="text-2xl font-bold text-white"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Support inbox
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Customer & vendor messages and complaints. Update status and add an
            internal reply note (visible to them on their ticket list).
          </p>
        </div>

        {err && (
          <p className="text-red-400 text-sm mb-4">{err}</p>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6">
          <div className="bg-[#141414] border border-white/5 rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-white/5 text-gray-400 text-xs font-semibold uppercase tracking-wider">
              All messages ({messages.length})
            </div>
            {loading ? (
              <div className="p-8 text-gray-500 text-sm">Loading…</div>
            ) : (
              <div className="max-h-[70vh] overflow-y-auto divide-y divide-white/[0.06]">
                {messages.map((m) => (
                  <button
                    key={m._id}
                    type="button"
                    onClick={() => setSelected(m)}
                    className={`w-full text-left px-4 py-3 transition-colors hover:bg-white/[0.03] ${
                      selected?._id === m._id ? "bg-[#FF8C00]/10" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-white text-sm font-semibold truncate">
                        {m.name}
                      </span>
                      <span
                        className={`text-[10px] uppercase font-bold shrink-0 px-2 py-0.5 rounded ${
                          m.fromRole === "vendor"
                            ? "bg-violet-500/15 text-violet-300"
                            : m.fromRole === "customer"
                              ? "bg-sky-500/15 text-sky-300"
                              : "bg-gray-500/15 text-gray-400"
                        }`}
                      >
                        {m.fromRole || "guest"}
                      </span>
                    </div>
                    <p className="text-gray-500 text-xs truncate">{m.subject || "(no subject)"}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-gray-600">
                        {m.status} · {new Date(m.createdAt).toLocaleString()}
                      </span>
                      {!m.read && (
                        <span className="text-[10px] text-amber-400 font-bold">
                          New
                        </span>
                      )}
                    </div>
                  </button>
                ))}
                {!messages.length && (
                  <p className="p-8 text-gray-500 text-sm">No messages yet.</p>
                )}
              </div>
            )}
          </div>

          <div className="bg-[#141414] border border-white/5 rounded-2xl p-5 space-y-4">
            {!selected ? (
              <p className="text-gray-500 text-sm">
                Select a message to review and update status.
              </p>
            ) : (
              <>
                <div>
                  <p className="text-gray-500 text-[10px] uppercase font-bold mb-1">
                    From
                  </p>
                  <p className="text-white font-semibold">{selected.name}</p>
                  <p className="text-gray-400 text-sm">{selected.email}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-[10px] uppercase font-bold mb-1">
                    Subject
                  </p>
                  <p className="text-gray-200 text-sm">{selected.subject || "—"}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-[10px] uppercase font-bold mb-1">
                    Message
                  </p>
                  <p className="text-gray-300 text-sm whitespace-pre-wrap max-h-40 overflow-y-auto">
                    {selected.message}
                  </p>
                </div>
                <div>
                  <label className="text-gray-500 text-[10px] uppercase font-bold block mb-2">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-[#0f0f0f] border border-white/10 text-gray-200 rounded-lg px-3 py-2 text-sm"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-gray-500 text-[10px] uppercase font-bold block mb-2">
                    Admin note (shown to customer / vendor on their tickets)
                  </label>
                  <textarea
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    rows={5}
                    placeholder="e.g. We are reviewing your order issue and will update you within 24 hours."
                    className="w-full bg-[#0f0f0f] border border-white/10 text-gray-200 rounded-lg px-3 py-2 text-sm resize-none"
                  />
                </div>
                <button
                  type="button"
                  disabled={saving}
                  onClick={save}
                  className="w-full py-2.5 bg-[#FF8C00] hover:bg-orange-600 disabled:opacity-50 text-white font-bold rounded-lg text-sm"
                >
                  {saving ? "Saving…" : "Save update"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
