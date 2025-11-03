/**
 * Privacy-first analytics service
 * Only tracks anonymous usage metrics, no personal data
 */

interface AnalyticsEvent {
  name: string;
  category: string;
  timestamp: number;
  properties?: Record<string, unknown>;
}

class Analytics {
  private events: AnalyticsEvent[] = [];
  private enabled = false; // Disabled by default, opt-in only
  private maxEvents = 100; // Limit stored events

  /**
   * Enable or disable analytics
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) {
      this.events = [];
      localStorage.removeItem("analytics_events");
    }
  }

  /**
   * Check if analytics is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Track an event
   */
  track(eventName: string, category: string, properties?: Record<string, unknown>): void {
    if (!this.enabled) return;

    const event: AnalyticsEvent = {
      name: eventName,
      category,
      timestamp: Date.now(),
      properties: this.sanitizeProperties(properties),
    };

    this.events.push(event);

    // Keep only last N events
    if (this.events.length > this.maxEvents) {
      this.events.shift();
    }

    // Save to localStorage (privacy: only anonymous usage data)
    try {
      localStorage.setItem("analytics_events", JSON.stringify(this.events));
    } catch (error) {
      console.warn("Failed to save analytics events:", error);
    }

    // In production, you could send to analytics service here
    // For now, just log in dev mode
    if (import.meta.env.DEV) {
      console.log("[Analytics]", event);
    }
  }

  /**
   * Track an error event
   */
  error(errorInfo: {
    message: string;
    category?: string;
    componentStack?: string;
    level?: string;
  }): void {
    this.track('error', errorInfo.category || 'error', {
      message: errorInfo.message,
      componentStack: errorInfo.componentStack,
      level: errorInfo.level,
      timestamp: Date.now()
    });
  }

  /**
   * Sanitize properties to remove any PII
   */
  private sanitizeProperties(properties?: Record<string, unknown>): Record<string, unknown> | undefined {
    if (!properties) return undefined;

    const sanitized: Record<string, unknown> = {};
    const piiKeys = ["email", "phone", "name", "address", "uid", "userId"];

    for (const [key, value] of Object.entries(properties)) {
      if (piiKeys.some(pii => key.toLowerCase().includes(pii))) {
        continue; // Skip PII
      }
      sanitized[key] = value;
    }

    return sanitized;
  }

  /**
   * Get analytics summary (for debugging)
   */
  getSummary(): Record<string, number> {
    const summary: Record<string, number> = {};
    
    this.events.forEach(event => {
      const key = `${event.category}.${event.name}`;
      summary[key] = (summary[key] || 0) + 1;
    });

    return summary;
  }

  /**
   * Clear all events
   */
  clear(): void {
    this.events = [];
    localStorage.removeItem("analytics_events");
  }

  /**
   * Load events from localStorage
   */
  load(): void {
    try {
      const saved = localStorage.getItem("analytics_events");
      if (saved) {
        this.events = JSON.parse(saved);
      }
    } catch (error) {
      console.warn("Failed to load analytics events:", error);
    }
  }
}

export const analytics = new Analytics();

// Load saved events on initialization
analytics.load();

// Expose in dev mode for debugging
if (import.meta.env.DEV && typeof window !== "undefined") {
  (window as any).__analytics = analytics;
}

