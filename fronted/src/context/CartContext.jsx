import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
} from "react";

const CART_STORAGE_KEY = "fc_cart_v1";

// ── Initial state ─────────────────────────────────────────────────────────────
const initialState = {
  items: [], // CartItem[]
  drawerOpen: false,
  promoCode: "",
  promoDiscount: 0, // fraction e.g. 0.10 = 10%
  deliveryFee: 150, // PKR
  platformFee: 25,
};

// ── CartItem shape ────────────────────────────────────────────────────────────
// {
//   id: string,             unique per customization (dishId + timestamp)
//   dishId: string,
//   name: string,
//   image: string,
//   basePrice: number,
//   quantity: number,
//   addons: { name, price }[],
//   removals: string[],
//   spiceLevel: "mild" | "medium" | "hot" | "extra-hot",
//   tastePrefs: string[],   e.g. ["Low Oil", "Less Salt"]
//   specialNote: string,
//   vendorId: string,
//   vendorName: string,
//   addonTotal: number,     sum of addon prices
//   lineTotal: number,      (basePrice + addonTotal) * quantity
// }

// ── Reducer ───────────────────────────────────────────────────────────────────
function cartReducer(state, action) {
  switch (action.type) {
    case "ADD_ITEM": {
      const raw = action.payload;
      const vendorId =
        raw.vendorId != null ? String(raw.vendorId).trim() : "";
      const dishId =
        raw.dishId != null ? String(raw.dishId).trim() : raw.dishId;
      const item = { ...raw, vendorId, dishId };
      const existing = state.items.findIndex((i) => i.id === item.id);
      if (existing !== -1) {
        const items = [...state.items];
        const prev = items[existing];
        items[existing] = {
          ...item,
          ...prev,
          quantity: prev.quantity + item.quantity,
          vendorId: String(prev.vendorId || item.vendorId || "").trim(),
          vendorName: prev.vendorName || item.vendorName || "",
          dishId: prev.dishId || item.dishId,
        };
        return { ...state, items: recalc(items) };
      }
      return { ...state, items: recalc([...state.items, item]) };
    }

    case "REMOVE_ITEM":
      return {
        ...state,
        items: recalc(state.items.filter((i) => i.id !== action.payload)),
      };

    case "UPDATE_QTY": {
      const { id, quantity } = action.payload;
      if (quantity <= 0)
        return {
          ...state,
          items: recalc(state.items.filter((i) => i.id !== id)),
        };
      return {
        ...state,
        items: recalc(
          state.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
        ),
      };
    }

    case "CLEAR_CART":
      return { ...state, items: [], promoCode: "", promoDiscount: 0 };

    case "TOGGLE_DRAWER":
      return { ...state, drawerOpen: action.payload ?? !state.drawerOpen };

    case "APPLY_PROMO": {
      const PROMOS = { FLEX10: 0.1, SAVE20: 0.2, FLAVORCRAFT: 0.15 };
      const code = action.payload.toUpperCase();
      const discount = PROMOS[code] || 0;
      return {
        ...state,
        promoCode: code,
        promoDiscount: discount,
        promoError: discount ? "" : "Invalid promo code",
      };
    }

    case "REMOVE_PROMO":
      return { ...state, promoCode: "", promoDiscount: 0, promoError: "" };

    default:
      return state;
  }
}

function recalc(items) {
  return items.map((i) => ({
    ...i,
    addonTotal: i.addons?.reduce((s, a) => s + a.price, 0) || 0,
    lineTotal:
      (i.basePrice + (i.addons?.reduce((s, a) => s + a.price, 0) || 0)) *
      i.quantity,
  }));
}

function loadPersistedCart() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    const items = Array.isArray(parsed.items) ? recalc(parsed.items) : [];
    return {
      ...initialState,
      items,
      promoCode: typeof parsed.promoCode === "string" ? parsed.promoCode : "",
      promoDiscount: Number(parsed.promoDiscount) || 0,
      deliveryFee:
        Number(parsed.deliveryFee) >= 0
          ? Number(parsed.deliveryFee)
          : initialState.deliveryFee,
      platformFee:
        Number(parsed.platformFee) >= 0
          ? Number(parsed.platformFee)
          : initialState.platformFee,
      drawerOpen: false,
    };
  } catch {
    return null;
  }
}

// ── Context ───────────────────────────────────────────────────────────────────
const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(
    cartReducer,
    initialState,
    () => loadPersistedCart() || initialState,
  );

  useEffect(() => {
    try {
      localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify({
          items: state.items,
          promoCode: state.promoCode,
          promoDiscount: state.promoDiscount,
          deliveryFee: state.deliveryFee,
          platformFee: state.platformFee,
        }),
      );
    } catch {
      /* quota / private mode */
    }
  }, [
    state.items,
    state.promoCode,
    state.promoDiscount,
    state.deliveryFee,
    state.platformFee,
  ]);

  // Derived
  const subtotal = state.items.reduce((s, i) => s + i.lineTotal, 0);
  const promoAmt = Math.round(subtotal * state.promoDiscount);
  const grandTotal =
    subtotal + state.deliveryFee + state.platformFee - promoAmt;
  const itemCount = state.items.reduce((s, i) => s + i.quantity, 0);

  const addItem = useCallback(
    (item) => dispatch({ type: "ADD_ITEM", payload: item }),
    [],
  );
  const removeItem = useCallback(
    (id) => dispatch({ type: "REMOVE_ITEM", payload: id }),
    [],
  );
  const updateQty = useCallback(
    (id, quantity) =>
      dispatch({ type: "UPDATE_QTY", payload: { id, quantity } }),
    [],
  );
  const clearCart = useCallback(() => dispatch({ type: "CLEAR_CART" }), []);
  const openDrawer = useCallback(
    () => dispatch({ type: "TOGGLE_DRAWER", payload: true }),
    [],
  );
  const closeDrawer = useCallback(
    () => dispatch({ type: "TOGGLE_DRAWER", payload: false }),
    [],
  );
  const applyPromo = useCallback(
    (code) => dispatch({ type: "APPLY_PROMO", payload: code }),
    [],
  );
  const removePromo = useCallback(() => dispatch({ type: "REMOVE_PROMO" }), []);

  return (
    <CartContext.Provider
      value={{
        ...state,
        subtotal,
        promoAmt,
        grandTotal,
        itemCount,
        addItem,
        removeItem,
        updateQty,
        clearCart,
        openDrawer,
        closeDrawer,
        applyPromo,
        removePromo,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
};
