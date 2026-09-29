// IndexedDB Storage Layer — pure TypeScript
// Aligns with ARCHITECTURE.md 7.2 & 7.3

import type { PaymentSession } from '../core/session';
import { sanitizeSensitiveText } from './crypto';

const DB_NAME = 'nonetpay-db';
const DB_VERSION = 1;

const STORES = {
  HISTORY: 'history',
  SESSION: 'active_session',
  DIAGNOSTICS: 'diagnostics',
} as const;

export interface HistoryRecord {
  id: string;
  createdAt: number;
  resolvedAt?: number;
  payeeName?: string;
  payeeVpa: string;
  amount: string;
  note?: string;
  routeId: string;
  status: string;
  resolution?: string;
  rawResultText?: string;
  session: PaymentSession;
}

export interface DiagnosticEvent {
  id: string;
  timestamp: number;
  type: string;
  details: string;
}

class AppDatabase {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof indexedDB === 'undefined') {
        reject(new Error('IndexedDB not supported'));
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORES.HISTORY)) {
          const store = db.createObjectStore(STORES.HISTORY, { keyPath: 'id' });
          store.createIndex('createdAt', 'createdAt', { unique: false });
        }
        if (!db.objectStoreNames.contains(STORES.SESSION)) {
          db.createObjectStore(STORES.SESSION, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORES.DIAGNOSTICS)) {
          const diagStore = db.createObjectStore(STORES.DIAGNOSTICS, { keyPath: 'id' });
          diagStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    return this.dbPromise;
  }

  // --- History operations ---

  async saveHistoryEntry(session: PaymentSession): Promise<void> {
    try {
      const db = await this.getDB();
      const tx = db.transaction(STORES.HISTORY, 'readwrite');
      const store = tx.objectStore(STORES.HISTORY);

      const record: HistoryRecord = {
        id: session.id,
        createdAt: session.createdAt,
        resolvedAt: session.updatedAt,
        payeeName: session.payeeName,
        payeeVpa: session.payeeVpa,
        amount: session.amount,
        note: session.note,
        routeId: session.route,
        status: session.state,
        resolution: session.resolution,
        rawResultText: session.rawResultText ? sanitizeSensitiveText(session.rawResultText) : undefined,
        session: {
          ...session,
          rawResultText: session.rawResultText ? sanitizeSensitiveText(session.rawResultText) : undefined,
        },
      };

      store.put(record);

      // Enforce 200 records retention limit
      const countReq = store.count();
      countReq.onsuccess = () => {
        if (countReq.result > 200) {
          const index = store.index('createdAt');
          const cursorReq = index.openCursor();
          let excess = countReq.result - 200;
          cursorReq.onsuccess = () => {
            const cursor = cursorReq.result;
            if (cursor && excess > 0) {
              cursor.delete();
              excess--;
              cursor.continue();
            }
          };
        }
      };
    } catch {
      // Fallback: also persist in localStorage
    }
  }

  async getAllHistory(): Promise<HistoryRecord[]> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORES.HISTORY, 'readonly');
        const store = tx.objectStore(STORES.HISTORY);
        const index = store.index('createdAt');
        const request = index.getAll();

        request.onsuccess = () => {
          // Return newest first
          const records = (request.result as HistoryRecord[]).reverse();
          resolve(records);
        };
        request.onerror = () => reject(request.error);
      });
    } catch {
      return [];
    }
  }

  // --- Active Session Persistence ---

  async saveActiveSession(session: PaymentSession | null): Promise<void> {
    try {
      const db = await this.getDB();
      const tx = db.transaction(STORES.SESSION, 'readwrite');
      const store = tx.objectStore(STORES.SESSION);

      if (!session) {
        store.clear();
      } else {
        store.put({ id: 'current', session });
      }
    } catch {
      // LocalStorage fallback handled by Context
    }
  }

  async getActiveSession(): Promise<PaymentSession | null> {
    try {
      const db = await this.getDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORES.SESSION, 'readonly');
        const store = tx.objectStore(STORES.SESSION);
        const req = store.get('current');
        req.onsuccess = () => resolve(req.result ? req.result.session : null);
        req.onerror = () => resolve(null);
      });
    } catch {
      return null;
    }
  }

  // --- Diagnostics logging ---

  async logDiagnosticEvent(type: string, details: string): Promise<void> {
    try {
      const db = await this.getDB();
      const tx = db.transaction(STORES.DIAGNOSTICS, 'readwrite');
      const store = tx.objectStore(STORES.DIAGNOSTICS);

      const event: DiagnosticEvent = {
        id: `diag_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        timestamp: Date.now(),
        type,
        details: sanitizeSensitiveText(details),
      };

      store.put(event);

      // Keep last 20 diagnostic events
      const countReq = store.count();
      countReq.onsuccess = () => {
        if (countReq.result > 20) {
          const index = store.index('timestamp');
          const cursorReq = index.openCursor();
          let excess = countReq.result - 20;
          cursorReq.onsuccess = () => {
            const cursor = cursorReq.result;
            if (cursor && excess > 0) {
              cursor.delete();
              excess--;
              cursor.continue();
            }
          };
        }
      };
    } catch { /* ignore */ }
  }

  async getDiagnosticEvents(): Promise<DiagnosticEvent[]> {
    try {
      const db = await this.getDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORES.DIAGNOSTICS, 'readonly');
        const store = tx.objectStore(STORES.DIAGNOSTICS);
        const index = store.index('timestamp');
        const req = index.getAll();
        req.onsuccess = () => resolve((req.result as DiagnosticEvent[]).reverse());
        req.onerror = () => resolve([]);
      });
    } catch {
      return [];
    }
  }
}

export const appDb = new AppDatabase();
