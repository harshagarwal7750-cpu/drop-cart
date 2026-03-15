"use client";

import { FadeIn } from "@/components/FadeIn";
import { ShieldCheck, Truck, Headphones, Sparkles } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="min-h-screen pt-32 pb-24">
      {/* Hero */}
      <section className="container mx-auto px-6 max-w-4xl text-center mb-20">
        <FadeIn>
          <h1 className="text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            About <span className="text-transparent bg-clip-text bg-gradient-to-br from-purple-400 to-fuchsia-600">DropCart</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            We're redefining e-commerce with curated drops, premium quality, and lightning-fast delivery. Every product is handpicked for style, performance, and value.
          </p>
        </FadeIn>
      </section>

      {/* Values */}
      <section className="container mx-auto px-6 max-w-5xl mb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            { icon: Sparkles, title: "Curated Drops", desc: "Every product in our catalog is handpicked by our team. We partner directly with brands and artisans to bring you exclusive items you won't find anywhere else." },
            { icon: ShieldCheck, title: "Quality Guaranteed", desc: "We stand behind every product we sell. If it doesn't meet your expectations, our hassle-free return policy has you covered within 30 days." },
            { icon: Truck, title: "Express Shipping", desc: "Free nationwide express shipping on orders over ₹5,000. Most orders arrive within 2-4 business days, so you can enjoy your purchase sooner." },
            { icon: Headphones, title: "24/7 Support", desc: "Our dedicated support team is always here to help. Whether it's a question about sizing or tracking your order, we've got your back." },
          ].map((item, i) => (
            <FadeIn key={item.title} delay={0.1 + i * 0.1}>
              <div className="bg-card/40 backdrop-blur-sm border border-border rounded-2xl p-8 hover:border-primary/50 transition-colors h-full">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-5">
                  <item.icon size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="container mx-auto px-6 max-w-4xl mb-20">
        <FadeIn delay={0.3}>
          <div className="bg-gradient-to-br from-purple-500/10 to-fuchsia-500/10 border border-purple-500/20 rounded-3xl p-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { value: "50K+", label: "Happy Customers" },
                { value: "200+", label: "Premium Products" },
                { value: "4.8★", label: "Average Rating" },
                { value: "24h", label: "Avg. Ship Time" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-3xl font-bold text-primary mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-6 max-w-4xl text-center">
        <FadeIn delay={0.4}>
          <h2 className="text-3xl font-bold mb-4">Ready to shop?</h2>
          <p className="text-muted-foreground mb-8">Discover our latest drops and exclusive collections.</p>
          <Link
            href="/products"
            className="inline-flex bg-foreground text-background font-semibold py-4 px-10 rounded-full hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
          >
            Browse Products
          </Link>
        </FadeIn>
      </section>
    </main>
  );
}
