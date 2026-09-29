// Browser Adapters — concrete platform implementations of Ports
// Aligns with ARCHITECTURE.md 3

import type {
  ClockPort,
  StoragePort,
  ClipboardPort,
  ConnectivityPort,
  HapticsPort,
} from '../ports';

export class BrowserClock implements ClockPort {
  now(): number {
    return Date.now();
  }

  setTimeout(callback: () => void, ms: number): number {
    return window.setTimeout(callback, ms);
  }

  clearTimeout(handle: number): void {
    window.clearTimeout(handle);
  }
}

export class BrowserClipboard implements ClipboardPort {
  private clearTimer: number | null = null;

  async writeText(text: string): Promise<boolean> {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);

        // Auto-clear clipboard after 60 seconds for sensitive payment privacy
        if (this.clearTimer) {
          window.clearTimeout(this.clearTimer);
        }
        this.clearTimer = window.setTimeout(async () => {
          try {
            await navigator.clipboard.writeText('');
          } catch {
            // Ignore failure on background clear
          }
        }, 60000);

        return true;
      }
    } catch {
      // Fallback
    }
    return false;
  }

  async clear(): Promise<boolean> {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText('');
        return true;
      }
    } catch {
      // ignore
    }
    return false;
  }
}

export class BrowserConnectivity implements ConnectivityPort {
  isOnline(): boolean {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  }

  subscribe(callback: (online: boolean) => void): () => void {
    const handleOnline = () => callback(true);
    const handleOffline = () => callback(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }
}

export class BrowserHaptics implements HapticsPort {
  success(): void {
    try {
      if ('vibrate' in navigator) {
        navigator.vibrate([40, 60, 40]);
      }
    } catch { /* ignore */ }
  }

  warning(): void {
    try {
      if ('vibrate' in navigator) {
        navigator.vibrate([80, 50, 80]);
      }
    } catch { /* ignore */ }
  }

  error(): void {
    try {
      if ('vibrate' in navigator) {
        navigator.vibrate([150, 80, 150]);
      }
    } catch { /* ignore */ }
  }
}

export class BrowserStorage implements StoragePort {
  async getItem<T>(key: string): Promise<T | null> {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  }

  async setItem<T>(key: string, value: T): Promise<void> {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch { /* ignore */ }
  }

  async removeItem(key: string): Promise<void> {
    try {
      localStorage.removeItem(key);
    } catch { /* ignore */ }
  }
}

export const defaultClock = new BrowserClock();
export const defaultClipboard = new BrowserClipboard();
export const defaultConnectivity = new BrowserConnectivity();
export const defaultHaptics = new BrowserHaptics();
export const defaultStorage = new BrowserStorage();
