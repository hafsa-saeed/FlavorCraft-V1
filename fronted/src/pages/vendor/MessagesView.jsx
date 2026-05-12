import { useState, useEffect, useCallback, useMemo } from "react";
import { MessageSquare, Send, Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";

export default function MessagesView() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [partnerId, setPartnerId] = useState("");
  const [thread, setThread] = useState([]);
  const [draft, setDraft] = useState("");
  const [loadingList, setLoadingList] = useState(true);
  const [loadingThread, setLoadingThread] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoadingList(true);
    api
      .get("/vendor/orders")
      .then((res) => {
        if (cancelled) return;
        setOrders(res.data?.data || []);
      })
      .catch(() => {
        if (!cancelled) setOrders([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingList(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const customers = useMemo(() => {
    const m = new Map();
    (orders || []).forEach((o) => {
      const id = o.customerId ? String(o.customerId) : "";
      if (!id || m.has(id)) return;
      m.set(id, { id, name: o.customerName || "Customer" });
    });
    return [...m.values()];
  }, [orders]);

  const loadThread = useCallback(async (pid) => {
    if (!pid) return;
    setLoadingThread(true);
    try {
      const res = await api.get(`/messages/conversation/${pid}`);
      setThread(res.data?.data || []);
    } catch {
      setThread([]);
    } finally {
      setLoadingThread(false);
    }
  }, []);

  useEffect(() => {
    if (!partnerId && customers.length) {
      setPartnerId(customers[0].id);
      return;
    }
    if (!partnerId) return;
    loadThread(partnerId);
    const t = setInterval(() => loadThread(partnerId), 15000);
    return () => clearInterval(t);
  }, [partnerId, customers, loadThread]);

  const send = async () => {
    if (!partnerId || !draft.trim()) return;
    setSending(true);
    try {
      await api.post("/messages", { to: partnerId, body: draft.trim() });
      setDraft("");
      await loadThread(partnerId);
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-8 h-full flex flex-col min-h-0" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="mb-6">
        <h1
          className="text-2xl font-bold text-white flex items-center gap-2"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          <MessageSquare className="text-orange-400" size={22} />
          Messages
        </h1>
        <p className="text-gray-600 text-sm mt-1">
          Chat with customers who have ordered from you.
        </p>
      </div>

      <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-4 rounded-2xl border border-white/[0.06] bg-[#161616] overflow-hidden">
        <aside className="w-full lg:w-56 border-b lg:border-b-0 lg:border-r border-white/[0.06] p-3 overflow-y-auto max-h-44 lg:max-h-none">
          <p className="text-[10px] uppercase tracking-widest text-gray-600 font-bold px-2 mb-2">
            Customers
          </p>
          {loadingList && (
            <div className="flex justify-center py-6">
              <Loader2 className="animate-spin text-orange-400" size={22} />
            </div>
          )}
          {!loadingList && customers.length === 0 && (
            <p className="text-gray-600 text-xs px-2 py-4">
              No customer threads yet. Incoming orders will appear here.
            </p>
          )}
          {!loadingList &&
            customers.map((c) => (
              <button
                type="button"
                key={c.id}
                onClick={() => setPartnerId(c.id)}
                className={`w-full text-left px-3 py-2 rounded-xl text-sm mb-1 transition-colors ${
                  partnerId === c.id
                    ? "bg-orange-500/15 text-orange-400 border border-orange-500/25"
                    : "text-gray-400 hover:bg-white/[0.04] border border-transparent"
                }`}
              >
                {c.name}
              </button>
            ))}
        </aside>

        <div className="flex-1 flex flex-col min-h-[360px]">
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loadingThread && (
              <p className="text-center text-gray-600 text-sm py-10">Loading…</p>
            )}
            {!loadingThread &&
              thread.map((m) => {
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
            {!loadingThread && partnerId && thread.length === 0 && (
              <p className="text-center text-gray-600 text-sm py-10">
                No messages yet.
              </p>
            )}
          </div>
          <div className="p-3 border-t border-white/[0.06] flex gap-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              disabled={!partnerId || sending}
              placeholder="Reply…"
              className="flex-1 bg-[#111] border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/35"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
            />
            <button
              type="button"
              disabled={!partnerId || sending || !draft.trim()}
              onClick={send}
              className="px-4 py-2 rounded-xl bg-orange-500 text-white disabled:opacity-40 flex items-center gap-2 text-sm font-bold"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
