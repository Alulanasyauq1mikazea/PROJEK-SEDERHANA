/**
 * Fixed-Capacity Sliding Window Buffer (Ring Buffer)
 * Designed for High-Throughput Time-Series Metrics in NetWatch Pro.
 * 
 * Features:
 * - O(1) Push and Eviction
 * - Predictable Bounded Heap Allocation (Prevents Memory Leaks & GC Spikes)
 * - Array Snapshotting for Fast Canvas/SVG Chart Rendering
 */

export class MetricRingBuffer<T> {
  private buffer: T[] = [];
  private readonly maxSize: number;

  constructor(maxSize: number = 60) {
    this.maxSize = Math.max(10, maxSize);
  }

  /**
   * Push a new metric point. If capacity is reached, removes oldest point in O(1) amortized.
   */
  public push(item: T): void {
    if (this.buffer.length >= this.maxSize) {
      this.buffer.shift();
    }
    this.buffer.push(item);
  }

  /**
   * Push multiple points sequentially with bounded capacity.
   */
  public pushBatch(items: T[]): void {
    for (const item of items) {
      this.push(item);
    }
  }

  /**
   * Returns current snapshot of elements in chronological order.
   */
  public getSnapshot(): T[] {
    return [...this.buffer];
  }

  /**
   * Returns latest point or null.
   */
  public getLatest(): T | null {
    return this.buffer.length > 0 ? this.buffer[this.buffer.length - 1] : null;
  }

  /**
   * Clear buffer contents.
   */
  public clear(): void {
    this.buffer = [];
  }

  /**
   * Current number of buffered points.
   */
  public size(): number {
    return this.buffer.length;
  }
}
