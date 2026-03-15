"use client";

import { useCart } from "@/context/CartContext";
import { FadeIn } from "@/components/FadeIn";
import { formatPrice } from "@/lib/utils/currency";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Plus, Minus, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="min-h-screen pt-32 pb-24" />;

  return (
    <main className="min-h-screen pt-32 pb-24 container mx-auto px-6 max-w-6xl">
      <FadeIn>
        <h1 className="text-4xl lg:text-5xl font-bold mb-8 tracking-tight">Your Cart</h1>
      </FadeIn>

      {cart.length === 0 ? (
        <FadeIn delay={0.1}>
          <div className="flex flex-col items-center justify-center p-12 bg-card/40 backdrop-blur-sm rounded-2xl border border-border text-center">
            <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
            <p className="text-muted-foreground mb-8">Looks like you haven't added anything to your cart yet.</p>
            <Link 
              href="/products"
              className="bg-primary text-primary-foreground font-semibold py-3 px-8 rounded-full hover:scale-105 transition-all shadow-lg hover:shadow-primary/30"
            >
              Continue Shopping
            </Link>
          </div>
        </FadeIn>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {cart.map((item, i) => {
              let images = ["/placeholder-product.jpg"];
              if (item.images) {
                try {
                  const parsed = JSON.parse(item.images as string);
                  if (Array.isArray(parsed) && parsed.length > 0) images = parsed;
                } catch (e) {}
              }

              return (
                <FadeIn key={item.id} delay={0.1 + i * 0.1}>
                  <div className="flex items-center gap-6 p-4 bg-card/40 backdrop-blur-sm rounded-2xl border border-border group hover:border-primary/50 transition-colors">
                    <Link href={`/products/${item.id}`} className="relative w-24 h-24 bg-[#25252b] rounded-xl overflow-hidden flex-shrink-0">
                      <Image 
                        src={images[0]} 
                        alt={item.name} 
                        fill 
                        className="object-cover group-hover:scale-110 transition-transform duration-500" 
                      />
                    </Link>
                    
                    <div className="flex-1 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                      <div>
                        <Link href={`/products/${item.id}`} className="font-semibold text-lg hover:text-primary transition-colors line-clamp-1">
                          {item.name}
                        </Link>
                        <p className="text-sm text-muted-foreground mt-1">{formatPrice(Number(item.price))}</p>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center bg-background border border-border rounded-lg overflow-hidden h-10">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-10 h-full flex items-center justify-center text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="w-10 text-center font-medium text-sm select-none">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-10 h-full flex items-center justify-center text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        
                        <div className="font-bold w-24 text-right">
                          {formatPrice(Number(item.price) * item.quantity)}
                        </div>

                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </FadeIn>
              );
            })}
          </div>

          {/* Checkout Summary */}
          <div className="lg:col-span-1">
            <FadeIn delay={0.3}>
              <div className="bg-card border border-border rounded-2xl p-6 sticky top-28">
                <h3 className="text-xl font-semibold mb-6">Order Summary</h3>
                
                <div className="space-y-4 text-sm mb-6">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span className="text-foreground font-medium">{formatPrice(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping</span>
                    <span className="text-foreground font-medium">
                      {cartTotal > 5000 ? "Free" : formatPrice(500)}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Tax</span>
                    <span className="text-foreground font-medium">{formatPrice(cartTotal * 0.18)}</span>
                  </div>
                </div>

                <div className="border-t border-border pt-4 mb-8">
                  <div className="flex justify-between items-end">
                    <span className="font-semibold text-lg">Total</span>
                    <span className="font-bold text-2xl text-primary">
                      {formatPrice(cartTotal + (cartTotal > 5000 ? 0 : 500) + (cartTotal * 0.18))}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Including GST (18%) and Shipping.</p>
                </div>

                <Link 
                  href="/checkout"
                  className="w-full flex items-center justify-center gap-2 bg-foreground text-background font-semibold py-4 rounded-xl hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
                >
                  Proceed to Checkout
                  <ArrowRight size={18} />
                </Link>
                
                <div className="mt-4 text-center">
                  <Link href="/products" className="text-sm text-primary hover:underline underline-offset-4">
                    Or continue shopping
                  </Link>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      )}
    </main>
  );
}
