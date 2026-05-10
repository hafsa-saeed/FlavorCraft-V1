import { useState, useRef, useCallback } from "react";
import {
  X,
  ChefHat,
  Leaf,
  Camera,
  Plus,
  Trash2,
  Tag,
  DollarSign,
  AlignLeft,
  Flame,
  Beef,
  Droplets,
  Wheat,
  Check,
  AlertCircle,
} from "lucide-react";
import api from "../../utils/api";

// ── Constants ─────────────────────────────────────────────────────────────────
const CATEGORIES = [
  "Desi",
  "BBQ & Grill",
  "Fast Food",
  "Biryani",
  "Chinese",
  "Continental",
  "Seafood",
  "Desserts",
  "Beverages",
  "Breakfast",
  "Healthy",
  "Vegan",
  "Baked Goods",
  "Other",
];

const TABS = [
  { id: "basic", label: "Basic Info", icon: ChefHat },
  { id: "ingredients", label: "Ingredients", icon: Leaf },
  { id: "nutrition", label: "Nutrition", icon: Flame },
  { id: "photo", label: "Photo", icon: Camera },
];

const EMPTY_FORM = {
  name: "",
  description: "",
  price: "",
  category: "",
  ingredients: [],
  nutrition: { calories: "", protein: "", fats: "", carbs: "" },
  image: "",
};

const EMPTY_INGREDIENT = { name: "", extraPrice: "", isRemovable: true };

// ── Small helpers ─────────────────────────────────────────────────────────────
function FieldLabel({ children, required }) {
  return (
    <label className="block text-[11px] font-semibold uppercase tracking-widest text-gray-500 mb-2">
      {children}
      {required && <span className="text-orange-500 ml-0.5">*</span>}
    </label>
  );
}

function Input({ className = "", ...props }) {
  return (
    <input
      className={`w-full bg-[#111] border border-white/[0.08] hover:border-white/[0.14] focus:border-orange-500/60 text-gray-200 rounded-xl px-4 py-3 text-sm outline-none transition-all placeholder-gray-700 ${className}`}
      {...props}
    />
  );
}

