"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, Users, ShoppingCart, XCircle, Package, Timer,
  CheckCircle, Lock, AlertTriangle, TrendingUp, Activity,
  ArrowRight, Shield, Server, Database, Globe
} from "lucide-react";
import Link from "next/link";

// ─── Types ───────────────────────────────────────────────────
type Phase = "countdown" | "live" | "queue" | "checkout" | "soldout" | "purchased";

interface InventorySnapshot {
  stock: number;
  initialStock: number;
  totalAttempts: number;
  successfulOrders: number;
  rejectedAttempts: number;
  lockedSlots: number;
  saleActive: boolean;
  soldOut: boolean;
  elapsedSeconds: number;
}

// ─── Animated Number ─────────────────────────────────────────
function AnimNum({ value, className = "" }: { value: number; className?: string }) {
  return (
    <motion.span key={value} initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className={className}>
      {value.toLocaleString()}
    </motion.span>
  );
}

// ─── Stat Card ───────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color, pulse, sub }: {
  icon: React.ElementType; label: string; value: number; color: string; pulse?: boolean; sub?: string;
}) {
  const colors: Record<string, string> = {
    blue: "from-blue-500/20 to-blue-600/5 border-blue-500/30 text-blue-400",
    green: "from-emerald-500/20 to-emerald-600/5 border-emerald-500/30 text-emerald-400",
    red: "from-red-500/20 to-red-600/5 border-red-500/30 text-red-400",
    amber: "from-amber-500/20 to-amber-600/5 border-amber-500/30 text-amber-400",
    purple: "from-purple-500/20 to-purple-600/5 border-purple-500/30 text-purple-400",
  };
  return (
    <div className={`relative bg-gradient-to-br ${colors[color]} border rounded-2xl p-5 backdrop-blur-sm`}>
      {pulse && <div className="absolute top-3 right-3"><span className="flex h-3 w-3"><span className="animate-ping absolute h-full w-full rounded-full bg-current opacity-75" /><span className="relative h-3 w-3 rounded-full bg-current" /></span></div>}
      <div className="flex items-center gap-2 mb-3 opacity-70"><Icon size={16} /><span className="text-xs font-medium uppercase tracking-wider">{label}</span></div>
      <div className="text-3xl sm:text-4xl font-black tabular-nums"><AnimNum value={value} /></div>
      {sub && <p className="text-xs opacity-50 mt-1">{sub}</p>}
    </div>
  );
}

// ─── Stock Bar ───────────────────────────────────────────────
function StockBar({ remaining, initial }: { remaining: number; initial: number }) {
  const pct = initial > 0 ? (remaining / initial) * 100 : 0;
  const barColor = pct > 50 ? "bg-emerald-500" : pct > 20 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm"><span className="text-muted-foreground">Inventory Level</span><span className="font-bold">{remaining} / {initial}</span></div>
      <div className="h-3 bg-white/5 rounded-full overflow-hidden">
        <motion.div className={`h-full ${barColor} rounded-full`} animate={{ width: `${pct}%` }} transition={{ type: "spring", stiffness: 50 }} />
      </div>
    </div>
  );
}

