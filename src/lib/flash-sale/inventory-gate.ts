/**
 * Atomic Inventory Gate
 * 
 * Uses globalThis for state persistence across Next.js API route module instances.
 * In production, replace with Redis DECR for distributed consistency.
 */

interface InventoryState {
  stock: number;
  initialStock: number;
  totalAttempts: number;
  successfulOrders: number;
  rejectedAttempts: number;
  lockedSlots: Map<string, { expiresAt: number; quantity: number }>;
  saleStartTime: number;
  saleEndTime: number;
  saleActive: boolean;
}

export interface InventorySnapshot {
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

export interface DecrementResult {
  success: boolean;
  remainingStock: number;
  slotId?: string;
  message: string;
}

// Use globalThis to persist state across Next.js hot reloads and module instances
const globalForInventory = globalThis as unknown as {
  __flashSaleState: InventoryState | undefined;
};

function getState(): InventoryState {
  if (!globalForInventory.__flashSaleState) {
    globalForInventory.__flashSaleState = {
      stock: 0,
      initialStock: 0,
      totalAttempts: 0,
      successfulOrders: 0,
      rejectedAttempts: 0,
      lockedSlots: new Map(),
      saleStartTime: 0,
      saleEndTime: 0,
      saleActive: false,
    };
  }
  return globalForInventory.__flashSaleState;
}

// Helper: mark sale as ended and freeze the elapsed time
function markSaleEnded(state: InventoryState): void {
  if (state.saleActive) {
    state.saleActive = false;
    state.saleEndTime = Date.now();
  }
}

// Mutex for atomic operations
let mutexPromise: Promise<void> = Promise.resolve();

function withMutex<T>(fn: () => T): Promise<T> {
  let resolve: () => void;
  const next = new Promise<void>((r) => (resolve = r));
  const prev = mutexPromise;
  mutexPromise = next;
  return prev.then(() => {
    try {
      return fn();
    } finally {
      resolve!();
    }
  });
}

function generateSlotId(): string {
  return `slot_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// ─── Public API ──────────────────────────────────────────────

export function initializeInventory(stock: number): void {
  const state = getState();
  state.stock = stock;
  state.initialStock = stock;
  state.totalAttempts = 0;
  state.successfulOrders = 0;
  state.rejectedAttempts = 0;
  state.lockedSlots.clear();
  state.saleStartTime = Date.now();
  state.saleEndTime = 0;
  state.saleActive = true;
}

export function atomicDecrement(userId: string, quantity: number = 1): Promise<DecrementResult> {
  return withMutex(() => {
    const state = getState();
    state.totalAttempts++;

    // Clean expired slots
    const now = Date.now();
    for (const [slotId, slot] of state.lockedSlots) {
      if (slot.expiresAt < now) {
        state.stock += slot.quantity;
        state.lockedSlots.delete(slotId);
      }
    }

    if (!state.saleActive) {
      state.rejectedAttempts++;
      return { success: false, remainingStock: state.stock, message: "Flash sale is not active" };
    }

    if (state.stock < quantity) {
      state.rejectedAttempts++;
      if (state.stock === 0 && state.lockedSlots.size === 0) markSaleEnded(state);
      return {
        success: false,
        remainingStock: state.stock,
        message: state.stock === 0 ? "SOLD OUT — All stock has been purchased" : `Insufficient stock`,
      };
    }

    state.stock -= quantity;
    const slotId = generateSlotId();
    state.lockedSlots.set(slotId, { expiresAt: now + 30_000, quantity });

    return { success: true, remainingStock: state.stock, slotId, message: "Purchase slot acquired" };
  });
}

export function confirmSlot(slotId: string): Promise<boolean> {
  return withMutex(() => {
    const state = getState();
    const slot = state.lockedSlots.get(slotId);
    if (!slot) return false;
    state.lockedSlots.delete(slotId);
    state.successfulOrders++;
    if (state.stock === 0 && state.lockedSlots.size === 0) markSaleEnded(state);
    return true;
  });
}

export function releaseSlot(slotId: string): Promise<boolean> {
  return withMutex(() => {
    const state = getState();
    const slot = state.lockedSlots.get(slotId);
    if (!slot) return false;
    state.stock += slot.quantity;
    state.lockedSlots.delete(slotId);
    return true;
  });
}

export function getSnapshot(): InventorySnapshot {
  const state = getState();

  // Freeze elapsed time once sale ends
  let elapsed = 0;
  if (state.saleStartTime > 0) {
    const endPoint = state.saleEndTime > 0 ? state.saleEndTime : Date.now();
    elapsed = (endPoint - state.saleStartTime) / 1000;
  }

  return {
    stock: state.stock,
    initialStock: state.initialStock,
    totalAttempts: state.totalAttempts,
    successfulOrders: state.successfulOrders,
    rejectedAttempts: state.rejectedAttempts,
    lockedSlots: state.lockedSlots.size,
    saleActive: state.saleActive,
    soldOut: state.stock === 0 && state.lockedSlots.size === 0 && state.successfulOrders > 0,
    elapsedSeconds: Math.round(elapsed * 10) / 10,
  };
}

export function isSaleActive(): boolean {
  return getState().saleActive;
}

export function endSale(): void {
  markSaleEnded(getState());
}
