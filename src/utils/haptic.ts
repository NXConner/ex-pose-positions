/**
 * Haptic feedback utilities
 * Provides vibration patterns for better UX on supported devices
 */

/**
 * Trigger haptic feedback (vibration)
 * @param pattern - Vibration pattern in milliseconds
 * @returns void
 */
export function vibrate(pattern: number | number[]): void {
  if (!navigator.vibrate) return;
  
  try {
    navigator.vibrate(pattern);
  } catch (error) {
    // Silently fail if vibration is not supported
    if (import.meta.env.DEV) {
      console.warn("Haptic feedback not supported:", error);
    }
  }
}

/**
 * Standard haptic patterns
 */
export const HAPTIC = {
  /** Light tap (10ms) */
  LIGHT: 10,
  /** Medium tap (20ms) */
  MEDIUM: 20,
  /** Strong tap (30ms) */
  STRONG: 30,
  /** Success pattern */
  SUCCESS: [10, 50, 10],
  /** Error pattern */
  ERROR: [20, 50, 20, 50, 20],
  /** Warning pattern */
  WARNING: [20, 30, 20],
  /** Double tap */
  DOUBLE: [10, 50, 10],
} as const;

/**
 * Trigger haptic feedback for button press
 */
export function hapticPress(): void {
  vibrate(HAPTIC.LIGHT);
}

/**
 * Trigger haptic feedback for success action
 */
export function hapticSuccess(): void {
  vibrate(HAPTIC.SUCCESS);
}

/**
 * Trigger haptic feedback for error
 */
export function hapticError(): void {
  vibrate(HAPTIC.ERROR);
}

/**
 * Trigger haptic feedback for warning
 */
export function hapticWarning(): void {
  vibrate(HAPTIC.WARNING);
}

