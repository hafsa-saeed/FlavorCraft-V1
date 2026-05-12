import { useState, useEffect } from "react";
import { AdminLayout } from "./AdminOverviewPage";
import api from "../utils/api";

export default function AdminSiteContactPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    contactEmail: "",
    contactPhone: "",
    contactPhoneHref: "",
    officeAddress: "",
    officeHours: "",
    responseNote: "",
  });

  useEffect(() => {
    api
      .get("/public/site-settings")
      .then((r) => {
        const s = r.data?.settings;
        if (!s) return;
        setForm({
          contactEmail: s.contactEmail || "",
          contactPhone: s.contactPhone || "",
          contactPhoneHref: s.contactPhoneHref || "",
          officeAddress: s.officeAddress || "",
          officeHours: s.officeHours || "",
          responseNote: s.responseNote || "",
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch("/admin/site-settings", form);
      window.alert("Contact details updated. They appear on the Contact page for everyone.");
    } catch (err) {
      window.alert(
        err.response?.data?.message || err.message || "Could not save.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-8 max-w-xl" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <h1
          className="text-white text-2xl font-bold mb-1"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Site contact
        </h1>
        <p className="text-gray-500 text-sm mb-8">
          Email, phone, address, and hours shown on the public Contact page.
        </p>

        {loading ? (
          <p className="text-gray-500 text-sm">Loading…</p>
        ) : (
          <form onSubmit={handleSave} className="space-y-4">
            {[
              ["contactEmail", "Email (display)", "email"],
              ["contactPhone", "Phone (display text)", "text"],
              ["contactPhoneHref", "Phone link (tel:…)", "text"],
              ["officeAddress", "Office address", "text"],
              ["officeHours", "Office hours", "text"],
              ["responseNote", "Response / footer note", "text"],
            ].map(([key, label, type]) => (
              <div key={key}>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-600 mb-2">
                  {label}
                </label>
                <input
                  type={type}
                  value={form[key]}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, [key]: e.target.value }))
                  }
                  className="w-full bg-[#141414] border border-white/[0.08] text-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#FF8C00]/50 transition-all"
                />
              </div>
            ))}
            <button
              type="submit"
              disabled={saving}
              className="mt-2 px-6 py-3 bg-[#FF8C00] hover:bg-[#e67e00] disabled:opacity-60 text-white font-bold rounded-xl text-sm transition-all"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </form>
        )}
      </div>
    </AdminLayout>
  );
}
