import { useSyncExternalStore, useCallback } from "react";

const STORAGE_KEY = "time-tracker-username";

// In-memory cache for SSR and initial render
let cachedUsername: string | null = null;

/**
 * Get the stored username from localStorage
 */
export function getUsername(): string | null {
  if (typeof window === "undefined") return cachedUsername;

  if (cachedUsername === null) {
    cachedUsername = localStorage.getItem(STORAGE_KEY);
  }
  return cachedUsername;
}

/**
 * Set the username in localStorage
 */
export function setUsername(username: string): void {
  const normalizedUsername = username.trim().toLowerCase();
  if (!normalizedUsername) {
    throw new Error("Username cannot be empty");
  }

  localStorage.setItem(STORAGE_KEY, normalizedUsername);
  cachedUsername = normalizedUsername;

  // Notify subscribers
  window.dispatchEvent(new CustomEvent("username-change"));
}

/**
 * Clear the username from localStorage
 */
export function clearUsername(): void {
  localStorage.removeItem(STORAGE_KEY);
  cachedUsername = null;

  // Notify subscribers
  window.dispatchEvent(new CustomEvent("username-change"));
}

/**
 * Check if a username is set
 */
export function hasUsername(): boolean {
  return getUsername() !== null;
}

/**
 * Derive a stable storeId from the username using a simple hash
 */
export function deriveStoreId(username: string): string {
  const normalized = username.trim().toLowerCase();
  // Use a simple stable hash - FNV-1a
  let hash = 2166136261;
  for (let i = 0; i < normalized.length; i++) {
    hash ^= normalized.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  // Convert to a UUID-like format for consistency
  const hex = (hash >>> 0).toString(16).padStart(8, "0");
  return `user-${normalized}-${hex}`;
}

// External store subscription for React
function subscribe(callback: () => void): () => void {
  const handler = () => callback();
  window.addEventListener("username-change", handler);
  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEY) {
      cachedUsername = e.newValue;
      handler();
    }
  });
  return () => {
    window.removeEventListener("username-change", handler);
    window.removeEventListener("storage", handler);
  };
}

function getSnapshot(): string | null {
  return getUsername();
}

function getServerSnapshot(): string | null {
  return null;
}

/**
 * React hook to get and manage the username
 */
export function useUsername() {
  const username = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  const set = useCallback((newUsername: string) => {
    setUsername(newUsername);
  }, []);

  const clear = useCallback(() => {
    clearUsername();
  }, []);

  return {
    username,
    setUsername: set,
    clearUsername: clear,
    hasUsername: username !== null,
    storeId: username ? deriveStoreId(username) : null,
  };
}

