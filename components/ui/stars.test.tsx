import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Stars } from "./stars";

describe("Stars", () => {
  it("exposes an accessible rating label", () => {
    render(<Stars rating={4.5} />);
    expect(
      screen.getByRole("img", { name: /rated 4\.5 out of 5/i }),
    ).toBeInTheDocument();
  });

  it("optionally shows the numeric value and count", () => {
    render(<Stars rating={3} showValue count={12} />);
    expect(screen.getByText(/3\.0 \(12\)/)).toBeInTheDocument();
  });
});
