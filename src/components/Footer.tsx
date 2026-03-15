import Link from "next/link";
import { Facebook, Twitter, Instagram, Github } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-20 py-16 bg-card border-t border-border">
      <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between flex-wrap gap-12 mb-12">
        <div className="max-w-[300px]">
          <Link href="/" className="inline-flex items-center gap-1 font-bold text-2xl tracking-tight mb-4">
            <span>Drop</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-purple-400 to-fuchsia-600">Cart</span>
          </Link>
          <p className="mt-2 text-muted-foreground text-sm font-light leading-relaxed">
            Your destination for curated, premium electronics, accessories, and beyond. Upgraded shopping begins here.
          </p>
          <div className="flex gap-4 mt-6">
            <Link href="#" className="p-2 rounded-full bg-secondary text-secondary-foreground hover:text-primary transition-colors"><Twitter size={18} /></Link>
            <Link href="#" className="p-2 rounded-full bg-secondary text-secondary-foreground hover:text-primary transition-colors"><Instagram size={18} /></Link>
            <Link href="#" className="p-2 rounded-full bg-secondary text-secondary-foreground hover:text-primary transition-colors"><Facebook size={18} /></Link>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-16">
          <div className="flex flex-col min-w-[120px]">
            <h3 className="mb-6 text-lg font-semibold text-foreground">Shop</h3>
            <Link href="/products" className="mb-3 text-muted-foreground text-sm hover:text-primary transition-colors hover:translate-x-1 duration-300">All Products</Link>
            <Link href="/products?category=Electronics" className="mb-3 text-muted-foreground text-sm hover:text-primary transition-colors hover:translate-x-1 duration-300">Electronics</Link>
            <Link href="/products?category=Accessories" className="mb-3 text-muted-foreground text-sm hover:text-primary transition-colors hover:translate-x-1 duration-300">Accessories</Link>
            <Link href="/cart" className="mb-3 text-muted-foreground text-sm hover:text-primary transition-colors hover:translate-x-1 duration-300">View Cart</Link>
          </div>
          <div className="flex flex-col min-w-[120px]">
            <h3 className="mb-6 text-lg font-semibold text-foreground">Support</h3>
            <Link href="/faq" className="mb-3 text-muted-foreground text-sm hover:text-primary transition-colors hover:translate-x-1 duration-300">Help Center</Link>
            <Link href="/shipping" className="mb-3 text-muted-foreground text-sm hover:text-primary transition-colors hover:translate-x-1 duration-300">Shipping Info</Link>
            <Link href="/returns" className="mb-3 text-muted-foreground text-sm hover:text-primary transition-colors hover:translate-x-1 duration-300">Returns</Link>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-6 text-center text-muted-foreground text-sm pt-8 border-t border-border">
        <p>&copy; {currentYear} DropCart. All rights reserved.</p>
      </div>
    </footer>
  );
}
