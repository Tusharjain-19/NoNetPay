// Ports (Interfaces) — pure interfaces, no browser dependencies
// Aligns with ARCHITECTURE.md 3

export interface ClockPort {
  now(): number;
  setTimeout(callback: () => void, ms: number): number;
  clearTimeout(handle: number): void;
}

export interface StoragePort {
  getItem<T>(key: string): Promise<T | null>;
  setItem<T>(key: string, value: T): Promise<void>;
  removeItem(key: string): Promise<void>;
}

export interface ClipboardPort {
  writeText(text: string): Promise<boolean>;
  clear(): Promise<boolean>;
}

export interface ConnectivityPort {
  isOnline(): boolean;
  subscribe(callback: (online: boolean) => void): () => void;
}

export interface HapticsPort {
  success(): void;
  warning(): void;
  error(): void;
}
