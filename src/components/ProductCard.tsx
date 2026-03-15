"use client";

import Image from "next/image";
import Link from "next/link";
import { type Product } from "@prisma/client";
import AddToCartButton from "./AddToCartButton";
import { formatPrice } from "@/lib/utils/currency";
import { motion } from "framer-motion";
import { Star, ShoppingCart } from "lucide-react";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  let images: string[] = ["/placeholder-product.jpg"];
  if (product.images) {
    try {
      const parsed = JSON.parse(product.images);
      if (Array.isArray(parsed) && parsed.length > 0) images = parsed;
    } catch {}
  }

  const discount = product.originalPrice
    ? Math.round((1 - Number(product.price) / Number(product.originalPrice)) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="group flex flex-col bg-card/40 backdrop-blur-sm border border-border rounded-2xl overflow-hidden hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/30 transition-all duration-300 h-full"
    >
      {/* Image */}
      <Link href={`/products/${product.id}`} className="relative w-full aspect-[4/5] bg-muted/30 overflow-hidden block">
        {product.flashSalePrice && (
          <span className="absolute top-3 left-3 z-10 bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-lg">
            Flash Sale
          </span>
        )}
        {discount > 0 && !product.flashSalePrice && (
          <span className="absolute top-3 left-3 z-10 bg-green-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg">
            {discount}% OFF
          </span>
        )}
        <Image
          src={images[0]}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        />
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5 gap-3">
        {/* Category & Rating Row */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">{product.category}</span>
          {product.rating > 0 && (
            <div className="flex items-center gap-1">
              <Star size={12} className="fill-amber-400 text-amber-400" />
              <span className="text-xs font-semibold">{product.rating}</span>
              <span className="text-[10px] text-muted-foreground">({product.reviewsCount})</span>
            </div>
          )}
        </div>

        {/* Name */}
        <Link href={`/products/${product.id}`}>
          <h3 className="text-base font-semibold line-clamp-1 group-hover:text-primary transition-colors">{product.name}</h3>
        </Link>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{product.description}</p>

        {/* Spacer to push price + button to bottom */}
        <div className="flex-1" />

        {/* Price Section */}
        <div className="flex items-baseline gap-2 pt-3 border-t border-border/50">
          <span className="font-bold text-xl text-primary">{formatPrice(Number(product.price))}</span>
          {product.originalPrice && (
            <span className="text-xs text-muted-foreground line-through">{formatPrice(Number(product.originalPrice))}</span>
          )}
        </div>

        {/* Add to Cart - with clear space above */}
        <div className="pt-2">
          <AddToCartButton
            product={product}
            className="w-full flex items-center justify-center gap-2 bg-foreground text-background font-semibold py-3 rounded-xl hover:bg-primary hover:text-white hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 text-sm"
          />
        </div>
      </div>
    </motion.div>
  );
}
