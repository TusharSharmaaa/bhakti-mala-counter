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

// Counter-specific storage
export interface CounterData {
  count: number;
  today_count: number;
  last_date: string;
}

const COUNTER_KEY = 'radha-counter';

export async function loadCounter(): Promise<CounterData> {
  const data = await getItem<CounterData>(COUNTER_KEY);
  if (data) return data;
  
  return {
    count: 0,
    today_count: 0,
    last_date: new Date().toISOString().split('T')[0],
  };
}

export async function saveCounter(data: CounterData): Promise<void> {
  await setItem(COUNTER_KEY, data);
}

export async function resetCounter(): Promise<void> {
  const data: CounterData = {
    count: 0,
    today_count: 0,
    last_date: new Date().toISOString().split('T')[0],
  };
  await saveCounter(data);
}
