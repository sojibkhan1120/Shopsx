// Safe local and session storage helpers with in-memory fallback
// Prevents DOMException / SecurityError crashes when running inside sandboxed or cross-origin iframes

const memoryStore: Record<string, string> = {};

export const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== 'undefined' && 'localStorage' in window) {
        return window.localStorage.getItem(key);
      }
    } catch {
      // Storage restricted or blocked in iframe sandbox
    }
    return memoryStore[key] ?? null;
  },

  setItem: (key: string, value: string): void => {
    try {
      if (typeof window !== 'undefined' && 'localStorage' in window) {
        window.localStorage.setItem(key, value);
      }
    } catch {
      // Storage restricted or quota exceeded
    }
    memoryStore[key] = value;
  },

  removeItem: (key: string): void => {
    try {
      if (typeof window !== 'undefined' && 'localStorage' in window) {
        window.localStorage.removeItem(key);
      }
    } catch {
      // Storage restricted
    }
    delete memoryStore[key];
  },

  clear: (): void => {
    try {
      if (typeof window !== 'undefined' && 'localStorage' in window) {
        window.localStorage.clear();
      }
    } catch {}
    for (const k in memoryStore) {
      if (!k.startsWith('sess_')) {
        delete memoryStore[k];
      }
    }
  },

  key: (index: number): string | null => {
    try {
      if (typeof window !== 'undefined' && 'localStorage' in window) {
        return window.localStorage.key(index);
      }
    } catch {}
    return Object.keys(memoryStore).filter((k) => !k.startsWith('sess_'))[index] ?? null;
  },
};

export const safeSessionStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== 'undefined' && 'sessionStorage' in window) {
        return window.sessionStorage.getItem(key);
      }
    } catch {
      // Storage restricted or blocked
    }
    return memoryStore['sess_' + key] ?? null;
  },

  setItem: (key: string, value: string): void => {
    try {
      if (typeof window !== 'undefined' && 'sessionStorage' in window) {
        window.sessionStorage.setItem(key, value);
      }
    } catch {
      // Storage restricted
    }
    memoryStore['sess_' + key] = value;
  },

  removeItem: (key: string): void => {
    try {
      if (typeof window !== 'undefined' && 'sessionStorage' in window) {
        window.sessionStorage.removeItem(key);
      }
    } catch {
      // Storage restricted
    }
    delete memoryStore['sess_' + key];
  },

  clear: (): void => {
    try {
      if (typeof window !== 'undefined' && 'sessionStorage' in window) {
        window.sessionStorage.clear();
      }
    } catch {}
    for (const k in memoryStore) {
      if (k.startsWith('sess_')) {
        delete memoryStore[k];
      }
    }
  },

  key: (index: number): string | null => {
    try {
      if (typeof window !== 'undefined' && 'sessionStorage' in window) {
        return window.sessionStorage.key(index);
      }
    } catch {}
    return (
      Object.keys(memoryStore)
        .filter((k) => k.startsWith('sess_'))
        .map((k) => k.replace(/^sess_/, ''))[index] ?? null
    );
  },
};

/**
 * Global default wallet configuration for Demo/Help accounts
 */
export const DEMO_DEFAULT_WALLET_ADDRESS = 'TAXj5gzNPZo6AyCqVhKiBVSpgxe7LrWDvT';
export const DEMO_DEFAULT_WALLET_NAME = 'USDT TRC-20';

/**
 * Mask a wallet address so nobody can see the full destination address
 * e.g. "TAXj****************************WDvT"
 */
export const maskWalletAddress = (addr?: string | null): string => {
  if (!addr) return 'Not bound';
  const clean = addr.trim();
  if (clean.length <= 8) return '••••••••';
  const start = clean.slice(0, 4);
  const end = clean.slice(-4);
  return `${start}****************************${end}`;
};

