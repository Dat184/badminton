/**
 * Money is always stored and computed as an integer number of VND
 * (no fractional part) and only formatted to a string for display.
 */
const vndFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

/** 65000 → "65.000 ₫" */
export function formatVND(amount: number): string {
  return vndFormatter.format(amount);
}
