/**
 * Tiền luôn lưu và tính bằng số nguyên VND (không có phần lẻ),
 * chỉ format thành chuỗi khi hiển thị.
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
