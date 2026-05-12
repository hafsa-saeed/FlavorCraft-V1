import { useState, useEffect, useCallback } from "react";
import api from "../../utils/api";
import { Send, Check, Loader2, MessageSquare } from "lucide-react";

const TOPICS = [
  { value: "order_issue", label: "Order / delivery issue" },
  { value: "payout", label: "Payouts & earnings" },
  { value: "account", label: "Account & verification" },
  { value: "policy", label: "Policy / compliance question" },
  { value: "other", label: "Other" },
];

export default function VendorContactAdminView() {
  const [subject, setSubject] = useState("order_issue");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadTickets = useCallback(() => {
    setLoading(true);
    api
      .get("/vendor/support-tickets")
      .then((r) => setTickets(r.data.tickets || []))
      .catch(() => setTickets([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSending(true);
    setSent(false);
    try {
      const label =
        TOPICS.find((t) => t.value === subject)?.label || subject;
      await api.post("/vendor/support", {
        subject: label,
        message: message.trim(),
      });
      setMessage("");
      setSent(true);
      loadTickets();
    } catch (err) {
      window.alert(
        err.response?.data?.message ||
          err.message ||
          "Could not send message.",
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1
            className="text-2xl font-bold text-white mb-1"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Contact FlavorCraft admin
          </h1>
          <p className="text-gray-500 text-sm">
            Report platform issues, payout questions, or policy concerns. Our
            admin team reads every ticket and updates status here.
          </p>
        </div>

        <div className="bg-[#161616] border border-white/[0.06] rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare size={16} className="text-orange-400" />
            <h2 className="text-white font-semibold text-sm">New message</h2>
          </div>
          {sent && (
            <div className="mb-4 flex items-center gap-2 text-emerald-400 text-sm">
              <Check size={16} /> Message sent. Check updates below.
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-600 mb-2">
                Topic
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-[#0d0d0d] border border-white/[0.07] text-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-500/50"
              >
                {TOPICS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-600 mb-2">
                Message
              </label>
              <textarea
                required
                rows={6}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your issue clearly (order IDs, dates, screenshots links, etc.)."
                className="w-full bg-[#0d0d0d] border border-white/[0.07] text-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-500/50 resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={sending}
              className="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2"
            >
              {sending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={14} />
              )}
              Send to admin
            </button>
          </form>
        </div>

        <div className="bg-[#161616] border border-white/[0.06] rounded-2xl p-6">
          <h2 className="text-white font-semibold text-sm mb-4">
            Your tickets
          </h2>
          {loading ? (
            <p className="text-gray-500 text-sm">Loading…</p>
          ) : tickets.length === 0 ? (
            <p className="text-gray-500 text-sm">No messages yet.</p>
          ) : (
            <ul className="space-y-3">
              {tickets.map((t) => (
                <li
                  key={t._id}
                  className="border border-white/[0.06] rounded-xl p-4 bg-[#0f0f0f]"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-orange-400 text-xs font-bold uppercase">
                      {t.status?.replace(/_/g, " ")}
                    </span>
                    <span className="text-gray-600 text-[10px]">
                      {new Date(t.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm font-medium mb-1">
                    {t.subject || "Message"}
                  </p>
                  <p className="text-gray-500 text-xs whitespace-pre-wrap">
                    {t.message}
                  </p>
                  {t.adminNote ? (
                    <div className="mt-3 pt-3 border-t border-white/[0.06]">
                      <p className="text-[10px] text-emerald-500/90 font-bold uppercase mb-1">
                        Admin update
                      </p>
                      <p className="text-gray-300 text-xs whitespace-pre-wrap">
                        {t.adminNote}
                      </p>
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
