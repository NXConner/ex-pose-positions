/**
 * Input sanitization utilities to prevent XSS attacks and data injection
 * Enhanced with comprehensive security measures
 */

/**
 * Dangerous HTML tags and attributes to remove
 */
const DANGEROUS_TAGS = /<(script|iframe|object|embed|form|input|textarea|button|select|meta|link|style|base|frame|frameset)[\s>]/gi;
const DANGEROUS_ATTRIBUTES = /(on\w+\s*=|javascript:|data:text\/html|vbscript:)/gi;
const DANGEROUS_PROTOCOLS = /^(javascript|data|vbscript|file|about):/i;

/**
 * Allowed HTML tags for safe HTML (whitelist approach)
 */
const ALLOWED_TAGS = ['p', 'br', 'strong', 'em', 'u', 'b', 'i', 'span', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a'];
const ALLOWED_ATTRIBUTES = ['href', 'class', 'id', 'title'];

/**
 * Sanitizes HTML input to prevent XSS using whitelist approach
 * @param input - Raw HTML string
 * @returns Sanitized string with dangerous tags/attributes removed
 */
export function sanitizeHtml(input: string): string {
  if (typeof input !== 'string') return '';
  
  // Remove null bytes and control characters
  let sanitized = input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  
  // Remove dangerous tags
  sanitized = sanitized.replace(DANGEROUS_TAGS, '');
  
  // Remove dangerous attributes and protocols
  sanitized = sanitized.replace(DANGEROUS_ATTRIBUTES, '');
  sanitized = sanitized.replace(/href\s*=\s*["']([^"']*)["']/gi, (match, url) => {
    if (DANGEROUS_PROTOCOLS.test(url.trim())) {
      return '';
    }
    return match;
  });
  
  // Use DOMParser for safe HTML parsing (if available)
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(sanitized, 'text/html');
    return doc.body.textContent || '';
  } catch {
    // Fallback: strip all HTML
    const div = document.createElement("div");
    div.textContent = sanitized;
    return div.innerHTML;
  }
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
  if (Number.isNaN(num) || num < 0 || !Number.isFinite(num)) return null;
  // Limit to reasonable range (0 to 1 million)
  if (num > 1000000) return null;
  return num;
}

/**
 * Sanitizes file name to prevent path traversal
 * @param fileName - File name string
 * @returns Sanitized file name or empty string
 */
export function sanitizeFileName(fileName: string): string {
  if (typeof fileName !== 'string') return '';
  // Remove path traversal attempts
  return fileName.replace(/[^a-zA-Z0-9._-]/g, '').substring(0, 255);
}

/**
 * Validates and sanitizes JSON input
 * @param jsonString - JSON string
 * @param maxDepth - Maximum nesting depth (default: 10)
 * @returns Parsed object or null if invalid
 */
export function safeJsonParse(jsonString: string, maxDepth: number = 10): unknown | null {
  try {
    if (typeof jsonString !== 'string') return null;
    
    // Check for circular references and excessive nesting
    const parsed = JSON.parse(jsonString);
    
    function checkDepth(obj: unknown, depth: number): boolean {
      if (depth > maxDepth) return false;
      if (typeof obj !== 'object' || obj === null) return true;
      if (Array.isArray(obj)) {
        return obj.every(item => checkDepth(item, depth + 1));
      }
      return Object.values(obj).every(value => checkDepth(value, depth + 1));
    }
    
    return checkDepth(parsed, 0) ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * Validates email format (basic)
 * @param email - Email string
 * @returns true if valid format
 */
export function validateEmail(email: string): boolean {
  if (typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

