// App State Context — integrates pure core logic, ports, and IndexedDB
// Aligns with ARCHITECTURE.md 2 & 7

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import type { PaymentSession } from '../core/session';
import type { ReadinessResult } from '../core/readiness';
import type { ParsedUPI, QRClassification } from '../core/qr';
import { appDb, type HistoryRecord } from '../data/db';
import { defaultHaptics } from '../adapters';

export interface BalanceRecord {
  amount: string;
  timestamp: number;
  source: 'user_reported';
}

export interface HistoryEntry {
  session: PaymentSession;
  timestamp: number;
}

interface AppState {
  // Current scan/payment flow
  scannedData: ParsedUPI | null;
  qrClassification: QRClassification | null;
  activeSession: PaymentSession | null;

  // Readiness
  readiness: ReadinessResult | null;

  // History
  history: HistoryEntry[];

  // Balance
  balance: BalanceRecord | null;

  // Setup
  selectedBank: string | null;
  setupComplete: boolean;

  // Trip prep
  lastPreparedAt: number | null;

  // Practice
  lastPracticeAt: number | null;

  // Network edge simulation (5G Fast, 2G Edge, Offline Net, Dead Zone)
  simulatedNetwork: '5G' | '2G' | 'OFFLINE' | 'DEADZONE';

  // Toast
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
}

interface AppContextType extends AppState {
  setScannedData: (data: ParsedUPI | null, classification: QRClassification | null) => void;
  setActiveSession: (session: PaymentSession | null) => void;
  setReadiness: (result: ReadinessResult | null) => void;
  addToHistory: (session: PaymentSession) => void;
  setBalance: (amount: string) => void;
  setSelectedBank: (bankId: string | null) => void;
  setSetupComplete: (complete: boolean) => void;
  setLastPreparedAt: (timestamp: number | null) => void;
  setLastPracticeAt: (timestamp: number | null) => void;
  setSimulatedNetwork: (net: '5G' | '2G' | 'OFFLINE' | 'DEADZONE') => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  clearToast: () => void;
  refreshFromDb: () => Promise<void>;
}

const AppContext = createContext<AppContextType>({} as AppContextType);

const STORAGE_KEY = 'nonetpay-state';

function loadFallbackState(): Partial<AppState> {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  return {};
}

function saveFallbackState(state: AppState): void {
  try {
    const toSave = {
      history: state.history.slice(0, 200),
      balance: state.balance,
      selectedBank: state.selectedBank,
      setupComplete: state.setupComplete,
      lastPreparedAt: state.lastPreparedAt,
      lastPracticeAt: state.lastPracticeAt,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch { /* ignore */ }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const saved = useRef(loadFallbackState());

  const [state, setState] = useState<AppState>({
    scannedData: null,
    qrClassification: null,
    activeSession: null,
    readiness: null,
    history: (saved.current.history as HistoryEntry[]) || [],
    balance: (saved.current.balance as BalanceRecord | null) || null,
    selectedBank: (saved.current.selectedBank as string | null) || null,
    setupComplete: (saved.current.setupComplete as boolean) || false,
    lastPreparedAt: (saved.current.lastPreparedAt as number | null) || null,
    lastPracticeAt: (saved.current.lastPracticeAt as number | null) || null,
    simulatedNetwork: (navigator.onLine ? '5G' : 'OFFLINE') as '5G' | '2G' | 'OFFLINE' | 'DEADZONE',
    toast: null,
  });

  // Load from IndexedDB on startup
  const refreshFromDb = useCallback(async () => {
    try {
      const [dbHistory, dbActiveSession] = await Promise.all([
        appDb.getAllHistory(),
        appDb.getActiveSession(),
      ]);

      if (dbHistory.length > 0) {
        setState((s) => ({
          ...s,
          history: dbHistory.map((rec: HistoryRecord) => ({
            session: rec.session,
            timestamp: rec.createdAt,
          })),
        }));
      }

      if (dbActiveSession) {
        setState((s) => ({ ...s, activeSession: dbActiveSession }));
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    refreshFromDb();
  }, [refreshFromDb]);

  // Persist fallback to localStorage
  useEffect(() => {
    saveFallbackState(state);
  }, [state]);

  const setScannedData = useCallback((data: ParsedUPI | null, classification: QRClassification | null) => {
    setState((s) => ({ ...s, scannedData: data, qrClassification: classification }));
  }, []);

  const setActiveSession = useCallback((session: PaymentSession | null) => {
    setState((s) => ({ ...s, activeSession: session }));
    // Persist active session in IndexedDB
    appDb.saveActiveSession(session);
    if (session) {
      appDb.logDiagnosticEvent('SESSION_UPDATED', `State: ${session.state} for ${session.payeeVpa}`);
    }
  }, []);

  const setReadiness = useCallback((result: ReadinessResult | null) => {
    setState((s) => ({ ...s, readiness: result }));
  }, []);

  const addToHistory = useCallback((session: PaymentSession) => {
    const timestamp = Date.now();
    setState((s) => ({
      ...s,
      history: [{ session, timestamp }, ...s.history].slice(0, 200),
      activeSession: null,
    }));

    // Save to IndexedDB
    appDb.saveHistoryEntry(session);
    appDb.saveActiveSession(null);
    appDb.logDiagnosticEvent('PAYMENT_RECORDED', `Result: ${session.state} Amount: ₹${session.amount} to ${session.payeeVpa}`);

    if (session.state === 'SUCCESS') {
      defaultHaptics.success();
    } else if (session.state === 'FAILED') {
      defaultHaptics.error();
    } else {
      defaultHaptics.warning();
    }
  }, []);

  const setBalance = useCallback((amount: string) => {
    setState((s) => ({
      ...s,
      balance: { amount, timestamp: Date.now(), source: 'user_reported' },
    }));
  }, []);

  const setSelectedBank = useCallback((bankId: string | null) => {
    setState((s) => ({ ...s, selectedBank: bankId }));
  }, []);

  const setSetupComplete = useCallback((complete: boolean) => {
    setState((s) => ({ ...s, setupComplete: complete }));
  }, []);

  const setLastPreparedAt = useCallback((timestamp: number | null) => {
    setState((s) => ({ ...s, lastPreparedAt: timestamp }));
  }, []);

  const setLastPracticeAt = useCallback((timestamp: number | null) => {
    setState((s) => ({ ...s, lastPracticeAt: timestamp }));
  }, []);

  const setSimulatedNetwork = useCallback((net: '5G' | '2G' | 'OFFLINE' | 'DEADZONE') => {
    setState((s) => ({ ...s, simulatedNetwork: net }));
  }, []);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setState((s) => ({ ...s, toast: { message, type } }));
    setTimeout(() => {
      setState((s) => ({ ...s, toast: null }));
    }, 3000);
  }, []);

  const clearToast = useCallback(() => {
    setState((s) => ({ ...s, toast: null }));
  }, []);

  return (
    <AppContext.Provider
      value={{
        ...state,
        setScannedData,
        setActiveSession,
        setReadiness,
        addToHistory,
        setBalance,
        setSelectedBank,
        setSetupComplete,
        setLastPreparedAt,
        setLastPracticeAt,
        setSimulatedNetwork,
        showToast,
        clearToast,
        refreshFromDb,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
