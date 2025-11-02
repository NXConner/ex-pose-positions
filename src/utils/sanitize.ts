/**
 * Input sanitization utilities to prevent XSS attacks
 */

/**
 * Sanitizes HTML input to prevent XSS
 * @param input - Raw HTML string
 * @returns Sanitized string with dangerous tags/attributes removed
 */
export function sanitizeHtml(input: string): string {
  const div = document.createElement("div");
  div.textContent = input;
  return div.innerHTML;
}

/**
 * Sanitizes text input by escaping HTML entities
 * @param input - Text string
 * @returns Escaped string safe for HTML display
 */
export function sanitizeText(input: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return input.replace(/[&<>"']/g, (m) => map[m] || m);
}

/**
 * Sanitizes URL to prevent javascript: and data: URLs
 * @param url - URL string
 * @returns Sanitized URL or empty string if invalid
 */
export function sanitizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    // Allow only http, https
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return "";
    }
    return url;
  } catch {
    // Invalid URL
    return "";
  }
}

/**
 * Validates and sanitizes user input for Firebase storage
 * @param input - User input string
 * @param maxLength - Maximum allowed length
 * @returns Sanitized string or null if invalid
 */
export function sanitizeForFirebase(input: string, maxLength: number = 1000): string | null {
  if (typeof input !== "string") return null;
  if (input.length > maxLength) return null;
  
  // Remove control characters except newlines and tabs
  const sanitized = input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
  
  return sanitized.trim() || null;
}

/**
 * Validates position ID
 * @param id - Position ID
 * @returns Validated ID or null
 */
export function validatePositionId(id: unknown): number | null {
  if (typeof id !== "number" && typeof id !== "string") return null;
  const num = typeof id === "string" ? Number.parseInt(id, 10) : id;
  if (Number.isNaN(num) || num < 0) return null;
  return num;
}

