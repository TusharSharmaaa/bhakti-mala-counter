import { get, set, del } from 'idb-keyval';

/**
 * Persistent storage with IndexedDB (primary) and localStorage (fallback)
 * Prevents counter data loss across sessions
 */

export async function getItem<T>(key: string): Promise<T | null> {
  try {
    const value = await get<T>(key);
    return value ?? null;
  } catch {
    // Fallback to localStorage
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  }
}

export async function setItem<T>(key: string, value: T): Promise<void> {
  try {
    await set(key, value);
  } catch {
    // Fallback to localStorage
    localStorage.setItem(key, JSON.stringify(value));
  }
}

export async function removeItem(key: string): Promise<void> {
  try {
    await del(key);
  } catch {
    localStorage.removeItem(key);
  }
}

export function getItemSync<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}
