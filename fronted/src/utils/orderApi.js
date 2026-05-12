/**
 * Build Mongo Order payloads from cart (single-vendor cart only).
 */
export function assertSingleVendor(items) {
  const ids = new Set(
    items.map((i) => String(i.vendorId || "").trim()).filter(Boolean),
  );
  if (ids.size === 0) throw new Error("Cart items are missing a kitchen.");
  if (ids.size > 1) {
    throw new Error(
      "Your cart has dishes from more than one kitchen. Please checkout one kitchen at a time.",
    );
  }
  return [...ids][0];
}

export function cartLinesToOrderItems(items) {
  return items.map((i) => {
    const rawId = i.dishId;
    const dishId =
      rawId != null && typeof rawId === "object" && typeof rawId.toString === "function"
        ? String(rawId.toString())
        : String(rawId ?? "");
    const line = {
      dishId,
      dishName: i.name,
      dishImage: i.image || "",
      basePrice: Number(i.basePrice) || 0,
      quantity: Math.max(1, Number(i.quantity) || 1),
      addons: (i.addons || []).map((a) => ({
        name: a.name,
        price: Number(a.price) || 0,
      })),
      removals: i.removals || [],
      spiceLevel: i.spiceLevel || "medium",
      tastePrefs: i.tastePrefs || [],
      specialNote: (i.specialNote || "").slice(0, 300),
      addonTotal: Number(i.addonTotal) || 0,
      lineTotal: Number(i.lineTotal) || 0,
    };
    const snap = i.customizations;
    if (
      snap != null &&
      typeof snap === "object" &&
      !Array.isArray(snap) &&
      snap.extras != null &&
      typeof snap.extras === "object" &&
      !Array.isArray(snap.extras)
    ) {
      line.extras = { ...snap.extras };
    }
    return line;
  });
}

export function buildCustomizationsSnapshot(items) {
  return {
    version: 1,
    lines: items.map((i) => ({
      dishId: i.dishId,
      name: i.name,
      quantity: i.quantity,
      spiceLevel: i.spiceLevel || "medium",
      addons: i.addons || [],
      removals: i.removals || [],
      tastePrefs: i.tastePrefs || [],
      specialNote: i.specialNote || "",
      extras:
        i.customizations != null && typeof i.customizations === "object"
          ? i.customizations.extras
          : undefined,
    })),
  };
}

export function buildCreateOrderBody({
  items,
  deliveryAddress,
  paymentMethod,
  subtotal,
  deliveryFee,
  platformFee,
  promoCode,
  promoAmt,
  grandTotal,
}) {
  const vendorId = assertSingleVendor(items);
  const first = items[0];
  const vendorName = first.vendorName || "Kitchen";

  const orderItems = cartLinesToOrderItems(items);
  const customizations = buildCustomizationsSnapshot(items);

  return {
    vendorId,
    vendorName,
    items: orderItems,
    deliveryAddress,
    paymentMethod,
    subtotal: Math.round(Number(subtotal) || 0),
    deliveryFee: Math.round(Number(deliveryFee) || 0),
    platformFee: Math.round(Number(platformFee) || 0),
    promoCode: promoCode || "",
    promoDiscount: Math.round(Number(promoAmt) || 0),
    totalAmount: Math.round(Number(grandTotal) || 0),
    customizations,
  };
}

/** Map backend status → progress index for customer tracker (0..4) */
export const TRACK_FLOW = [
  "pending",
  "confirmed",
  "preparing",
  "on_way",
  "delivered",
];

export function statusToTrackerIndex(status) {
  if (status === "cancelled") return -1;
  const i = TRACK_FLOW.indexOf(status);
  return i === -1 ? 0 : i;
}
