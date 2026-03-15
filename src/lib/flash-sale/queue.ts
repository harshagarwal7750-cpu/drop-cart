/**
 * Purchase Queue System
 * 
 * Sequential queue processor that handles purchase requests one-by-one.
 * In production, replace with BullMQ/Redis Queue for distributed processing.
 * 
 * Guarantees: FIFO ordering, single-threaded processing, position tracking.
 */

interface QueueEntry {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  timestamp: number;
  resolve: (result: QueueResult) => void;
}

export interface QueueResult {
  success: boolean;
  position?: number;
  slotId?: string;
  message: string;
  waitTime?: number;
}

export interface QueueStatus {
  size: number;
  processing: boolean;
  totalProcessed: number;
  avgProcessingTime: number;
}

// Global queue state
const queue: QueueEntry[] = [];
let processing = false;
let totalProcessed = 0;
let totalProcessingTime = 0;
const userPositions = new Map<string, number>();

// Process one item from the queue
type ProcessFn = (entry: { userId: string; productId: string; quantity: number }) => Promise<{ success: boolean; slotId?: string; message: string }>;

let processFn: ProcessFn | null = null;

/**
 * Set the processor function (called by the API layer)
 */
export function setProcessor(fn: ProcessFn) {
  processFn = fn;
}

/**
 * Add a request to the queue
 * Returns a promise that resolves when the request is processed
 */
export function enqueue(userId: string, productId: string, quantity: number = 1): Promise<QueueResult> {
  return new Promise((resolve) => {
    const id = `q_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const entry: QueueEntry = {
      id,
      userId,
      productId,
      quantity,
      timestamp: Date.now(),
      resolve,
    };

    queue.push(entry);
    const position = queue.length;
    userPositions.set(userId, position);

    // Start processing if not already running
    if (!processing) {
      processQueue();
    }

    // Notify user of their position immediately
    // (the resolve will be called when actually processed)
  });
}

/**
 * Get user's position in queue
 */
export function getPosition(userId: string): number {
  const idx = queue.findIndex((e) => e.userId === userId);
  return idx === -1 ? 0 : idx + 1;
}

/**
 * Get queue status
 */
export function getQueueStatus(): QueueStatus {
  return {
    size: queue.length,
    processing,
    totalProcessed,
    avgProcessingTime: totalProcessed > 0 ? Math.round(totalProcessingTime / totalProcessed) : 0,
  };
}

/**
 * Clear the queue (for reset)
 */
export function clearQueue(): void {
  while (queue.length > 0) {
    const entry = queue.shift()!;
    entry.resolve({
      success: false,
      message: "Queue cleared — sale reset",
    });
  }
  userPositions.clear();
  totalProcessed = 0;
  totalProcessingTime = 0;
  processing = false;
}

/**
 * Sequential queue processor
 */
async function processQueue() {
  if (processing || !processFn) return;
  processing = true;

  while (queue.length > 0) {
    const entry = queue.shift()!;
    userPositions.delete(entry.userId);

    const start = Date.now();

    try {
      const result = await processFn({
        userId: entry.userId,
        productId: entry.productId,
        quantity: entry.quantity,
      });

      const elapsed = Date.now() - start;
      totalProcessed++;
      totalProcessingTime += elapsed;

      entry.resolve({
        success: result.success,
        slotId: result.slotId,
        message: result.message,
        waitTime: Date.now() - entry.timestamp,
      });
    } catch (error) {
      entry.resolve({
        success: false,
        message: "Internal processing error",
      });
    }

    // Small delay between processing to simulate real-world latency
    await new Promise((r) => setTimeout(r, 50));
  }

  processing = false;
}