function NutritionInput({ icon: Icon, label, value, onChange, color }) {
  return (
    <div className="bg-[#111] border border-white/[0.07] rounded-xl p-4 flex flex-col gap-3">
      <div
        className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}
      >
        <Icon size={16} />
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-widest font-semibold text-gray-600 mb-1">
          {label}
        </p>
        <div className="flex items-baseline gap-1">
          <input
            type="number"
            min="0"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="0"
            className="w-full bg-transparent text-2xl font-bold text-gray-200 outline-none placeholder-gray-700 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
          />
          <span className="text-gray-600 text-xs">
            {label === "Calories" ? "kcal" : "g"}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Tab panels ────────────────────────────────────────────────────────────────

function BasicTab({ form, setForm }) {
  return (
    <div className="space-y-5">
      <div>
        <FieldLabel required>Dish Name</FieldLabel>
        <Input
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="e.g. Chicken Karahi, Zinger Burger"
          maxLength={120}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <FieldLabel required>Price (PKR)</FieldLabel>
          <div className="relative">
            <DollarSign
              size={14}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600"
            />
            <Input
              type="number"
              min="0"
              className="pl-9"
              value={form.price}
              onChange={(e) =>
                setForm((f) => ({ ...f, price: e.target.value }))
              }
              placeholder="350"
            />
          </div>
        </div>

        <div>
          <FieldLabel required>Category</FieldLabel>
          <select
            value={form.category}
            onChange={(e) =>
              setForm((f) => ({ ...f, category: e.target.value }))
            }
            className="w-full bg-[#111] border border-white/[0.08] hover:border-white/[0.14] focus:border-orange-500/60 text-gray-200 rounded-xl px-4 py-3 text-sm outline-none transition-all appearance-none cursor-pointer"
          >
            <option value="" disabled className="text-gray-600">
              Select category
            </option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <FieldLabel>Description</FieldLabel>
        <div className="relative">
          <AlignLeft
            size={14}
            className="absolute left-3.5 top-3.5 text-gray-600"
          />
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
            placeholder="Describe your dish — what makes it special, how it's made..."
            maxLength={600}
            className="w-full bg-[#111] border border-white/[0.08] hover:border-white/[0.14] focus:border-orange-500/60 text-gray-200 rounded-xl pl-9 pr-4 py-3 text-sm outline-none transition-all resize-none placeholder-gray-700"
          />
        </div>
        <p className="text-[11px] text-gray-700 mt-1 text-right">
          {form.description.length}/600
        </p>
      </div>
    </div>
  );
}

function IngredientsTab({ form, setForm }) {
  const addIngredient = () =>
    setForm((f) => ({
      ...f,
      ingredients: [...f.ingredients, { ...EMPTY_INGREDIENT }],
    }));

  const updateIngredient = (i, field, value) =>
    setForm((f) => {
      const updated = [...f.ingredients];
      updated[i] = { ...updated[i], [field]: value };
      return { ...f, ingredients: updated };
    });

  const removeIngredient = (i) =>
    setForm((f) => ({
      ...f,
      ingredients: f.ingredients.filter((_, idx) => idx !== i),
    }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-300 text-sm font-medium">
            Customization ingredients
          </p>
          <p className="text-gray-600 text-xs mt-0.5">
            Customers can add, remove, or pay extra for these
          </p>
        </div>
        <button
          type="button"
          onClick={addIngredient}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-orange-500/15 hover:bg-orange-500/25 text-orange-400 border border-orange-500/25 rounded-xl text-xs font-semibold transition-all"
        >
          <Plus size={13} /> Add
        </button>
      </div>

      {form.ingredients.length === 0 ? (
        <div className="border-2 border-dashed border-white/[0.06] rounded-2xl py-12 flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.04] flex items-center justify-center">
            <Leaf size={22} className="text-gray-600" />
          </div>
          <p className="text-gray-600 text-sm">No ingredients yet</p>
          <button
            type="button"
            onClick={addIngredient}
            className="text-orange-400 text-xs hover:text-orange-300 transition-colors"
          >
            + Add your first ingredient
          </button>
        </div>
      ) : (
        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1 custom-scroll">
          {/* Column headers */}
          <div className="grid grid-cols-[1fr_100px_80px_36px] gap-2 px-1">
            {["Ingredient Name", "Extra Price", "Removable", ""].map((h) => (
              <p
                key={h}
                className="text-[10px] uppercase tracking-widest text-gray-700 font-semibold"
              >
                {h}
              </p>
            ))}
          </div>

          {form.ingredients.map((ing, i) => (
            <div
              key={i}
              className="grid grid-cols-[1fr_100px_80px_36px] gap-2 items-center"
            >
              <Input
                value={ing.name}
                onChange={(e) => updateIngredient(i, "name", e.target.value)}
                placeholder="e.g. Extra Cheese"
                className="text-xs py-2.5"
              />
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 text-xs">
                  ₨
                </span>
                <Input
                  type="number"
                  min="0"
                  value={ing.extraPrice}
                  onChange={(e) =>
                    updateIngredient(i, "extraPrice", e.target.value)
                  }
                  placeholder="0"
                  className="pl-7 text-xs py-2.5"
                />
              </div>
              <button
                type="button"
                onClick={() =>
                  updateIngredient(i, "isRemovable", !ing.isRemovable)
                }
                className={`h-full rounded-xl border text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
                  ing.isRemovable
                    ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400"
                    : "bg-white/[0.04] border-white/[0.08] text-gray-600"
                }`}
              >
                {ing.isRemovable ? <Check size={12} /> : <X size={12} />}
                {ing.isRemovable ? "Yes" : "No"}
              </button>
              <button
                type="button"
                onClick={() => removeIngredient(i)}
                className="w-9 h-9 rounded-xl bg-red-500/[0.08] hover:bg-red-500/20 text-red-500/60 hover:text-red-400 flex items-center justify-center transition-all"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      {form.ingredients.length > 0 && (
        <div className="bg-orange-500/[0.06] border border-orange-500/15 rounded-xl px-4 py-3 flex items-start gap-2.5">
          <Tag size={13} className="text-orange-400 mt-0.5 shrink-0" />
          <p className="text-[12px] text-orange-300/70 leading-relaxed">
            Total extra cost if all add-ons selected:{" "}
            <span className="text-orange-400 font-semibold">
              ₨
              {form.ingredients.reduce(
                (s, i) => s + (Number(i.extraPrice) || 0),
                0,
              )}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}

function NutritionTab({ form, setForm }) {
  const setNutrition = (key) => (val) =>
    setForm((f) => ({ ...f, nutrition: { ...f.nutrition, [key]: val } }));

  const n = form.nutrition;
  const total = [n.protein, n.fats, n.carbs]
    .map(Number)
    .filter(Boolean)
    .reduce((s, v) => s + v, 0);

  return (
    <div className="space-y-5">
      <div>
        <p className="text-gray-300 text-sm font-medium">
          Nutritional values per serving
        </p>
        <p className="text-gray-600 text-xs mt-0.5">
          Leave blank if unknown — customers appreciate transparency
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <NutritionInput
          icon={Flame}
          label="Calories"
          value={n.calories}
          onChange={setNutrition("calories")}
          color="bg-orange-500/15 text-orange-400"
        />
        <NutritionInput
          icon={Beef}
          label="Protein"
          value={n.protein}
          onChange={setNutrition("protein")}
          color="bg-red-500/15 text-red-400"
        />
        <NutritionInput
          icon={Droplets}
          label="Fats"
          value={n.fats}
          onChange={setNutrition("fats")}
          color="bg-yellow-500/15 text-yellow-400"
        />
        <NutritionInput
          icon={Wheat}
          label="Carbs"
          value={n.carbs}
          onChange={setNutrition("carbs")}
          color="bg-sky-500/15 text-sky-400"
        />
      </div>

      {/* Macro bar */}
      {total > 0 && (
        <div>
          <div className="flex justify-between text-[11px] text-gray-600 mb-2">
            <span>Macro breakdown</span>
            <span>{total}g total</span>
          </div>
          <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
            {[
              { val: n.protein, color: "bg-red-500" },
              { val: n.fats, color: "bg-yellow-500" },
              { val: n.carbs, color: "bg-sky-500" },
            ].map(({ val, color }) =>
              Number(val) > 0 ? (
                <div
                  key={color}
                  className={`${color} h-full transition-all`}
                  style={{ flex: Number(val) }}
                />
              ) : null,
            )}
          </div>
          <div className="flex gap-4 mt-2">
            {[
              { label: "Protein", val: n.protein, color: "bg-red-500" },
              { label: "Fats", val: n.fats, color: "bg-yellow-500" },
              { label: "Carbs", val: n.carbs, color: "bg-sky-500" },
            ].map(({ label, val, color }) => (
              <div key={label} className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${color}`} />
                <span className="text-[11px] text-gray-600">
                  {label}: <span className="text-gray-400">{val || 0}g</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PhotoTab({ form, setForm }) {
  const inputRef = useRef();

  const handleFile = useCallback(
    (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) =>
        setForm((f) => ({ ...f, image: ev.target.result }));
      reader.readAsDataURL(file);
    },
    [setForm],
  );

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      const file = e.dataTransfer.files?.[0];
      if (!file || !file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = (ev) =>
        setForm((f) => ({ ...f, image: ev.target.result }));
      reader.readAsDataURL(file);
    },
    [setForm],
  );

  return (
    <div className="space-y-5">
      <div>
        <p className="text-gray-300 text-sm font-medium">Dish photo</p>
        <p className="text-gray-600 text-xs mt-0.5">
          A great photo increases orders by up to 70%
        </p>
      </div>

      {form.image ? (
        <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] group">
          <img
            src={form.image}
            alt="preview"
            className="w-full h-56 object-cover"
          />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => inputRef.current.click()}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold border border-white/20 transition-all"
            >
              Change Photo
            </button>
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, image: "" }))}
              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl text-xs font-semibold border border-red-500/30 transition-all"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => inputRef.current.click()}
          className="border-2 border-dashed border-white/[0.08] hover:border-orange-500/30 rounded-2xl h-52 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all group"
        >
          <div className="w-14 h-14 rounded-2xl bg-white/[0.04] group-hover:bg-orange-500/10 flex items-center justify-center transition-all">
            <Camera
              size={24}
              className="text-gray-600 group-hover:text-orange-400 transition-colors"
            />
          </div>
          <div className="text-center">
            <p className="text-gray-400 text-sm font-medium">
              Drop image here or click to browse
            </p>
            <p className="text-gray-700 text-xs mt-1">PNG, JPG up to 5MB</p>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
      />

      <div className="bg-[#111] border border-white/[0.06] rounded-xl px-4 py-3 flex items-start gap-2.5">
        <AlertCircle size={13} className="text-amber-500/60 mt-0.5 shrink-0" />
        <p className="text-[12px] text-gray-600 leading-relaxed">
          Images stored as base64 previews. Integrate{" "}
          <span className="text-gray-400">Cloudinary</span> before production
          deployment for optimized delivery.
        </p>
      </div>
    </div>
  );
}

// ── Main Modal ────────────────────────────────────────────────────────────────
export default function AddDishModal({ onClose, onSuccess, editDish = null }) {
  const [activeTab, setActiveTab] = useState("basic");
  const [form, setForm] = useState(
    editDish
      ? {
          name: editDish.name || "",
          description: editDish.description || "",
          price: editDish.price || "",
          category: editDish.category || "",
          ingredients: editDish.ingredients || [],
          nutrition: editDish.nutrition || {
            calories: "",
            protein: "",
            fats: "",
            carbs: "",
          },
          image: editDish.image || "",
        }
      : { ...EMPTY_FORM },
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const tabIndex = TABS.findIndex((t) => t.id === activeTab);
  const isLast = tabIndex === TABS.length - 1;
  const isFirst = tabIndex === 0;

  const nextTab = () =>
    TABS[tabIndex + 1] && setActiveTab(TABS[tabIndex + 1].id);
  const prevTab = () =>
    TABS[tabIndex - 1] && setActiveTab(TABS[tabIndex - 1].id);

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.price || !form.category) {
      setActiveTab("basic");
      setError("Please fill in Name, Price, and Category.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        ingredients: form.ingredients.map((i) => ({
          ...i,
          extraPrice: Number(i.extraPrice) || 0,
        })),
        nutrition: {
          calories: Number(form.nutrition.calories) || 0,
          protein: Number(form.nutrition.protein) || 0,
          fats: Number(form.nutrition.fats) || 0,
          carbs: Number(form.nutrition.carbs) || 0,
        },
      };

      if (editDish) {
        await api.patch(`/dishes/${editDish._id}`, payload);
      } else {
        await api.post("/dishes", payload);
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 900);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative bg-[#161616] border border-white/[0.07] rounded-2xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden"
        style={{ maxHeight: "90vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
          <div>
            <h2
              className="text-white font-bold text-lg"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {editDish ? "Edit Dish" : "Add New Dish"}
            </h2>
            <p className="text-gray-600 text-xs mt-0.5">
              {editDish
                ? `Editing — ${editDish.name}`
                : "Complete all tabs for the best experience"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/[0.05] hover:bg-white/10 text-gray-500 hover:text-gray-300 flex items-center justify-center transition-all"
          >
            <X size={15} />
          </button>
        </div>

        {/* Tab bar */}
        <div className="flex border-b border-white/[0.06] px-2 pt-2">
          {TABS.map((tab, i) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const isDone = i < tabIndex;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex flex-col items-center gap-1 pb-3 pt-1 text-[11px] font-semibold transition-all border-b-2 ${
                  isActive
                    ? "border-orange-500 text-orange-400"
                    : isDone
                      ? "border-emerald-600/40 text-emerald-500/70"
                      : "border-transparent text-gray-600 hover:text-gray-400"
                }`}
              >
                <div className="relative">
                  <Icon size={15} />
                  {isDone && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full flex items-center justify-center">
                      <Check size={6} strokeWidth={3} className="text-white" />
                    </span>
                  )}
                </div>
                <span className="hidden sm:block">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {activeTab === "basic" && <BasicTab form={form} setForm={setForm} />}
          {activeTab === "ingredients" && (
            <IngredientsTab form={form} setForm={setForm} />
          )}
          {activeTab === "nutrition" && (
            <NutritionTab form={form} setForm={setForm} />
          )}
          {activeTab === "photo" && <PhotoTab form={form} setForm={setForm} />}
        </div>

        {/* Footer */}
        <div className="border-t border-white/[0.06] px-6 py-4 flex items-center gap-3">
          {/* Error */}
          {error && (
            <p className="flex-1 text-xs text-red-400 flex items-center gap-1.5">
              <AlertCircle size={12} /> {error}
            </p>
          )}
          {success && (
            <p className="flex-1 text-xs text-emerald-400 flex items-center gap-1.5">
              <Check size={12} /> {editDish ? "Updated!" : "Dish added!"}
            </p>
          )}
          {!error && !success && <span className="flex-1" />}

          {!isFirst && (
            <button
              type="button"
              onClick={prevTab}
              className="px-4 py-2.5 bg-white/[0.05] hover:bg-white/[0.09] text-gray-400 rounded-xl text-sm font-medium border border-white/[0.07] transition-all"
            >
              Back
            </button>
          )}

          {!isLast ? (
            <button
              type="button"
              onClick={nextTab}
              className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-semibold transition-all"
            >
              Next →
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || success}
              className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition-all flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin w-3.5 h-3.5"
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
                  Saving...
                </>
              ) : success ? (
                <>
                  <Check size={14} /> Done
                </>
              ) : editDish ? (
                "Save Changes"
              ) : (
                "Add to Menu"
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
