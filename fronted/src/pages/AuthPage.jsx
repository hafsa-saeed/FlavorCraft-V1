//Unified Login/signup UI
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

const SCALES = [
  { value: "home_chef", label: "🏠 Home Chef (1–5 orders/day)" },
  { value: "small_kitchen", label: "🍳 Small Kitchen (5–20 orders/day)" },
  { value: "medium_kitchen", label: "🏪 Medium Kitchen (20–50 orders/day)" },
  { value: "professional", label: "🏭 Professional Kitchen (50+ orders/day)" },
];

export default function AuthPage() {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  // "login" | "signup"
  const [mode, setMode] = useState("login");
  // "customer" | "vendor"
  const [role, setRole] = useState("customer");
  // vendor flow step: 1 = register, 2 = application
  const [vendorStep, setVendorStep] = useState(1);
  // application submitted screen
  const [submitted, setSubmitted] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form fields
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    kitchenName: "",
    city: "",
    cnic: "",
    businessScale: "",
    businessMotive: "",
  });

  // Temporary token stored between vendor step 1 → 2
  const [vendorToken, setVendorToken] = useState(null);

  const set = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleError = (err) => {
    setError(
      err.response?.data?.message || "Something went wrong. Please try again.",
    );
  };

  // ── LOGIN ──────────────────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { login } = await import("../context/AuthContext").then((m) => ({
        login: null,
      }));
      // Use api directly
      const res = await api.post("/auth/login", {
        email: form.email,
        password: form.password,
      });
      localStorage.setItem("fc_token", res.data.token);
      setUser(res.data.user);
      const u = res.data.user;
      if (u.role === "admin") navigate("/admin");
      else if (u.role === "vendor") navigate("/vendor/dashboard");
      else navigate("/");
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  // ── CUSTOMER SIGNUP ────────────────────────────────────────────────────────
  const handleCustomerSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/signup/customer", {
        name: form.name,
        email: form.email,
        password: form.password,
      });
      localStorage.setItem("fc_token", res.data.token);
      setUser(res.data.user);
      navigate("/");
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  // ── VENDOR STEP 1 ──────────────────────────────────────────────────────────
  const handleVendorRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/signup/vendor", {
        email: form.email,
        password: form.password,
      });
      setVendorToken(res.data.token);
      localStorage.setItem("fc_token", res.data.token);
      setVendorStep(2);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  // ── VENDOR STEP 2 ──────────────────────────────────────────────────────────
  const handleVendorApplication = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/vendor/apply", {
        kitchenName: form.kitchenName,
        city: form.city,
        cnic: form.cnic,
        businessScale: form.businessScale,
        businessMotive: form.businessMotive,
      });
      setUser(res.data.user);
      setSubmitted(true);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  // ── SUBMITTED SCREEN ───────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-[#FF8C00]/10 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-[#FF8C00]/30">
            <span className="text-4xl">🍽️</span>
          </div>
          <h2
            className="text-3xl font-bold text-white mb-3"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Application Submitted!
          </h2>
          <p className="text-gray-400 text-lg mb-6 leading-relaxed">
            Your application is under review.{" "}
            <span className="text-[#FF8C00] font-semibold">
              Our admin will notify you within 24–48 hours.
            </span>
          </p>
          <div className="bg-[#FF8C00]/5 border border-[#FF8C00]/20 rounded-2xl p-5 mb-8 text-left space-y-2">
            <p className="text-gray-400 text-sm">
              📧 A confirmation will be sent to your email
            </p>
            <p className="text-gray-400 text-sm">
              ⏱️ Review typically takes 24–48 hours
            </p>
            <p className="text-gray-400 text-sm">
              ✅ You'll receive dashboard access once approved
            </p>
          </div>
          <button
            onClick={() => navigate("/")}
            className="w-full py-3 bg-[#FF8C00] hover:bg-[#e07b00] text-white font-semibold rounded-xl transition-colors"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-[#1a1a1a] flex"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] bg-[#111] p-12 relative overflow-hidden">
        {/* Background texture */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, #FF8C00 0%, transparent 50%), radial-gradient(circle at 80% 20%, #FF8C00 0%, transparent 40%)",
          }}
        />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <span className="text-3xl">🔥</span>
            <span
              className="text-white text-2xl font-bold tracking-tight"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              FlavorCraft
            </span>
          </div>
          <h1
            className="text-5xl font-bold text-white leading-tight mb-6"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Food crafted
            <br />
            <span className="text-[#FF8C00]">just for you.</span>
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed max-w-xs">
            Connect with home chefs and professional kitchens to get meals
            customized to your exact preferences.
          </p>
        </div>
        <div className="relative z-10 space-y-4">
          {[
            "Fully customized meals",
            "Verified home chefs",
            "Real-time order tracking",
          ].map((f) => (
            <div key={f} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-[#FF8C00]/20 border border-[#FF8C00]/40 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-[#FF8C00]" />
              </div>
              <span className="text-gray-400 text-sm">{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Logo (mobile) */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <span className="text-2xl">🔥</span>
            <span
              className="text-white text-xl font-bold"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              FlavorCraft
            </span>
          </div>

          {/* Mode toggle */}
          <div className="flex bg-[#252525] rounded-xl p-1 mb-8">
            {["login", "signup"].map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m);
                  setError("");
                  setVendorStep(1);
                }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold capitalize transition-all ${
                  mode === m
                    ? "bg-[#FF8C00] text-white shadow-lg"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          {/* ── LOGIN FORM ─────────────────────────────────────────────────── */}
          {mode === "login" && (
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <h2
                  className="text-2xl font-bold text-white mb-1"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Welcome back
                </h2>
                <p className="text-gray-500 text-sm">
                  Sign in to your FlavorCraft account
                </p>
              </div>
              <Input
                label="Email"
                type="email"
                value={form.email}
                onChange={set("email")}
                placeholder="you@example.com"
              />
              <Input
                label="Password"
                type="password"
                value={form.password}
                onChange={set("password")}
                placeholder="••••••••"
              />
              {error && <ErrorMsg msg={error} />}
              <SubmitBtn loading={loading} label="Sign In" />
              <p className="text-center text-gray-500 text-sm">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className="text-[#FF8C00] hover:underline font-medium"
                >
                  Sign up
                </button>
              </p>
            </form>
          )}

          {/* ── SIGNUP: ROLE PICKER ────────────────────────────────────────── */}
          {mode === "signup" && vendorStep === 1 && (
            <div>
              <div className="mb-6">
                <h2
                  className="text-2xl font-bold text-white mb-1"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Create account
                </h2>
                <p className="text-gray-500 text-sm">Who are you joining as?</p>
              </div>

              {/* Role selector */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                  {
                    value: "customer",
                    icon: "🛒",
                    title: "Customer",
                    desc: "Order custom meals",
                  },
                  {
                    value: "vendor",
                    icon: "👨‍🍳",
                    title: "Vendor",
                    desc: "Sell your cooking",
                  },
                ].map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      role === r.value
                        ? "border-[#FF8C00] bg-[#FF8C00]/10"
                        : "border-[#333] bg-[#1e1e1e] hover:border-[#FF8C00]/50"
                    }`}
                  >
                    <span className="text-2xl block mb-2">{r.icon}</span>
                    <span className="text-white font-semibold text-sm block">
                      {r.title}
                    </span>
                    <span className="text-gray-500 text-xs">{r.desc}</span>
                  </button>
                ))}
              </div>

              {/* Customer form */}
              {role === "customer" && (
                <form onSubmit={handleCustomerSignup} className="space-y-4">
                  <Input
                    label="Full Name"
                    value={form.name}
                    onChange={set("name")}
                    placeholder="John Doe"
                  />
                  <Input
                    label="Email"
                    type="email"
                    value={form.email}
                    onChange={set("email")}
                    placeholder="you@example.com"
                  />
                  <Input
                    label="Password"
                    type="password"
                    value={form.password}
                    onChange={set("password")}
                    placeholder="Min. 6 characters"
                  />
                  {error && <ErrorMsg msg={error} />}
                  <SubmitBtn loading={loading} label="Create Account" />
                </form>
              )}

              {/* Vendor step 1 form */}
              {role === "vendor" && (
                <form onSubmit={handleVendorRegister} className="space-y-4">
                  <div className="bg-[#FF8C00]/5 border border-[#FF8C00]/20 rounded-xl p-3 text-sm text-[#FF8C00]">
                    📋 Step 1 of 2 — Create your account, then complete an
                    application.
                  </div>
                  <Input
                    label="Email"
                    type="email"
                    value={form.email}
                    onChange={set("email")}
                    placeholder="kitchen@example.com"
                  />
                  <Input
                    label="Password"
                    type="password"
                    value={form.password}
                    onChange={set("password")}
                    placeholder="Min. 6 characters"
                  />
                  {error && <ErrorMsg msg={error} />}
                  <SubmitBtn
                    loading={loading}
                    label="Continue to Application →"
                  />
                </form>
              )}

              <p className="text-center text-gray-500 text-sm mt-4">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="text-[#FF8C00] hover:underline font-medium"
                >
                  Sign in
                </button>
              </p>
            </div>
          )}

          {/* ── VENDOR STEP 2 — APPLICATION ─────────────────────────────────── */}
          {mode === "signup" && vendorStep === 2 && (
            <form onSubmit={handleVendorApplication} className="space-y-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs bg-[#FF8C00] text-white px-2 py-0.5 rounded-full font-semibold">
                    Step 2 of 2
                  </span>
                </div>
                <h2
                  className="text-2xl font-bold text-white"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Vendor Application
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  Tell us about your kitchen — we review every application
                  carefully.
                </p>
              </div>

              <Input
                label="Kitchen Name"
                value={form.kitchenName}
                onChange={set("kitchenName")}
                placeholder="e.g. Mama's Kitchen"
              />

              <Input
                label="City"
                value={form.city}
                onChange={set("city")}
                placeholder="e.g. Lahore"
              />

              <Input
                label="CNIC / National ID"
                value={form.cnic}
                onChange={set("cnic")}
                placeholder="e.g. 35201-1234567-1"
              />

              {/* Business Scale select */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Business Scale
                </label>
                <select
                  required
                  value={form.businessScale}
                  onChange={set("businessScale")}
                  className="w-full bg-[#252525] border border-[#333] text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF8C00] transition-colors appearance-none"
                >
                  <option value="" disabled>
                    Select your kitchen scale
                  </option>
                  {SCALES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Business Motive textarea */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Business Motive
                  <span className="text-gray-500 font-normal ml-1">
                    (min. 50 characters)
                  </span>
                </label>
                <textarea
                  required
                  minLength={50}
                  rows={4}
                  value={form.businessMotive}
                  onChange={set("businessMotive")}
                  placeholder="Tell us why you want to join FlavorCraft and what makes your kitchen special..."
                  className="w-full bg-[#252525] border border-[#333] text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF8C00] transition-colors resize-none placeholder-gray-600"
                />
                <p className="text-xs text-gray-600 mt-1">
                  {form.businessMotive.length} / 50 min characters
                </p>
              </div>

              {error && <ErrorMsg msg={error} />}
              <SubmitBtn loading={loading} label="Submit Application" />

              <button
                type="button"
                onClick={() => setVendorStep(1)}
                className="w-full text-center text-gray-500 text-sm hover:text-gray-300 transition-colors"
              >
                ← Back to registration
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

function Input({ label, type = "text", value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1.5">
        {label}
      </label>
      <input
        type={type}
        required
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-[#252525] border border-[#333] text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF8C00] transition-colors placeholder-gray-600"
      />
    </div>
  );
}

function ErrorMsg({ msg }) {
  return (
    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-sm text-red-400">
      ⚠️ {msg}
    </div>
  );
}

function SubmitBtn({ loading, label }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full py-3.5 bg-[#FF8C00] hover:bg-[#e07b00] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors text-sm"
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
          Processing...
        </span>
      ) : (
        label
      )}
    </button>
  );
}
