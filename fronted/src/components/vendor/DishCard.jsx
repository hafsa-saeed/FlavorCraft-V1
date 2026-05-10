import { useState } from "react";
import {
  MoreVertical,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Flame,
  Leaf,
  Tag,
  ChefHat,
} from "lucide-react";
import api from "../../utils/api";

const CATEGORY_COLORS = {
  Desi: "bg-orange-500/15 text-orange-400",
  "BBQ & Grill": "bg-red-500/15    text-red-400",
  "Fast Food": "bg-yellow-500/15 text-yellow-400",
  Biryani: "bg-amber-500/15  text-amber-400",
  Chinese: "bg-emerald-500/15 text-emerald-400",
  Continental: "bg-sky-500/15    text-sky-400",
  Seafood: "bg-blue-500/15   text-blue-400",
  Desserts: "bg-pink-500/15   text-pink-400",
  Beverages: "bg-cyan-500/15   text-cyan-400",
  Breakfast: "bg-lime-500/15   text-lime-400",
  Healthy: "bg-green-500/15  text-green-400",
  Vegan: "bg-teal-500/15   text-teal-400",
  "Baked Goods": "bg-rose-500/15   text-rose-400",
  Other: "bg-gray-500/15   text-gray-400",
};

export default function DishCard({ dish, onEdit, onDelete, onRefresh }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);

  const catColor = CATEGORY_COLORS[dish.category] || CATEGORY_COLORS["Other"];
  const hasNutrition =
    dish.nutrition &&
    (dish.nutrition.calories ||
      dish.nutrition.protein ||
      dish.nutrition.fats ||
      dish.nutrition.carbs);

  const handleToggle = async () => {
    setToggling(true);
    try {
      await api.patch(`/dishes/${dish._id}/toggle`);
      onRefresh();
    } finally {
      setToggling(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDel) {
      setConfirmDel(true);
      return;
    }
    setDeleting(true);
    try {
      await api.delete(`/dishes/${dish._id}`);
      onRefresh();
    } finally {
      setDeleting(false);
      setConfirmDel(false);
    }
  };

  return (
    <div
      className={`group bg-[#161616] border rounded-2xl overflow-hidden flex flex-col transition-all duration-200 hover:border-white/[0.12] hover:shadow-xl hover:shadow-black/40 hover:-translate-y-0.5 ${
        dish.isAvailable
          ? "border-white/[0.07]"
          : "border-white/[0.04] opacity-60"
      }`}
    >
      {/* Image */}
      <div className="relative h-44 bg-[#111] overflow-hidden shrink-0">
        {dish.image ? (
          <img
            src={dish.image}
            alt={dish.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ChefHat size={36} className="text-white/[0.08]" />
          </div>
        )}

        {/* Overlay badges */}
        <div className="absolute top-3 left-3">
          <span
            className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${catColor}`}
          >
            {dish.category}
          </span>
        </div>

        {/* Availability pill */}
        <div className="absolute top-3 right-3">
          <span
            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${
              dish.isAvailable
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/25"
                : "bg-white/[0.06] text-gray-600 border border-white/[0.06]"
            }`}
          >
            {dish.isAvailable ? "Live" : "Off"}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        {/* Name + price */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-gray-200 font-semibold text-sm leading-snug line-clamp-2 flex-1">
            {dish.name}
          </h3>
          <span className="text-orange-400 font-bold text-sm shrink-0 whitespace-nowrap">
            ₨{dish.price.toLocaleString()}
          </span>
        </div>

        {/* Description */}
        {dish.description && (
          <p className="text-gray-600 text-xs leading-relaxed line-clamp-2">
            {dish.description}
          </p>
        )}

        {/* Ingredients */}
        {dish.ingredients?.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <Leaf size={11} className="text-gray-700 shrink-0" />
            {dish.ingredients.slice(0, 3).map((ing, i) => (
              <span
                key={i}
                className="text-[11px] bg-white/[0.04] text-gray-600 px-2 py-0.5 rounded-full border border-white/[0.05]"
              >
                {ing.name}
              </span>
            ))}
            {dish.ingredients.length > 3 && (
              <span className="text-[11px] text-gray-700">
                +{dish.ingredients.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Nutrition strip */}
        {hasNutrition && (
          <div className="flex gap-2 pt-1 border-t border-white/[0.05]">
            {[
              {
                label: "kcal",
                value: dish.nutrition.calories,
                color: "text-orange-400",
              },
              {
                label: "P",
                value: dish.nutrition.protein,
                color: "text-red-400",
              },
              {
                label: "F",
                value: dish.nutrition.fats,
                color: "text-yellow-400",
              },
              {
                label: "C",
                value: dish.nutrition.carbs,
                color: "text-sky-400",
              },
            ].map(({ label, value, color }) =>
              value ? (
                <div key={label} className="text-center flex-1">
                  <p className={`text-[11px] font-bold ${color}`}>{value}</p>
                  <p className="text-[10px] text-gray-700">{label}</p>
                </div>
              ) : null,
            )}
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Action bar */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => onEdit(dish)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-white/[0.05] hover:bg-white/[0.09] text-gray-400 hover:text-gray-200 rounded-xl text-xs font-semibold border border-white/[0.07] transition-all"
          >
            <Pencil size={12} /> Manage
          </button>

          <button
            onClick={handleToggle}
            disabled={toggling}
            title={dish.isAvailable ? "Mark unavailable" : "Mark available"}
            className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all ${
              dish.isAvailable
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
                : "bg-white/[0.04] border-white/[0.07] text-gray-600 hover:text-gray-400"
            }`}
          >
            {dish.isAvailable ? (
              <ToggleRight size={15} />
            ) : (
              <ToggleLeft size={15} />
            )}
          </button>

          {/* Delete */}
          <button
            onClick={handleDelete}
            disabled={deleting}
            title={confirmDel ? "Click again to confirm" : "Delete dish"}
            onBlur={() => setConfirmDel(false)}
            className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all ${
              confirmDel
                ? "bg-red-500/20 border-red-500/40 text-red-400"
                : "bg-white/[0.04] border-white/[0.07] text-gray-600 hover:text-red-400 hover:border-red-500/20 hover:bg-red-500/[0.08]"
            }`}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
