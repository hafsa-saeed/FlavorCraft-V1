import { useState, useRef } from "react";
import {
  Store,
  Clock,
  ImageIcon,
  Save,
  Check,
  AlertCircle,
  Camera,
  ToggleLeft,
  ToggleRight,
  ChevronDown,
} from "lucide-react";
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";

// ── Constants ─────────────────────────────────────────────────────────────────
const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];
const DAY_LABELS = {
  monday: "Mon",
  tuesday: "Tue",
  wednesday: "Wed",
  thursday: "Thu",
  friday: "Fri",
  saturday: "Sat",
  sunday: "Sun",
};
const DAY_FULL = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

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

const DEFAULT_TIMINGS = Object.fromEntries(
  DAYS.map((d) => [
    d,
    { open: "09:00", close: "22:00", isClosed: d === "sunday" },
  ]),
);

// ── Reusable ──────────────────────────────────────────────────────────────────
function Label({ children, required }) {
  return (
    <label className="block text-[11px] font-semibold uppercase tracking-widest text-gray-500 mb-2">
      {children}
      {required && <span className="text-orange-500 ml-0.5">*</span>}
    </label>
  );
}
function TextInput({ className = "", ...props }) {
  return (
    <input
      className={`w-full bg-[#111] border border-white/[0.08] hover:border-white/[0.14] focus:border-orange-500/60 text-gray-200 rounded-xl px-4 py-3 text-sm outline-none transition-all placeholder-gray-700 ${className}`}
      {...props}
    />
  );
}
function SaveBtn({ loading, saved, label = "Save Changes" }) {
  return (
    <button
      type="submit"
      disabled={loading || saved}
      className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition-all"
    >
      {saved ? (
        <>
          <Check size={14} /> Saved!
        </>
      ) : loading ? (
        <>
          <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />{" "}
          Saving...
        </>
      ) : (
        <>
          <Save size={14} /> {label}
        </>
      )}
    </button>
  );
}
function ErrorMsg({ msg }) {
  return msg ? (
    <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">
      <AlertCircle size={13} /> {msg}
    </div>
  ) : null;
}

