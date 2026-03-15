"use client";

import Link from "next/link";
import { ArrowRight, ShoppingBag, ShieldCheck, Truck, Zap } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col justify-center pb-16 pt-20">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-900/10 dark:bg-purple-900/20 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-fuchsia-900/5 dark:bg-fuchsia-900/10 rounded-full blur-[150px]"></div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="container mx-auto px-6 relative z-10 text-center max-w-4xl py-20"
        >
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-6xl md:text-8xl font-black mb-6 tracking-tighter"
          >
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-fuchsia-600">DropCart</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-xl md:text-2xl text-muted-foreground mb-12 font-light max-w-2xl mx-auto leading-relaxed"
          >
            A premium e-commerce experience featuring exclusive tech drops, striking modern aesthetics, and ultra-fast performance.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          >
            <Link 
              href="/products" 
              className="group flex items-center gap-2 bg-primary text-primary-foreground font-semibold py-4 px-8 rounded-full hover:scale-105 transition-all duration-300 shadow-xl shadow-primary/20 hover:shadow-primary/40 text-lg w-full sm:w-auto justify-center"
            >
              Start Shopping
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="/admin/products" 
              className="flex items-center justify-center gap-2 bg-secondary border border-border text-foreground font-medium py-4 px-8 rounded-full hover:bg-secondary/80 transition-colors duration-300 text-lg w-full sm:w-auto"
            >
              Go to Admin
            </Link>
            <Link 
              href="/flash-sale" 
              className="group flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white font-semibold py-4 px-8 rounded-full hover:scale-105 transition-all duration-300 shadow-xl shadow-purple-500/20 hover:shadow-purple-500/40 text-lg w-full sm:w-auto"
            >
              <Zap size={20} className="group-hover:animate-pulse" />
              Flash Sale
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Trust Badges / Features */}
      <section className="container mx-auto px-6 py-20 border-t border-border mt-10 overflow-hidden">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            visible: { transition: { staggerChildren: 0.2 } },
            hidden: {}
          }}
          className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center"
        >
          <motion.div variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } }} className="flex flex-col items-center p-6 bg-card/50 rounded-2xl border border-border">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6"><ShoppingBag size={28} /></div>
            <h3 className="text-xl font-semibold mb-3">Curated Drops</h3>
            <p className="text-muted-foreground font-light leading-relaxed">Meticulously selected products that meet our highest standards of design and durability.</p>
          </motion.div>
          <motion.div variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } }} className="flex flex-col items-center p-6 bg-card/50 rounded-2xl border border-border">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6"><Truck size={28} /></div>
            <h3 className="text-xl font-semibold mb-3">Express Delivery</h3>
            <p className="text-muted-foreground font-light leading-relaxed">Complimentary lightning-fast delivery on all orders over ₹5,000 nationwide.</p>
          </motion.div>
          <motion.div variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } }} className="flex flex-col items-center p-6 bg-card/50 rounded-2xl border border-border">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6"><ShieldCheck size={28} /></div>
            <h3 className="text-xl font-semibold mb-3">Secure Vault</h3>
            <p className="text-muted-foreground font-light leading-relaxed">Your payment information is processed securely with bank-level encryption.</p>
          </motion.div>
        </motion.div>
      </section>
    </main>
  );
}