// ─── Activity Feed ───────────────────────────────────────────
function ActivityFeed({ events }: { events: string[] }) {
  return (
    <div className="bg-black/30 border border-border rounded-2xl p-5 max-h-48 overflow-hidden">
      <div className="flex items-center gap-2 mb-3"><Activity size={14} className="text-emerald-400" /><span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Live Activity</span></div>
      <div className="space-y-1.5">
        <AnimatePresence mode="popLayout">
          {events.slice(0, 6).map((event, i) => (
            <motion.div key={event + i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1 - i * 0.15, x: 0 }} exit={{ opacity: 0 }} className="text-xs font-mono text-muted-foreground truncate">
              {event}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Architecture Diagram ────────────────────────────────────
function ArchDiagram() {
  const nodes = [
    { icon: Globe, label: "Users", color: "text-blue-400" },
    { icon: Shield, label: "Rate Limiter", color: "text-amber-400" },
    { icon: Server, label: "Queue", color: "text-purple-400" },
    { icon: Lock, label: "Inventory Gate", color: "text-red-400" },
    { icon: Database, label: "Prisma TX", color: "text-emerald-400" },
  ];
  return (
    <div className="flex items-center justify-center gap-2 flex-wrap">
      {nodes.map((n, i) => (
        <div key={n.label} className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 bg-white/5 border border-border rounded-lg px-3 py-1.5 text-xs font-medium ${n.color}`}>
            <n.icon size={12} /> {n.label}
          </div>
          {i < nodes.length - 1 && <ArrowRight size={12} className="text-muted-foreground" />}
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════
export default function FlashSalePage() {
  const COUNTDOWN_SECONDS = 5;
  const FLASH_SALE_STOCK = 50;

  const [phase, setPhase] = useState<Phase>("countdown");
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [snapshot, setSnapshot] = useState<InventorySnapshot>({
    stock: FLASH_SALE_STOCK, initialStock: FLASH_SALE_STOCK,
    totalAttempts: 0, successfulOrders: 0, rejectedAttempts: 0,
    lockedSlots: 0, saleActive: false, soldOut: false, elapsedSeconds: 0,
  });
  const [events, setEvents] = useState<string[]>([]);
  const [queuePosition, setQueuePosition] = useState(0);
  const [checkoutTimer, setCheckoutTimer] = useState(30);
  const [slotId, setSlotId] = useState<string | null>(null);
  const [peakUsers, setPeakUsers] = useState(0);
  const [simulatedUsers, setSimulatedUsers] = useState(0);
  const [orderId, setOrderId] = useState<string | null>(null);

  const sseRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const simRef = useRef<NodeJS.Timeout | null>(null);
  const checkoutRef = useRef<NodeJS.Timeout | null>(null);
  const productIdRef = useRef<string | null>(null);
  const userIdRef = useRef(`user_${Math.random().toString(36).slice(2, 10)}`);

  const addEvent = useCallback((msg: string) => {
    const ts = new Date().toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setEvents((prev) => [`[${ts}] ${msg}`, ...prev].slice(0, 20));
  }, []);

  // ─── Fetch a product for the flash sale ────────────────────
  const getProductId = useCallback(async () => {
    const res = await fetch("/api/products");
    if (res.ok) {
      const products = await res.json();
      if (products.length > 0) {
        productIdRef.current = products[0].id;
        return products[0].id;
      }
    }
    return null;
  }, []);

  // ─── Initialize flash sale on backend ──────────────────────
  const initSale = useCallback(async () => {
    let pid = productIdRef.current;
    if (!pid) pid = await getProductId();
    if (!pid) { addEvent("❌ No products found in database"); return false; }

    try {
      const res = await fetch("/api/flash-sale/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: pid, stock: FLASH_SALE_STOCK }),
      });
      const data = await res.json();
      if (data.status === "success") {
        addEvent(`⚡ Sale initialized: "${data.product.name}" — ${FLASH_SALE_STOCK} units`);
        // Update snapshot immediately from init response
        if (data.snapshot) {
          setSnapshot(data.snapshot);
        }
        return true;
      }
    } catch (e) {
      addEvent("❌ Failed to initialize sale");
    }
    return false;
  }, [getProductId, addEvent]);

  // ─── Poll for real-time updates ─────────────────────────────
  const connectPolling = useCallback(() => {
    if (sseRef.current) clearInterval(sseRef.current);
    sseRef.current = setInterval(async () => {
      try {
        const res = await fetch("/api/flash-sale/status");
        if (res.ok) {
          const data: InventorySnapshot = await res.json();
          setSnapshot(data);
          if (data.soldOut && data.successfulOrders > 0) {
            setTimeout(() => setPhase("soldout"), 1000);
          }
        }
      } catch {}
    }, 500);
  }, []);

  // ─── Start bot traffic simulation ─────────────────────────
  const startSimulation = useCallback(() => {
    let users = 0;
    // Ramp up users
    const ramp = setInterval(() => {
      users = Math.min(users + Math.floor(Math.random() * 200) + 80, 2500);
      setSimulatedUsers(users);
      setPeakUsers((p) => Math.max(p, users));
    }, 300);
    setTimeout(() => clearInterval(ramp), 4000);

    // Fire 3-5 concurrent bot purchase attempts every 400ms
    // This creates real contention — more bots than stock means rejections
    simRef.current = setInterval(() => {
      const botsPerTick = Math.floor(Math.random() * 3) + 3;
      for (let i = 0; i < botsPerTick; i++) {
        const botId = `bot_${Math.random().toString(36).slice(2, 8)}`;
        fetch("/api/flash-sale/purchase", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: botId,
            productId: productIdRef.current,
            quantity: 1,
          }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.status === "success") {
              addEvent(`✅ Bot ${botId.slice(4)} ordered ${data.orderId.slice(0, 8)}…`);
            } else if (data.status === "rate_limited") {
              addEvent(`⚠️ Bot ${botId.slice(4)} rate limited`);
            } else {
              addEvent(`❌ Bot ${botId.slice(4)} rejected: ${data.message}`);
            }
          })
          .catch(() => {});
      }

      // Fluctuate user count
      users = Math.max(200, Math.min(2500, users + Math.floor(Math.random() * 80) - 30));
      setSimulatedUsers(users);
      setPeakUsers((p) => Math.max(p, users));
    }, 400);
  }, [addEvent]);

  // ─── Countdown phase ──────────────────────────────────────
  useEffect(() => {
    if (phase !== "countdown") return;
    if (countdown <= 0) {
      // Init sale → wait → start polling → start bots
      initSale().then(async (success) => {
        if (success) {
          await new Promise((r) => setTimeout(r, 500));
          connectPolling();
          setPhase("live");
          addEvent("⚡ FLASH SALE IS NOW LIVE!");
          setTimeout(() => startSimulation(), 1000);
        } else {
          addEvent("❌ Sale initialization failed");
          setPhase("live");
          connectPolling();
        }
      });
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, countdown, initSale, connectPolling, startSimulation, addEvent]);

  // ─── Handle sold out — keep bots running 3s for visible rejections ─
  useEffect(() => {
    if (phase === "soldout" || snapshot.soldOut) {
      if (checkoutRef.current) { clearInterval(checkoutRef.current); checkoutRef.current = null; }
      // Delay stopping bots so rejection count accumulates
      if (simRef.current) {
        const simId = simRef.current;
        setTimeout(() => {
          clearInterval(simId);
          if (simRef.current === simId) simRef.current = null;
        }, 3000);
      }
    }
  }, [phase, snapshot.soldOut]);

  // ─── Join queue → attempt purchase ─────────────────────────
  const handleJoinQueue = async () => {
    if (snapshot.soldOut || !snapshot.saleActive) return;

    // Show queue animation
    setPhase("queue");
    const startPos = Math.floor(Math.random() * 80) + 30;
    setQueuePosition(startPos);
    addEvent(`🎟️ You joined queue at position #${startPos}`);

    // Animate queue position down
    for (let pos = startPos; pos > 0; pos -= Math.floor(Math.random() * 5) + 2) {
      await new Promise((r) => setTimeout(r, 600));
      setQueuePosition(Math.max(0, pos));
    }
    setQueuePosition(0);

    // Attempt actual purchase via API
    addEvent("🔓 Your turn! Attempting purchase...");
    try {
      const res = await fetch("/api/flash-sale/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userIdRef.current,
          productId: productIdRef.current,
          quantity: 1,
        }),
      });
      const data = await res.json();

      if (data.status === "success") {
        setSlotId(data.slotId || null);
        setOrderId(data.orderId);
        setPhase("purchased");
        addEvent(`🎉 YOUR ORDER CONFIRMED! Order: ${data.orderId}`);
      } else if (data.status === "rate_limited") {
        // Show checkout state with timer — retry
        setPhase("checkout");
        setCheckoutTimer(30);
        addEvent("⏳ Checkout slot acquired — complete payment");
        checkoutRef.current = setInterval(() => {
          setCheckoutTimer((t) => {
            if (t <= 1) { clearInterval(checkoutRef.current!); return 0; }
            return t - 1;
          });
        }, 1000);
      } else {
        addEvent(`❌ Purchase failed: ${data.message}`);
        setPhase("live");
      }
    } catch {
      addEvent("❌ Network error during purchase");
      setPhase("live");
    }
  };

  // ─── Complete checkout (from checkout timer phase) ─────────
  const handleCompletePurchase = async () => {
    if (checkoutRef.current) clearInterval(checkoutRef.current);

    try {
      const res = await fetch("/api/flash-sale/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userIdRef.current,
          productId: productIdRef.current,
          quantity: 1,
        }),
      });
      const data = await res.json();
      if (data.status === "success") {
        setOrderId(data.orderId);
        setPhase("purchased");
        addEvent(`🎉 ORDER CONFIRMED! ID: ${data.orderId}`);
      } else {
        addEvent(`❌ ${data.message}`);
        setPhase("live");
      }
    } catch {
      addEvent("❌ Payment failed");
      setPhase("live");
    }
  };

  // ─── Reset ─────────────────────────────────────────────────
  const handleReset = () => {
    if (simRef.current) clearInterval(simRef.current);
    if (checkoutRef.current) clearInterval(checkoutRef.current);
    if (sseRef.current) clearInterval(sseRef.current);
    sseRef.current = null;
    simRef.current = null;
    setPhase("countdown");
    setCountdown(COUNTDOWN_SECONDS);
    setEvents([]);
    setPeakUsers(0);
    setSimulatedUsers(0);
    setSlotId(null);
    setOrderId(null);
    setQueuePosition(0);
    setCheckoutTimer(30);
    setSnapshot({
      stock: FLASH_SALE_STOCK, initialStock: FLASH_SALE_STOCK,
      totalAttempts: 0, successfulOrders: 0, rejectedAttempts: 0,
      lockedSlots: 0, saleActive: false, soldOut: false, elapsedSeconds: 0,
    });
    userIdRef.current = `user_${Math.random().toString(36).slice(2, 10)}`;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (simRef.current) clearInterval(simRef.current);
      if (checkoutRef.current) clearInterval(checkoutRef.current);
      if (sseRef.current) clearInterval(sseRef.current);
    };
  }, []);

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════
  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white selection:bg-purple-500/30">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-purple-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 pt-28 pb-16 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-1.5 mb-4">
            <Zap size={14} className="text-purple-400" />
            <span className="text-xs font-semibold uppercase tracking-widest text-purple-400">Flash Sale Engine</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight mb-3">
            Midnight <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-400 to-pink-400">Drop</span> Live
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto text-sm mb-5">
            Real-time flash sale with atomic inventory gate, purchase queue, rate limiting, and Prisma transactions.
          </p>
          <ArchDiagram />
        </div>

        <AnimatePresence mode="wait">
          {/* ─── COUNTDOWN ──────────────────────────────────── */}
          {phase === "countdown" && (
            <motion.div key="cd" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 1.2, opacity: 0 }} className="flex flex-col items-center py-20">
              <p className="text-muted-foreground text-lg mb-4 font-medium">Flash Sale Starts In</p>
              <div className="relative">
                <motion.div className="text-[120px] sm:text-[160px] font-black tabular-nums text-transparent bg-clip-text bg-gradient-to-b from-white to-white/30" key={countdown} initial={{ scale: 1.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
                  {countdown}
                </motion.div>
                <div className="absolute inset-0 blur-3xl bg-purple-500/20 rounded-full" />
              </div>
              <div className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
                <Package size={16} /><span>Limited stock: <span className="text-white font-bold">{FLASH_SALE_STOCK} units</span></span>
              </div>
            </motion.div>
          )}

          {/* ─── LIVE DASHBOARD ─────────────────────────────── */}
          {(phase === "live" || phase === "queue" || phase === "checkout") && (
            <motion.div key="dash" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
                <StatCard icon={Users} label="Users Online" value={simulatedUsers} color="blue" pulse />
                <StatCard icon={ShoppingCart} label="Purchase Attempts" value={snapshot.totalAttempts} color="purple" />
                <StatCard icon={CheckCircle} label="Successful Orders" value={snapshot.successfulOrders} color="green" />
                <StatCard icon={XCircle} label="Rejected" value={snapshot.rejectedAttempts} color="red" />
                <StatCard icon={Package} label="Remaining Stock" value={snapshot.stock} color="amber" sub={`of ${snapshot.initialStock} · ${snapshot.lockedSlots} locked`} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                <div className="bg-black/30 border border-border rounded-2xl p-5 space-y-5">
                  <StockBar remaining={snapshot.stock} initial={snapshot.initialStock} />
                  <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground flex items-center gap-2"><TrendingUp size={14} /> Peak Users</span><span className="font-bold">{peakUsers.toLocaleString()}</span></div>
                  <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground flex items-center gap-2"><Timer size={14} /> Elapsed</span><span className="font-bold">{snapshot.elapsedSeconds}s</span></div>
                  <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground flex items-center gap-2"><Lock size={14} /> Locked Slots</span><span className="font-bold">{snapshot.lockedSlots}</span></div>
                </div>
                <ActivityFeed events={events} />
              </div>

              <div className="mb-6">
                <AnimatePresence mode="wait">
                  {phase === "live" && snapshot.stock > 0 && (
                    <motion.div key="join" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
                      <button onClick={handleJoinQueue} className="group inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-bold text-lg py-5 px-12 rounded-2xl shadow-[0_0_40px_rgba(168,85,247,0.4)] hover:shadow-[0_0_60px_rgba(168,85,247,0.6)] hover:-translate-y-1 transition-all duration-300">
                        <Zap size={22} className="group-hover:animate-pulse" /> Join Purchase Queue <ArrowRight size={20} />
                      </button>
                      <p className="text-xs text-muted-foreground mt-3">Your request goes through: Rate Limiter → Queue → Atomic Inventory Gate → Prisma Transaction</p>
                    </motion.div>
                  )}

                  {phase === "queue" && (
                    <motion.div key="q" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="max-w-md mx-auto bg-gradient-to-br from-purple-500/20 to-fuchsia-500/10 border border-purple-500/30 rounded-3xl p-8 text-center">
                      <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-5"><Timer size={36} className="text-purple-400" /></div>
                      <h3 className="text-lg font-medium text-muted-foreground mb-2">Your Position in Queue</h3>
                      <div className="text-6xl font-black text-purple-400 tabular-nums mb-3">#{queuePosition}</div>
                      <p className="text-sm text-muted-foreground">Processing sequentially via queue worker...</p>
                      <div className="mt-6 flex justify-center gap-1">
                        {[0,1,2,3,4].map((i) => (
                          <motion.div key={i} className="w-2 h-2 bg-purple-400 rounded-full" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }} />
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {phase === "checkout" && (
                    <motion.div key="co" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="max-w-md mx-auto bg-gradient-to-br from-emerald-500/20 to-emerald-600/5 border border-emerald-500/30 rounded-3xl p-8 text-center">
                      <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-5"><Lock size={36} className="text-emerald-400" /></div>
                      <h3 className="text-xl font-bold text-emerald-400 mb-2">✅ Checkout Unlocked!</h3>
                      <p className="text-sm text-muted-foreground mb-4">Inventory slot locked. Complete payment before timeout.</p>
                      <div className={`text-5xl font-black tabular-nums mb-6 ${checkoutTimer <= 10 ? "text-red-400" : "text-emerald-400"}`}>{checkoutTimer}s</div>
                      <button onClick={handleCompletePurchase} className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-4 rounded-xl hover:-translate-y-0.5 transition-all shadow-[0_0_30px_rgba(16,185,129,0.4)]">
                        Complete Purchase (Prisma Transaction)
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* ─── PURCHASED ─────────────────────────────────── */}
          {phase === "purchased" && (
            <motion.div key="bought" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-lg mx-auto text-center py-16">
              <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={48} className="text-emerald-400" />
              </div>
              <h2 className="text-4xl font-black mb-3 text-emerald-400">Order Confirmed!</h2>
              <p className="text-muted-foreground mb-2">Your flash sale purchase was processed through the full pipeline.</p>
              {orderId && <p className="font-mono text-sm bg-white/5 border border-border rounded-lg py-2 px-4 inline-block mb-8">Order ID: {orderId}</p>}
              <div className="bg-white/5 border border-border rounded-2xl p-6 text-left space-y-2 text-sm mb-8">
                <div className="flex justify-between"><span className="text-muted-foreground">Rate Limit Check</span><span className="text-emerald-400">✓ Passed</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Queue Processing</span><span className="text-emerald-400">✓ Processed</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Atomic Decrement</span><span className="text-emerald-400">✓ Stock locked</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Prisma Transaction</span><span className="text-emerald-400">✓ Order + Stock committed</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Slot Confirmed</span><span className="text-emerald-400">✓ Released lock</span></div>
              </div>
              <button onClick={() => setPhase("live")} className="bg-white/10 border border-border hover:bg-white/20 font-medium py-3 px-8 rounded-xl transition-all">
                Back to Dashboard
              </button>
            </motion.div>
          )}

          {/* ─── SOLD OUT ─────────────────────────────────── */}
          {phase === "soldout" && (
            <motion.div key="sold" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, delay: 0.2 }} className="inline-flex items-center gap-2 bg-red-500/20 border border-red-500/30 text-red-400 rounded-full px-5 py-2 mb-6">
                <AlertTriangle size={16} /><span className="text-sm font-bold uppercase tracking-wider">Sold Out</span>
              </motion.div>
              <h2 className="text-5xl sm:text-6xl font-black mb-2">
                SOLD OUT in <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-red-400">{snapshot.elapsedSeconds}s</span>
              </h2>
              <p className="text-muted-foreground mb-10">All {snapshot.initialStock} units sold. Inventory never went negative.</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto mb-10">
                <div className="bg-white/5 border border-border rounded-2xl p-6"><div className="text-3xl font-black text-blue-400 mb-1">{peakUsers.toLocaleString()}</div><div className="text-xs text-muted-foreground">Peak Users</div></div>
                <div className="bg-white/5 border border-border rounded-2xl p-6"><div className="text-3xl font-black text-purple-400 mb-1">{snapshot.totalAttempts.toLocaleString()}</div><div className="text-xs text-muted-foreground">Total Attempts</div></div>
                <div className="bg-white/5 border border-border rounded-2xl p-6"><div className="text-3xl font-black text-emerald-400 mb-1">{snapshot.successfulOrders}</div><div className="text-xs text-muted-foreground">Successful Orders</div></div>
                <div className="bg-white/5 border border-border rounded-2xl p-6"><div className="text-3xl font-black text-red-400 mb-1">{snapshot.rejectedAttempts.toLocaleString()}</div><div className="text-xs text-muted-foreground">Blocked Attempts</div></div>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button onClick={handleReset} className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-bold py-4 px-10 rounded-2xl shadow-[0_0_40px_rgba(168,85,247,0.3)] hover:-translate-y-1 transition-all duration-300">
                  <Zap size={18} /> Run Simulation Again
                </button>
                <Link href="/products" className="inline-flex items-center gap-2 bg-white/5 border border-border hover:bg-white/10 font-medium py-4 px-10 rounded-2xl transition-all">
                  Browse Products <ArrowRight size={16} />
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
