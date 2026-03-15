"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { type Product } from "@prisma/client";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const { addToCart } = useCart();

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();

        if (Array.isArray(data)) {
          setProducts(data);
        } else {
          console.error("Products API did not return array:", data);
          setProducts([]);
        }
      } catch (error) {
        console.error("Failed to load products:", error);
        setProducts([]);
      }
    }

    loadProducts();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-10 text-white">
        All Products
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {products.map((product) => {
          let images: string[] = [];

          try {
            images = JSON.parse(product.images || "[]");
          } catch {
            images = [];
          }

          const image = images[0];

          return (
            <div
              key={product.id}
              className="border border-gray-700 p-4 rounded-lg bg-black text-white hover:shadow-xl transition"
            >
              {image && (
                <img
                  src={image}
                  alt={product.name}
                  className="w-full h-48 object-cover mb-4 rounded"
                />
              )}

              <h3 className="text-lg font-semibold mb-2">
                {product.name}
              </h3>

              <p className="text-sm opacity-80 mb-3">
                {product.description}
              </p>

              <div className="flex items-center justify-between mb-4">
                <span className="text-xl font-bold">
                  ₹{product.price}
                </span>
              </div>

              <button
                onClick={() => addToCart(product)}
                className="w-full bg-purple-600 hover:bg-purple-700 py-2 rounded"
              >
                Add to Cart
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
