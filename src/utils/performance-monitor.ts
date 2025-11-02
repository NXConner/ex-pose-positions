/**
 * Performance monitoring utilities
 * Tracks metrics and provides performance insights
 */

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private enabled = import.meta.env.DEV; // Only in dev by default

  /**
   * Enable or disable performance monitoring
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Measure execution time of a function
   */
  async measure<T>(name: string, fn: () => T | Promise<T>): Promise<T> {
    if (!this.enabled) {
      return await fn();
    }

    const start = performance.now();
    try {
      const result = await fn();
      const end = performance.now();
      this.recordMetric({
        name,
        value: end - start,
        unit: "ms",
        timestamp: Date.now(),
      });
      return result;
    } catch (error) {
      const end = performance.now();
      this.recordMetric({
        name: `${name} (error)`,
        value: end - start,
        unit: "ms",
        timestamp: Date.now(),
      });
      throw error;
    }
  }

  /**
   * Record a custom metric
   */
  recordMetric(metric: PerformanceMetric): void {
    if (!this.enabled) return;
    
    this.metrics.push(metric);
    
    // Keep only last 100 metrics
    if (this.metrics.length > 100) {
      this.metrics.shift();
    }

    // Log in dev mode
    if (import.meta.env.DEV) {
      console.log(`[Performance] ${metric.name}: ${metric.value}${metric.unit}`);
    }
  }

  /**
   * Get all recorded metrics
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Get metrics by name
   */
  getMetricsByName(name: string): PerformanceMetric[] {
    return this.metrics.filter(m => m.name === name);
  }

  /**
   * Get average time for a metric
   */
  getAverageTime(name: string): number {
    const metrics = this.getMetricsByName(name);
    if (metrics.length === 0) return 0;
    
    const total = metrics.reduce((sum, m) => sum + m.value, 0);
    return total / metrics.length;
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = [];
  }

  /**
   * Get performance summary
   */
  getSummary(): Record<string, { count: number; avg: number; min: number; max: number }> {
    const summary: Record<string, { count: number; values: number[] }> = {};

    this.metrics.forEach(metric => {
      if (!summary[metric.name]) {
        summary[metric.name] = { count: 0, values: [] };
      }
      summary[metric.name].count++;
      summary[metric.name].values.push(metric.value);
    });

    const result: Record<string, { count: number; avg: number; min: number; max: number }> = {};
    
    Object.entries(summary).forEach(([name, data]) => {
      const values = data.values;
      result[name] = {
        count: data.count,
        avg: values.reduce((a, b) => a + b, 0) / values.length,
        min: Math.min(...values),
        max: Math.max(...values),
      };
    });

    return result;
  }
}

export const performanceMonitor = new PerformanceMonitor();

// Expose in dev mode
if (import.meta.env.DEV && typeof window !== "undefined") {
  (window as any).__performanceMonitor = performanceMonitor;
}

