import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import {
  MapPin,
  Mail,
  Phone,
  Send,
  Check,
  Heart,
  ChefHat,
  Shield,
  Users,
  Star,
  Flame,
  ArrowRight,
} from "lucide-react";

// ── ABOUT US ──────────────────────────────────────────────────────────────────
export function AboutPage() {
  const stats = [
    {
      value: "500+",
      label: "Home Chefs",
      icon: ChefHat,
      color: "text-orange-400",
    },
    {
      value: "12K+",
      label: "Happy Customers",
      icon: Heart,
      color: "text-red-400",
    },
    { value: "35+", label: "Cities", icon: MapPin, color: "text-sky-400" },
    {
      value: "4.8★",
      label: "Avg. Rating",
      icon: Star,
      color: "text-yellow-400",
    },
  ];

  const values = [
    {
      icon: "🍽️",
      title: "Authenticity First",
      desc: "Every dish comes from real kitchens — home cooks and professional chefs who put love into every meal.",
    },
    {
      icon: "💙",
      title: "Health is Non-Negotiable",
      desc: "Diabetic-friendly, low-oil, high-protein — we built customization for people who can't compromise on their diet.",
    },
    {
      icon: "🤝",
      title: "Community Over Commerce",
      desc: "We empower home chefs to build businesses from their kitchens. Every order supports a real person's livelihood.",
    },
    {
      icon: "🔒",
      title: "Quality & Trust",
      desc: "Each vendor is manually vetted. Maximum 5 vendors per city to ensure quality never gets diluted.",
    },
  ];

  const team = [
    {
      name: "Chef Ayesha R.",
      role: "Home Chef Partner",
      city: "Lahore",
      specialty: "Desi & BBQ",
    },
    {
      name: "Bilal M.",
      role: "Home Chef Partner",
      city: "Karachi",
      specialty: "Biryani & Seafood",
    },
    {
      name: "Sana F.",
      role: "Home Chef Partner",
      city: "Islamabad",
      specialty: "Continental & Healthy",
    },
  ];

  return (
    <div
      className="min-h-screen bg-[#09090b]"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/[0.05]">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-orange-500 flex items-center justify-center">
            🔥
          </div>
          <span
            className="text-white font-black text-xl"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            FlavorCraft
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="text-gray-500 hover:text-gray-300 text-sm transition-colors"
          >
            Feed
          </Link>
          <Link
            to="/marketplace-rules"
            className="text-gray-500 hover:text-gray-300 text-sm transition-colors"
          >
            Rules
          </Link>
          <Link
            to="/contact"
            className="text-gray-500 hover:text-gray-300 text-sm transition-colors"
          >
            Contact
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_40%,rgba(249,115,22,0.12),transparent_60%)]" />
        <div className="max-w-4xl mx-auto px-6 py-20 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-orange-500/15 border border-orange-500/25 text-orange-400 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-6">
            <Flame size={11} /> Our Story
          </div>
          <h1
            className="text-4xl sm:text-6xl font-black text-white leading-tight mb-6"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Built for the food lover
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">
              who refuses to compromise.
            </span>
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed max-w-2xl mx-auto">
            FlavorCraft was born from a simple frustration: why can't you get
            restaurant-quality food that's actually made for <em>your</em> body,
            your taste, your health needs? We built the platform that makes it
            possible.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-4xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-20">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className="bg-[#111] border border-white/[0.06] rounded-2xl p-5 text-center"
              >
                <div
                  className={`w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center mx-auto mb-3`}
                >
                  <Icon size={18} className={s.color} />
                </div>
                <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-gray-600 text-xs mt-0.5">{s.label}</p>
              </div>
            );
          })}
        </div>

        {/* Story section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          <div>
            <h2
              className="text-2xl font-black text-white mb-4"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              From a home kitchen in Lahore to a nationwide platform.
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              Our founder's mother was a diabetic who struggled to find food
              that tasted amazing without spiking her blood sugar. Every
              restaurant either ignored her needs or served bland, uninspiring
              "diet food."
            </p>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              That's when we realized: the best cooks — the ones who truly
              understand how to balance nutrition and flavor — aren't in
              restaurants. They're in homes across Pakistan.
            </p>
            <p className="text-gray-400 text-sm leading-relaxed">
              FlavorCraft bridges these brilliant home chefs with customers who
              care about what they eat. Every dish is customizable. Every
              ingredient is transparent. Every meal is crafted with intention.
            </p>
          </div>
          <div className="space-y-3">
            {values.map((v) => (
              <div
                key={v.title}
                className="bg-[#111] border border-white/[0.06] rounded-xl p-4 flex items-start gap-4"
              >
                <span className="text-2xl">{v.icon}</span>
                <div>
                  <p className="text-white font-semibold text-sm">{v.title}</p>
                  <p className="text-gray-500 text-xs leading-relaxed mt-0.5">
                    {v.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Featured chefs */}
        <div className="mb-16">
          <h2
            className="text-2xl font-black text-white mb-6 text-center"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Meet Our Chef Partners
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {team.map((member) => (
              <div
                key={member.name}
                className="bg-[#111] border border-white/[0.06] rounded-2xl p-5 text-center"
              >
                <div className="w-14 h-14 rounded-full bg-orange-500/15 border border-orange-500/20 flex items-center justify-center mx-auto mb-3">
                  <ChefHat size={24} className="text-orange-400" />
                </div>
                <p className="text-white font-bold">{member.name}</p>
                <p className="text-orange-400 text-xs font-semibold">
                  {member.role}
                </p>
                <p className="text-gray-600 text-xs mt-1">
                  {member.city} · {member.specialty}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-gradient-to-br from-orange-500/10 to-transparent border border-orange-500/15 rounded-3xl p-10">
          <h2
            className="text-2xl font-black text-white mb-3"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Ready to taste the difference?
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            Join thousands of customers who've discovered food that's actually
            made for them.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-orange-500/20"
          >
            Browse the Feed <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── CONTACT US ────────────────────────────────────────────────────────────────
const SUBJECT_LABELS = {
  general: "General enquiry",
  order: "Order issue",
  vendor: "Vendor application",
  partnership: "Partnership",
  other: "Other",
};

export function ContactPage() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "general",
    message: "",
  });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [siteSettings, setSiteSettings] = useState(null);

  const isCustomer = user?.role === "customer";
  const isVendor = user?.role === "vendor";

  useEffect(() => {
    api
      .get("/public/site-settings")
      .then((r) => {
        if (r.data?.status === "success" && r.data.settings) {
          setSiteSettings(r.data.settings);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!user) return;
    if (isCustomer) {
      setForm((f) => ({
        ...f,
        name: user.name || f.name,
        email: user.email || f.email,
      }));
    }
    if (isVendor) {
      const shop = user.vendorProfile?.shopName || "";
      setForm((f) => ({
        ...f,
        name: shop || user.email?.split("@")[0] || f.name,
        email: user.email || f.email,
      }));
    }
  }, [user, isCustomer, isVendor]);

  const loadTickets = useCallback(() => {
    if (isCustomer) {
      api
        .get("/customer/support-tickets")
        .then((r) => setTickets(r.data.tickets || []))
        .catch(() => setTickets([]));
    } else if (isVendor) {
      api
        .get("/vendor/support-tickets")
        .then((r) => setTickets(r.data.tickets || []))
        .catch(() => setTickets([]));
    }
  }, [isCustomer, isVendor]);

  useEffect(() => {
    if (isCustomer || isVendor) loadTickets();
  }, [isCustomer, isVendor, loadTickets]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const subjectLabel =
        SUBJECT_LABELS[form.subject] || SUBJECT_LABELS.general;

      if (isCustomer) {
        await api.post("/customer/support", {
          subject: subjectLabel,
          message: form.message.trim(),
        });
      } else if (isVendor) {
        await api.post("/vendor/support", {
          subject: subjectLabel,
          message: form.message.trim(),
        });
      } else {
        await api.post("/public/contact", {
          name: form.name.trim(),
          email: form.email.trim(),
          subject: subjectLabel,
          message: form.message.trim(),
        });
      }
      setSent(true);
      setForm((f) => ({ ...f, message: "" }));
      loadTickets();
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Could not send your message.";
      window.alert(msg);
    } finally {
      setLoading(false);
    }
  };

  const info = [
    {
      icon: Mail,
      label: "Email",
      value: siteSettings?.contactEmail || "hello@flavorcraft.pk",
      href: `mailto:${siteSettings?.contactEmail || "hello@flavorcraft.pk"}`,
    },
    {
      icon: Phone,
      label: "Phone",
      value: siteSettings?.contactPhone || "+92 300 FLAVOR (352867)",
      href: siteSettings?.contactPhoneHref || "tel:+923003528676",
    },
    {
      icon: MapPin,
      label: "Office",
      value: siteSettings?.officeAddress || "Gulberg III, Lahore, Pakistan",
      href: "#",
    },
  ];

  return (
    <div
      className="min-h-screen bg-[#09090b]"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/[0.05]">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-orange-500 flex items-center justify-center">
            🔥
          </div>
          <span
            className="text-white font-black text-xl"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            FlavorCraft
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <Link
            to="/about"
            className="text-gray-500 hover:text-gray-300 text-sm transition-colors"
          >
            About Us
          </Link>
          <Link
            to="/marketplace-rules"
            className="text-gray-500 hover:text-gray-300 text-sm transition-colors"
          >
            Marketplace rules
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-14">
          <h1
            className="text-4xl font-black text-white mb-3"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Get in Touch
          </h1>
          <p className="text-gray-500 text-base max-w-md mx-auto">
            Questions about orders, vendor applications, or partnerships? We'd
            love to hear from you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
          {/* Form */}
          <div className="bg-[#111] border border-white/[0.06] rounded-2xl p-7">
            {sent ? (
              <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center mb-4">
                  <Check size={28} className="text-emerald-400" />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">
                  Message Sent!
                </h3>
                <p className="text-gray-500 text-sm mb-5">
                  {isCustomer || isVendor
                    ? "Our admin team will review your ticket. Status updates appear below."
                    : "We'll get back to you within 24 hours."}
                </p>
                <button
                  onClick={() => {
                    setSent(false);
                    setForm((f) => ({
                      ...f,
                      subject: "general",
                      message: "",
                    }));
                  }}
                  className="text-orange-400 text-sm hover:text-orange-300 transition-colors"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-600 mb-2">
                      Name
                    </label>
                    <input
                      required={!isCustomer && !isVendor}
                      readOnly={isCustomer || isVendor}
                      value={form.name}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, name: e.target.value }))
                      }
                      placeholder="Your full name"
                      className="w-full bg-[#0d0d0d] border border-white/[0.07] text-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-500/50 transition-all placeholder-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-600 mb-2">
                      Email
                    </label>
                    <input
                      required={!isCustomer && !isVendor}
                      readOnly={isCustomer || isVendor}
                      type="email"
                      value={form.email}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, email: e.target.value }))
                      }
                      placeholder="you@example.com"
                      className="w-full bg-[#0d0d0d] border border-white/[0.07] text-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-500/50 transition-all placeholder-gray-700"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-600 mb-2">
                    Subject
                  </label>
                  <select
                    value={form.subject}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, subject: e.target.value }))
                    }
                    className="w-full bg-[#0d0d0d] border border-white/[0.07] text-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-500/50 transition-all appearance-none"
                  >
                    <option value="general">General enquiry</option>
                    <option value="order">Order issue</option>
                    <option value="vendor">Vendor application</option>
                    <option value="partnership">Partnership</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-600 mb-2">
                    Message
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, message: e.target.value }))
                    }
                    placeholder="Tell us what's on your mind..."
                    className="w-full bg-[#0d0d0d] border border-white/[0.07] text-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-500/50 transition-all resize-none placeholder-gray-700"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{" "}
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={14} /> Send Message
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Info + Map placeholder */}
          <div className="space-y-4">
            {info.map(({ icon: Icon, label, value, href }) => (
              <a
                key={label}
                href={href}
                className="flex items-center gap-4 bg-[#111] border border-white/[0.06] rounded-2xl p-4 hover:border-orange-500/20 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-orange-500/15 flex items-center justify-center shrink-0">
                  <Icon size={17} className="text-orange-400" />
                </div>
                <div>
                  <p className="text-gray-600 text-xs uppercase tracking-wider mb-0.5">
                    {label}
                  </p>
                  <p className="text-gray-200 text-sm font-medium group-hover:text-orange-300 transition-colors">
                    {value}
                  </p>
                </div>
              </a>
            ))}

            {/* Map visual */}
            <div className="bg-[#111] border border-white/[0.06] rounded-2xl overflow-hidden">
              <div className="h-40 bg-gradient-to-br from-[#1a1a1a] to-[#111] flex items-center justify-center relative">
                <div
                  className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 1px,transparent 40px),repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 1px,transparent 40px)",
                  }}
                />
                <div className="relative z-10 flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-orange-500 shadow-lg shadow-orange-500/40 flex items-center justify-center">
                    <MapPin size={18} className="text-white" fill="white" />
                  </div>
                  <span className="text-gray-400 text-xs bg-[#111] px-3 py-1 rounded-full border border-white/[0.08]">
                    {siteSettings?.officeAddress || "Gulberg III, Lahore"}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <p className="text-gray-500 text-xs">
                  {siteSettings?.officeHours || "Mon–Sat: 9 AM – 6 PM PKT"}
                </p>
                <p className="text-gray-700 text-xs mt-0.5">
                  {siteSettings?.responseNote || "Response time: within 24 hours"}
                </p>
              </div>
            </div>

            <div className="bg-orange-500/[0.06] border border-orange-500/15 rounded-xl p-4">
              <p className="text-orange-400/80 text-xs font-semibold mb-1">
                🚀 Want to become a vendor?
              </p>
              <p className="text-gray-600 text-xs leading-relaxed">
                Apply directly from the Sign Up page. Our team reviews every
                application within 24–48 hours.
              </p>
            </div>
          </div>

          {(isCustomer || isVendor) && (
            <div className="mt-12 lg:col-span-2 bg-[#111] border border-white/[0.06] rounded-2xl p-7">
              <h2 className="text-white font-bold text-sm mb-1">
                Your tickets to FlavorCraft admin
              </h2>
              <p className="text-gray-600 text-xs mb-5">
                When we update status or add a note, it appears here.
              </p>
              {tickets.length === 0 ? (
                <p className="text-gray-500 text-sm">No tickets yet.</p>
              ) : (
                <ul className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {tickets.map((t) => (
                    <li
                      key={t._id}
                      className="border border-white/[0.06] rounded-xl p-4 bg-[#0d0d0d]"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                        <span className="text-orange-400 text-xs font-bold uppercase">
                          {String(t.status || "").replace(/_/g, " ")}
                        </span>
                        <span className="text-gray-600 text-[10px]">
                          {new Date(t.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm font-medium">
                        {t.subject || "Message"}
                      </p>
                      <p className="text-gray-500 text-xs mt-1 whitespace-pre-wrap">
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
          )}
        </div>
      </div>
    </div>
  );
}
