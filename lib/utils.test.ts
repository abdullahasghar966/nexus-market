import { describe, it, expect } from "vitest";
import {
  formatPrice,
  slugify,
  discountPercent,
  truncate,
  average,
  pluralize,
} from "./utils";

describe("formatPrice", () => {
  it("formats USD with two decimals", () => {
    expect(formatPrice(89.99)).toBe("$89.99");
    expect(formatPrice(1299)).toBe("$1,299.00");
  });
});

describe("slugify", () => {
  it("creates url-safe slugs", () => {
    expect(slugify("Hello World!")).toBe("hello-world");
    expect(slugify("  Noise-Canceling  Headphones ")).toBe(
      "noise-canceling-headphones",
    );
  });
});

describe("discountPercent", () => {
  it("computes rounded percent off", () => {
    expect(discountPercent(89.99, 120)).toBe(25);
    expect(discountPercent(100, 100)).toBe(0);
    expect(discountPercent(100)).toBe(0);
  });
});

describe("truncate", () => {
  it("truncates and appends an ellipsis", () => {
    expect(truncate("abcdef", 3)).toBe("abc…");
    expect(truncate("abc", 5)).toBe("abc");
  });
});

describe("average", () => {
  it("averages numbers and handles empty", () => {
    expect(average([1, 2, 3])).toBe(2);
    expect(average([])).toBe(0);
  });
});

describe("pluralize", () => {
  it("pluralizes based on count", () => {
    expect(pluralize(1, "item")).toBe("item");
    expect(pluralize(2, "item")).toBe("items");
    expect(pluralize(0, "box", "boxes")).toBe("boxes");
  });
});
