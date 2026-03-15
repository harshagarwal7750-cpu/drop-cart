"use client";

import { FadeIn } from "@/components/FadeIn";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import { useState } from "react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <main className="min-h-screen pt-32 pb-24 container mx-auto px-6 max-w-5xl">
      <FadeIn>
        <h1 className="text-5xl lg:text-6xl font-bold tracking-tight mb-4">
          Get in <span className="text-transparent bg-clip-text bg-gradient-to-br from-purple-400 to-fuchsia-600">Touch</span>
        </h1>
        <p className="text-lg text-muted-foreground mb-14 max-w-xl">
          Have a question, feedback, or partnership inquiry? We'd love to hear from you.
        </p>
      </FadeIn>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
        {/* Contact Form */}
        <div className="lg:col-span-3">
          <FadeIn delay={0.1}>
            {submitted ? (
              <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-10 text-center">
                <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-5">
                  <Send size={28} />
                </div>
                <h2 className="text-2xl font-bold mb-3">Message Sent!</h2>
                <p className="text-muted-foreground">We'll get back to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6 bg-card/40 backdrop-blur-sm border border-border rounded-2xl p-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Name</label>
                    <input required className="w-full bg-background border border-border rounded-lg p-3 outline-none focus:border-primary transition-colors" placeholder="Your name" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <input required type="email" className="w-full bg-background border border-border rounded-lg p-3 outline-none focus:border-primary transition-colors" placeholder="you@example.com" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Subject</label>
                  <input required className="w-full bg-background border border-border rounded-lg p-3 outline-none focus:border-primary transition-colors" placeholder="How can we help?" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Message</label>
                  <textarea required rows={5} className="w-full bg-background border border-border rounded-lg p-3 outline-none focus:border-primary transition-colors resize-none" placeholder="Tell us more..." />
                </div>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 bg-foreground text-background font-semibold py-4 rounded-xl hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
                >
                  Send Message <Send size={18} />
                </button>
              </form>
            )}
          </FadeIn>
        </div>

        {/* Contact Info */}
        <div className="lg:col-span-2 space-y-6">
          {[
            { icon: Mail, title: "Email", value: "support@dropcart.in", href: "mailto:support@dropcart.in" },
            { icon: Phone, title: "Phone", value: "+91 98765 43210", href: "tel:+919876543210" },
            { icon: MapPin, title: "Address", value: "123 Commerce Street\nBengaluru, KA 560001\nIndia", href: null },
          ].map((item, i) => (
            <FadeIn key={item.title} delay={0.2 + i * 0.1}>
              <div className="bg-card/40 backdrop-blur-sm border border-border rounded-2xl p-6 flex gap-4 items-start hover:border-primary/50 transition-colors">
                <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center flex-shrink-0">
                  <item.icon size={20} />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  {item.href ? (
                    <a href={item.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      {item.value}
                    </a>
                  ) : (
                    <p className="text-sm text-muted-foreground whitespace-pre-line">{item.value}</p>
                  )}
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </main>
  );
}
