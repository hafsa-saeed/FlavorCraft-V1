import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

// ── Cuisine options ───────────────────────────────────────────────────────────
const CUISINE_OPTIONS = [
  "Pakistani",
  "Desi",
  "BBQ / Grill",
  "Chinese",
  "Continental",
  "Italian",
  "Fast Food",
  "Biryani",
  "Seafood",
  "Desserts & Sweets",
  "Healthy / Diet",
  "Vegan",
  "Breakfast",
  "Baked Goods",
];

// ── Step indicator ─────────────────────────────────────────────────────────────
function StepDot({ n, current, label }) {
  const done = current > n;
  const active = current === n;
  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
          done
            ? "bg-[#FF8C00] text-white"
            : active
              ? "bg-[#FF8C00]/20 border-2 border-[#FF8C00] text-[#FF8C00]"
              : "bg-white/5 border border-white/10 text-gray-600"
        }`}
      >
        {done ? "✓" : n}
      </div>
      <span
        className={`text-sm font-medium hidden sm:block ${active ? "text-white" : "text-gray-600"}`}
      >
        {label}
      </span>
    </div>
  );
}

// ── Image upload preview ──────────────────────────────────────────────────────
function ImageUpload({ label, hint, value, onChange, aspect = "cover" }) {
  const ref = useRef();
  const height = aspect === "cover" ? "h-36" : "h-36 w-36 rounded-full";
  const isCircle = aspect === "profile";

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onChange(ev.target.result); // base64 preview
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
        {label}
      </label>
      <div
        onClick={() => ref.current.click()}
        className={`${isCircle ? "w-36 " : "w-full "}${height} ${isCircle ? "rounded-full" : "rounded-xl"} border-2 border-dashed border-white/10 hover:border-[#FF8C00]/40 transition-colors cursor-pointer overflow-hidden relative group`}
      >
        {value ? (
          <>
            <img
              src={value}
              alt="preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white text-sm font-medium">Change</span>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            <span className="text-2xl text-gray-600">📷</span>
            <span className="text-gray-600 text-xs">{hint}</span>
          </div>
        )}
      </div>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
      />
      <p className="text-gray-700 text-xs mt-1">
        PNG, JPG up to 5MB · For production use Cloudinary upload
      </p>
    </div>
  );
}

