import { describe, expect, it } from "vitest";
import { formatVND } from "@/lib/money";

// Intl dùng khoảng trắng không ngắt dòng (U+00A0) trước ký hiệu ₫.
const normalize = (s: string) => s.replace(/ /g, " ");

describe("formatVND", () => {
  it("dùng dấu chấm ngăn cách hàng nghìn", () => {
    expect(normalize(formatVND(65000))).toBe("65.000 ₫");
    expect(normalize(formatVND(1250000))).toBe("1.250.000 ₫");
  });

  it("hiển thị 0 đồng", () => {
    expect(normalize(formatVND(0))).toBe("0 ₫");
  });
});