// ── Tab 1: General ────────────────────────────────────────────────────────────
function GeneralTab({ profile }) {
  const { setUser } = useAuth();
  const [form, setForm] = useState({
    shopName: profile?.shopName || "",
    bio: profile?.bio || "",
    phone: profile?.phone || "",
    city: profile?.city || "",
    cuisineTypes: profile?.cuisineTypes || [],
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const toggle = (c) =>
    setForm((f) => ({
      ...f,
      cuisineTypes: f.cuisineTypes.includes(c)
        ? f.cuisineTypes.filter((x) => x !== c)
        : [...f.cuisineTypes, c],
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.shopName.trim() || !form.city.trim()) {
      setError("Shop name and city are required.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await api.patch("/vendor/profile", form);
      setUser(res.data.vendor);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label required>Kitchen / Shop Name</Label>
          <TextInput
            value={form.shopName}
            onChange={(e) =>
              setForm((f) => ({ ...f, shopName: e.target.value }))
            }
            placeholder="Mama's Kitchen"
          />
        </div>
        <div>
          <Label required>City</Label>
          <TextInput
            value={form.city}
            onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
            placeholder="Lahore"
          />
        </div>
      </div>

      <div>
        <Label>Phone Number</Label>
        <TextInput
          type="tel"
          value={form.phone}
          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          placeholder="+92 300 1234567"
        />
      </div>

      <div>
        <Label>Kitchen Bio</Label>
        <textarea
          rows={4}
          value={form.bio}
          onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
          maxLength={400}
          placeholder="Describe your kitchen, specialties, cooking philosophy..."
          className="w-full bg-[#111] border border-white/[0.08] hover:border-white/[0.14] focus:border-orange-500/60 text-gray-200 rounded-xl px-4 py-3 text-sm outline-none transition-all resize-none placeholder-gray-700"
        />
        <p className="text-[11px] text-gray-700 text-right mt-1">
          {form.bio.length}/400
        </p>
      </div>

      <div>
        <Label>Kitchen Categories</Label>
        <div className="flex flex-wrap gap-2">
          {CUISINE_OPTIONS.map((c) => {
            const on = form.cuisineTypes.includes(c);
            return (
              <button
                type="button"
                key={c}
                onClick={() => toggle(c)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  on
                    ? "bg-orange-500/15 border-orange-500/35 text-orange-400"
                    : "bg-transparent border-white/[0.07] text-gray-600 hover:border-white/15 hover:text-gray-400"
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>
      </div>

      <ErrorMsg msg={error} />
      <div className="flex justify-end">
        <SaveBtn loading={loading} saved={saved} />
      </div>
    </form>
  );
}

// ── Tab 2: Timings ────────────────────────────────────────────────────────────
function TimingsTab({ profile }) {
  const { setUser } = useAuth();
  const [timings, setTimings] = useState(profile?.timings || DEFAULT_TIMINGS);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const updateDay = (day, field, value) =>
    setTimings((t) => ({ ...t, [day]: { ...t[day], [field]: value } }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.put("/vendor/settings/timings", { timings });
      setUser(res.data.vendor);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save timings.");
    } finally {
      setLoading(false);
    }
  };

  // Which days are open (for "Quick Set All" button)
  const openCount = DAYS.filter((d) => !timings[d]?.isClosed).length;
  const setAllOpen = (open) =>
    setTimings((t) =>
      Object.fromEntries(DAYS.map((d) => [d, { ...t[d], isClosed: !open }])),
    );

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
      {/* Quick actions */}
      <div className="flex items-center gap-3 pb-2">
        <span className="text-gray-600 text-xs">{openCount} days open</span>
        <button
          type="button"
          onClick={() => setAllOpen(true)}
          className="text-xs text-orange-400 hover:text-orange-300 transition-colors"
        >
          Open all
        </button>
        <span className="text-gray-700">·</span>
        <button
          type="button"
          onClick={() => setAllOpen(false)}
          className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
        >
          Close all
        </button>
      </div>

      {/* Day rows */}
      <div className="space-y-2">
        {DAYS.map((day) => {
          const t = timings[day] || {
            open: "09:00",
            close: "22:00",
            isClosed: false,
          };
          const closed = t.isClosed;
          return (
            <div
              key={day}
              className={`flex items-center gap-4 rounded-2xl px-5 py-4 border transition-all ${
                closed
                  ? "bg-[#111] border-white/[0.04] opacity-60"
                  : "bg-[#161616] border-white/[0.07]"
              }`}
            >
              {/* Day name */}
              <div className="w-24 shrink-0">
                <p
                  className={`text-sm font-semibold ${closed ? "text-gray-600" : "text-gray-200"}`}
                >
                  {DAY_FULL[day]}
                </p>
                <p className="text-[10px] text-gray-700 uppercase tracking-wider">
                  {DAY_LABELS[day]}
                </p>
              </div>

              {/* Toggle */}
              <button
                type="button"
                onClick={() => updateDay(day, "isClosed", !closed)}
                className={`shrink-0 transition-all ${closed ? "text-gray-700" : "text-orange-400"}`}
              >
                {closed ? <ToggleLeft size={26} /> : <ToggleRight size={26} />}
              </button>

              {/* Times */}
              {closed ? (
                <span className="text-gray-700 text-sm italic">Closed</span>
              ) : (
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">
                      Opens
                    </span>
                    <input
                      type="time"
                      value={t.open}
                      onChange={(e) => updateDay(day, "open", e.target.value)}
                      className="bg-[#111] border border-white/[0.08] text-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-500/50 transition-all"
                    />
                  </div>
                  <span className="text-gray-700 mt-4">—</span>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">
                      Closes
                    </span>
                    <input
                      type="time"
                      value={t.close}
                      onChange={(e) => updateDay(day, "close", e.target.value)}
                      className="bg-[#111] border border-white/[0.08] text-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-500/50 transition-all"
                    />
                  </div>

                  {/* Hours label */}
                  <div className="ml-auto text-right">
                    <p className="text-[11px] text-gray-600">
                      {(() => {
                        const [oh, om] = t.open.split(":").map(Number);
                        const [ch, cm] = t.close.split(":").map(Number);
                        const diff = ch * 60 + cm - (oh * 60 + om);
                        if (diff <= 0) return "—";
                        const h = Math.floor(diff / 60);
                        const m = diff % 60;
                        return m ? `${h}h ${m}m` : `${h}h`;
                      })()}
                    </p>
                    <p className="text-[10px] text-gray-700">open</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <ErrorMsg msg={error} />
      <div className="flex justify-end">
        <SaveBtn loading={loading} saved={saved} label="Save Timings" />
      </div>
    </form>
  );
}

// ── Tab 3: Profile & Cover Image ──────────────────────────────────────────────
function ImagesTab({ profile }) {
  const { setUser } = useAuth();
  const profileRef = useRef();
  const coverRef = useRef();
  const [profileImage, setProfileImage] = useState(profile?.profileImage || "");
  const [coverImage, setCoverImage] = useState(profile?.coverImage || "");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const handleFile = (setter) => (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setter(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.patch("/vendor/profile", {
        profileImage,
        coverImage,
      });
      setUser(res.data.vendor);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save images.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-xl">
      {/* Cover image */}
      <div>
        <Label>Cover Photo</Label>
        <p className="text-gray-600 text-xs mb-3">
          Displayed at the top of your shop page (16:9 recommended)
        </p>
        <div
          onClick={() => coverRef.current.click()}
          className="relative w-full h-40 rounded-2xl overflow-hidden border-2 border-dashed border-white/[0.08] hover:border-orange-500/30 transition-all cursor-pointer group"
        >
          {coverImage ? (
            <>
              <img
                src={coverImage}
                alt="cover"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-sm font-medium flex items-center gap-2">
                  <Camera size={15} /> Change Cover
                </span>
              </div>
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2">
              <ImageIcon size={24} className="text-gray-700" />
              <span className="text-gray-600 text-sm">
                Click to upload cover photo
              </span>
            </div>
          )}
        </div>
        <input
          ref={coverRef}
          type="file"
          accept="image/*"
          onChange={handleFile(setCoverImage)}
          className="hidden"
        />
      </div>

      {/* Profile image */}
      <div>
        <Label>Profile / Logo Image</Label>
        <p className="text-gray-600 text-xs mb-3">
          Shown in search results and your shop header
        </p>
        <div className="flex items-center gap-6">
          {/* Circle preview */}
          <div
            onClick={() => profileRef.current.click()}
            className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-dashed border-white/[0.08] hover:border-orange-500/30 transition-all cursor-pointer group shrink-0"
          >
            {profileImage ? (
              <>
                <img
                  src={profileImage}
                  alt="profile"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera size={18} className="text-white" />
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-orange-500/10">
                <Camera size={22} className="text-orange-400/50" />
              </div>
            )}
          </div>

          {/* Live preview card */}
          <div className="flex-1 bg-[#111] border border-white/[0.05] rounded-2xl p-4">
            <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-3">
              Preview in search
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-orange-500/15 border border-orange-500/20 shrink-0 flex items-center justify-center">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-orange-400 font-bold text-sm">
                    {profile?.shopName?.[0] || "K"}
                  </span>
                )}
              </div>
              <div>
                <p className="text-gray-200 text-sm font-medium">
                  {profile?.shopName || "Your Kitchen"}
                </p>
                <p className="text-gray-600 text-xs">
                  {profile?.city || "City"}
                </p>
              </div>
            </div>
          </div>
        </div>
        <input
          ref={profileRef}
          type="file"
          accept="image/*"
          onChange={handleFile(setProfileImage)}
          className="hidden"
        />
      </div>

      <div className="bg-[#111] border border-white/[0.06] rounded-xl px-4 py-3 flex items-start gap-2.5">
        <AlertCircle size={13} className="text-amber-500/50 mt-0.5 shrink-0" />
        <p className="text-[12px] text-gray-600 leading-relaxed">
          Images saved as base64. Integrate{" "}
          <span className="text-gray-400">Cloudinary</span> before production
          for optimised delivery.
        </p>
      </div>

      <ErrorMsg msg={error} />
      <div className="flex justify-end">
        <SaveBtn loading={loading} saved={saved} label="Save Images" />
      </div>
    </form>
  );
}

// ── Main Settings component ───────────────────────────────────────────────────
const TABS = [
  { id: "general", label: "General", icon: Store },
  { id: "timings", label: "Timings", icon: Clock },
  { id: "images", label: "Profile Image", icon: ImageIcon },
];

export default function SettingsView({ profile }) {
  const [activeTab, setActiveTab] = useState("general");

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1
          className="text-2xl font-bold text-white"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Settings
        </h1>
        <p className="text-gray-600 text-sm mt-1">
          Manage your kitchen profile and preferences
        </p>
      </div>

      <div className="flex gap-8">
        {/* Vertical tab rail */}
        <nav className="w-44 shrink-0 space-y-0.5">
          {TABS.map(({ id, label, icon: Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left ${
                  active
                    ? "bg-orange-500/15 text-orange-400 border border-orange-500/20"
                    : "text-gray-500 hover:text-gray-300 hover:bg-white/[0.04]"
                }`}
              >
                <Icon size={14} className={active ? "text-orange-400" : ""} />
                {label}
              </button>
            );
          })}
        </nav>

        {/* Tab content */}
        <div className="flex-1 min-w-0">
          {activeTab === "general" && <GeneralTab profile={profile} />}
          {activeTab === "timings" && <TimingsTab profile={profile} />}
          {activeTab === "images" && <ImagesTab profile={profile} />}
        </div>
      </div>
    </div>
  );
}
