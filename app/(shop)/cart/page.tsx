import type { Metadata } from "next";
import { CartView } from "@/components/cart/CartView";

export const metadata: Metadata = {
  title: "Your Cart",
  description: "Review the items in your Nexus Market cart.",
};

export default function CartPage() {
  return <CartView />;
}
