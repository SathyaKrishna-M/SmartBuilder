import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generate a UUID v4 compatible ID
 * Uses Web Crypto API (crypto.randomUUID()) if available in browser
 * Falls back to a manual UUID v4 implementation for compatibility
 */
export function generateId(): string {
  // Use Web Crypto API if available (modern browsers)
  if (typeof window !== "undefined" && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }

  // Use Node.js crypto if available (server-side)
  if (typeof crypto !== "undefined" && crypto.randomUUID && typeof window === "undefined") {
    return crypto.randomUUID();
  }

  // Fallback: Generate UUID v4 manually
  // Format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
  // This ensures compatibility with all environments
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
