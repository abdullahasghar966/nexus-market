"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { useCart } from "@/hooks/useCart";
import { useUIStore } from "@/lib/zustand/ui-store";
import type { Product } from "@/types";

/**
 * The detail-page primary CTA — warm-orange accent per the design kit.
 * `stock` (optional) lets the caller pass a live stock count (from
 * `useRealtimeStock`) so the button disables/clamps against realtime inventory.
 */
export function AddToCartButton({
  product,
  stock,
}: {
  product: Product;
  stock?: number;
}) {
  const { addItem } = useCart();
  const openCart = useUIStore((s) => s.openCart);
  const stockCount = stock ?? product.stockCount;
  const outOfStock = stockCount <= 0;

  function handleAdd() {
    addItem(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        image: product.images[0],
        vendorId: product.vendor.id,
        vendorName: product.vendor.name,
        maxStock: stockCount,
      },
      1,
    );
    toast.success("Added to cart", { description: product.name });
    openCart();
  }

  return (
    <Button
      variant="accent"
      size="lg"
      onClick={handleAdd}
      disabled={outOfStock}
    >
      <Icon name="add_shopping_cart" size={20} />
      {outOfStock ? "Out of stock" : "Add to Cart"}
    </Button>
  );
}
