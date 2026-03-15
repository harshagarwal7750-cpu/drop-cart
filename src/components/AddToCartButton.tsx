"use client";

import { useCart } from "@/context/CartContext";
import { type Product } from "@prisma/client";
import { ShoppingCart, Check } from "lucide-react";
import { useState } from "react";

interface AddToCartButtonProps {
  product: Product;
  className?: string;
}

export default function AddToCartButton({
  product,
  className = "w-full flex items-center justify-center gap-2 bg-foreground text-background font-semibold py-3 rounded-xl hover:bg-primary hover:text-white hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 text-sm",
}: AddToCartButtonProps) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <button
      className={className}
      onClick={handleAdd}
      disabled={product.stock === 0}
    >
      {added ? (
        <>
          <Check size={16} /> Added!
        </>
      ) : product.stock === 0 ? (
        "Out of Stock"
      ) : (
        <>
          <ShoppingCart size={16} /> Add to Cart
        </>
      )}
    </button>
  );
}
