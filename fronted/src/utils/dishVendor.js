/**
 * Stable vendor id string for routing from a dish (handles populate object, id string, null).
 */
export function getDishVendorIdString(dish) {
  const v = dish?.vendorId;
  if (v == null || v === "") return "";
  if (typeof v === "object" && v._id != null) return String(v._id);
  return String(v);
}