// ── Cuisine tag picker ────────────────────────────────────────────────────────
function CuisinePicker({ selected, onChange }) {
  const toggle = (c) =>
    onChange(
      selected.includes(c) ? selected.filter((x) => x !== c) : [...selected, c],
    );

  return (
    <div className="flex flex-wrap gap-2">
      {CUISINE_OPTIONS.map((c) => {
        const on = selected.includes(c);
        return (
          <button
            key={c}
            type="button"
            onClick={() => toggle(c)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
              on
                ? "bg-[#FF8C00]/20 border-[#FF8C00]/40 text-[#FF8C00]"
                : "bg-white/5 border-white/10 text-gray-500 hover:border-white/20 hover:text-gray-300"
            }`}
          >
            {c}
          </button>
        );
      })}
    </div>
  );
}

// ── Input wrapper ─────────────────────────────────────────────────────────────
function Field({ label, required, children, hint }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
        {label} {required && <span className="text-[#FF8C00]">*</span>}
      </label>
      {children}
      {hint && <p className="text-gray-700 text-xs mt-1">{hint}</p>}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, ...rest }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-[#1a1a1a] border border-white/10 text-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF8C00]/50 transition-colors placeholder-gray-700"
      {...rest}
    />
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function VendorProfileSetup() {
  const navigate = useNavigate();
  const { setUser, user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    shopName: user?.vendorApplication?.kitchenName || "",
    bio: "",
    city: user?.vendorApplication?.city || "",
    phone: "",
    cuisineTypes: [],
    coverImage: "",
    profileImage: "",
  });

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  const validateStep = () => {
    if (step === 1) {
      if (!form.shopName.trim()) return "Shop name is required.";
      if (!form.bio.trim() || form.bio.length < 30)
        return "Bio must be at least 30 characters.";
      if (!form.city.trim()) return "City is required.";
    }
    if (step === 2 && form.cuisineTypes.length === 0) {
      return "Please select at least one cuisine type.";
    }
    return null;
  };

  const nextStep = () => {
    const err = validateStep();
    if (err) {
      setError(err);
      return;
    }
    setError("");
    setStep((s) => s + 1);
  };

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await api.put("/vendor/profile/setup", form);
      setUser(res.data.vendor);
      navigate("/vendor/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-[#0f0f0f] flex"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-80 bg-[#141414] border-r border-white/5 p-8 fixed h-full">
        <div>
          <div className="flex items-center gap-2.5 mb-12">
            <div className="w-8 h-8 rounded-lg bg-[#FF8C00] flex items-center justify-center text-sm">
              🔥
            </div>
            <span
              className="text-white font-bold"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              FlavorCraft
            </span>
          </div>

          <h2
            className="text-2xl font-bold text-white mb-2"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Set up your
            <br />
            <span className="text-[#FF8C00]">shop profile.</span>
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-10">
            Customers will see this when browsing FlavorCraft. Make it stand
            out.
          </p>

          {/* Steps */}
          <div className="space-y-4">
            {[
              { n: 1, label: "Basic Info" },
              { n: 2, label: "Cuisine Types" },
              { n: 3, label: "Brand Images" },
            ].map((s) => (
              <StepDot key={s.n} {...s} current={step} />
            ))}
          </div>
        </div>

        <div className="bg-[#FF8C00]/5 border border-[#FF8C00]/15 rounded-xl p-4">
          <p className="text-[#FF8C00] text-xs font-semibold mb-1">
            🎉 Account Approved!
          </p>
          <p className="text-gray-500 text-xs leading-relaxed">
            Complete your profile to unlock your vendor dashboard and start
            posting dishes.
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="lg:ml-80 flex-1 flex items-start justify-center p-6 lg:p-12 pt-10">
        <div className="w-full max-w-xl">
          {/* Mobile header */}
          <div className="flex items-center gap-2 mb-6 lg:hidden">
            <span className="text-xl">🔥</span>
            <span
              className="text-white font-bold"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              FlavorCraft
            </span>
          </div>

          {/* Progress bar (mobile) */}
          <div className="flex gap-1.5 mb-8 lg:hidden">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-all ${s <= step ? "bg-[#FF8C00]" : "bg-white/10"}`}
              />
            ))}
          </div>

          {/* ── STEP 1: Basic Info ─────────────────────────────────────────── */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <p className="text-[#FF8C00] text-xs font-semibold uppercase tracking-widest mb-1">
                  Step 1 of 3
                </p>
                <h1
                  className="text-2xl font-bold text-white"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Basic Shop Info
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                  Tell customers who you are and what you do.
                </p>
              </div>

              <Field label="Shop Name" required>
                <TextInput
                  value={form.shopName}
                  onChange={set("shopName")}
                  placeholder="e.g. Mama's Kitchen"
                />
              </Field>

              <Field label="City" required>
                <TextInput
                  value={form.city}
                  onChange={set("city")}
                  placeholder="e.g. Lahore, Karachi"
                />
              </Field>

              <Field
                label="Phone Number"
                hint="Visible to customers after order placement"
              >
                <TextInput
                  value={form.phone}
                  onChange={set("phone")}
                  placeholder="+92 300 1234567"
                  type="tel"
                />
              </Field>

              <Field
                label="Shop Bio"
                required
                hint={`${form.bio.length} / 30 min characters`}
              >
                <textarea
                  rows={4}
                  value={form.bio}
                  onChange={(e) => set("bio")(e.target.value)}
                  placeholder="Describe your cooking style, specialties, and what makes your kitchen unique..."
                  className="w-full bg-[#1a1a1a] border border-white/10 text-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF8C00]/50 transition-colors resize-none placeholder-gray-700"
                />
              </Field>

              {error && <ErrorMsg msg={error} />}
              <NextBtn onClick={nextStep} label="Continue to Cuisine Types →" />
            </div>
          )}

          {/* ── STEP 2: Cuisine Types ──────────────────────────────────────── */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <p className="text-[#FF8C00] text-xs font-semibold uppercase tracking-widest mb-1">
                  Step 2 of 3
                </p>
                <h1
                  className="text-2xl font-bold text-white"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Your Cuisine Types
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                  Select all that apply — customers filter by these.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
                  Cuisine types <span className="text-[#FF8C00]">*</span>
                  <span className="text-gray-600 normal-case ml-2">
                    ({form.cuisineTypes.length} selected)
                  </span>
                </label>
                <CuisinePicker
                  selected={form.cuisineTypes}
                  onChange={set("cuisineTypes")}
                />
              </div>

              {error && <ErrorMsg msg={error} />}
              <div className="flex gap-3">
                <BackBtn
                  onClick={() => {
                    setStep(1);
                    setError("");
                  }}
                />
                <NextBtn
                  onClick={nextStep}
                  label="Continue to Images →"
                  className="flex-1"
                />
              </div>
            </div>
          )}

          {/* ── STEP 3: Brand Images ───────────────────────────────────────── */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <p className="text-[#FF8C00] text-xs font-semibold uppercase tracking-widest mb-1">
                  Step 3 of 3
                </p>
                <h1
                  className="text-2xl font-bold text-white"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Brand Images
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                  Optional but highly recommended — shops with images get 3×
                  more orders.
                </p>
              </div>

              <Field
                label="Cover Image"
                hint="Displayed at the top of your shop page (16:9 recommended)"
              >
                <ImageUpload
                  label=""
                  hint="Click to upload cover photo"
                  value={form.coverImage}
                  onChange={set("coverImage")}
                  aspect="cover"
                />
              </Field>

              <Field
                label="Profile Image"
                hint="Your kitchen logo or photo (shown in search results)"
              >
                <div className="flex items-start gap-4">
                  <ImageUpload
                    label=""
                    hint="Upload"
                    value={form.profileImage}
                    onChange={set("profileImage")}
                    aspect="profile"
                  />
                  <div className="flex-1 bg-[#1a1a1a] border border-white/5 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-3">
                      Preview in search card:
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-[#FF8C00]/20 border border-[#FF8C00]/30 flex items-center justify-center shrink-0">
                        {form.profileImage ? (
                          <img
                            src={form.profileImage}
                            alt="profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-[#FF8C00] font-bold text-sm">
                            {form.shopName?.[0] || "?"}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-gray-200 text-sm font-medium">
                          {form.shopName || "Your Shop Name"}
                        </p>
                        <p className="text-gray-600 text-xs">
                          {form.city || "Your City"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Field>

              <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-4 text-sm text-amber-400/80">
                💡 Images are stored as base64 previews. For production,
                integrate{" "}
                <span className="font-semibold text-amber-400">Cloudinary</span>{" "}
                to upload and get permanent URLs.
              </div>

              {error && <ErrorMsg msg={error} />}
              <div className="flex gap-3">
                <BackBtn
                  onClick={() => {
                    setStep(2);
                    setError("");
                  }}
                />
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 py-3.5 bg-[#FF8C00] hover:bg-[#e07b00] disabled:opacity-60 text-white font-semibold rounded-xl text-sm transition-colors"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg
                        className="animate-spin w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
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
                      Setting up your shop...
                    </span>
                  ) : (
                    "🚀 Launch My Shop"
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Mini sub-components ───────────────────────────────────────────────────────
function ErrorMsg({ msg }) {
  return (
    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-sm text-red-400">
      ⚠️ {msg}
    </div>
  );
}

function NextBtn({ onClick, label, className = "w-full" }) {
  return (
    <button
      onClick={onClick}
      className={`${className} py-3.5 bg-[#FF8C00] hover:bg-[#e07b00] text-white font-semibold rounded-xl text-sm transition-colors`}
    >
      {label}
    </button>
  );
}

function BackBtn({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="px-6 py-3.5 bg-white/5 hover:bg-white/10 text-gray-400 border border-white/10 rounded-xl text-sm font-medium transition-colors"
    >
      ← Back
    </button>
  );
}
