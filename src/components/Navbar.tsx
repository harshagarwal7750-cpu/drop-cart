"use client";

import Link from "next/link";
import { ShoppingBag, Search, Menu, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useEffect, useState, useRef } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useRouter } from "next/navigation";

interface SearchResult {
  id: string;
  name: string;
  price: string;
  category: string;
}

export default function Navbar() {
  const { cartCount } = useCart();
  const [mounted, setMounted] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/products/search?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data);
        }
      } catch {}
      setSearching(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleResultClick = (id: string) => {
    setSearchOpen(false);
    setSearchQuery("");
    router.push(`/products/${id}`);
  };

  return (
    <>
      <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-white/5">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1 font-bold text-2xl tracking-tight">
            <span>Drop</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-purple-400 to-fuchsia-600">Cart</span>
          </Link>

          <nav className="hidden md:flex gap-8">
            <Link href="/products" className="text-sm font-medium uppercase tracking-widest hover:text-primary transition-colors">Shop</Link>
            <Link href="/about" className="text-sm font-medium uppercase tracking-widest hover:text-primary transition-colors">About</Link>
            <Link href="/contact" className="text-sm font-medium uppercase tracking-widest hover:text-primary transition-colors">Contact</Link>
          </nav>

          <div className="flex items-center gap-4 sm:gap-6">
            <ThemeToggle />
            <button onClick={() => setSearchOpen(true)} className="text-foreground hover:text-primary hover:scale-110 transition-all" aria-label="Search">
              <Search size={20} />
            </button>
            <Link href="/cart" className="relative text-foreground hover:text-primary hover:scale-110 transition-all" aria-label="Cart">
              <ShoppingBag size={20} />
              {mounted && cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[10px] font-bold h-[18px] min-w-[18px] rounded-full flex items-center justify-center px-1">
                  {cartCount}
                </span>
              )}
            </Link>
            <button className="md:hidden text-foreground flex items-center" aria-label="Menu">
              <Menu size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* Search Overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-[60] bg-background/95 backdrop-blur-xl flex flex-col items-center pt-32 px-6">
          <button onClick={() => { setSearchOpen(false); setSearchQuery(""); }} className="absolute top-6 right-6 text-muted-foreground hover:text-foreground transition-colors">
            <X size={28} />
          </button>
          <div className="w-full max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={22} />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full bg-card border border-border rounded-2xl py-5 pl-14 pr-6 text-lg outline-none focus:border-primary transition-colors"
              />
            </div>

            {searching && <p className="text-sm text-muted-foreground mt-6 text-center">Searching...</p>}

            {searchResults.length > 0 && (
              <div className="mt-6 bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border">
                {searchResults.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleResultClick(product.id)}
                    className="w-full flex items-center justify-between p-5 hover:bg-primary/5 transition-colors text-left"
                  >
                    <div>
                      <h4 className="font-medium">{product.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{product.category}</p>
                    </div>
                    <span className="font-semibold text-primary">₹{Number(product.price).toLocaleString("en-IN")}</span>
                  </button>
                ))}
              </div>
            )}

            {searchQuery && !searching && searchResults.length === 0 && (
              <p className="text-sm text-muted-foreground mt-6 text-center">No products found for &quot;{searchQuery}&quot;</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
