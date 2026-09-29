// Readiness check — honest web version
// Every item is labelled "Detected" or "You told us"
// Aligns with ARCHITECTURE.md 6.7 & PRD 7.5

export type CheckSource = 'detected' | 'user_reported';
export type ReadinessStatus = 'READY' | 'LIMITED' | 'NOT_READY';

export interface ReadinessItem {
  id: string;
  label: string;
  passed: boolean;
  source: CheckSource;
  weight: number;
  fixAction?: string;
  detail?: string;
}

export interface ReadinessResult {
  status: ReadinessStatus;
  score: number;
  items: ReadinessItem[];
  detectedCount: number;
  userReportedCount: number;
}

// ── Detected Checks ──

async function checkOnlineStatus(): Promise<ReadinessItem> {
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
  return {
    id: 'online_status',
    label: 'Network Connectivity',
    passed: true, // Always passes because core app works offline
    source: 'detected',
    weight: 0, // Informational only
    detail: isOnline ? 'Online (Internet available)' : 'Offline (USSD route active)',
  };
}

async function checkCameraPermission(): Promise<ReadinessItem> {
  try {
    if (navigator.permissions && navigator.permissions.query) {
      const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
      const granted = result.state === 'granted';
      return {
        id: 'camera',
        label: 'Camera Permission',
        passed: granted,
        source: 'detected',
        weight: 15,
        detail: granted ? 'Granted' : result.state === 'prompt' ? 'Will request on scan' : 'Denied',
        fixAction: !granted ? 'Allow camera access when scanning QR codes' : undefined,
      };
    }
  } catch { /* ignore */ }

  return {
    id: 'camera',
    label: 'Camera Permission',
    passed: false,
    source: 'detected',
    weight: 15,
    detail: 'Prompt when requested',
    fixAction: 'Grant camera access in browser site settings',
  };
}

function checkPWAInstalled(): ReadinessItem {
  const isStandalone =
    typeof window !== 'undefined' &&
    (window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true);

  return {
    id: 'pwa_installed',
    label: 'App Installed (Home Screen)',
    passed: isStandalone,
    source: 'detected',
    weight: 15,
    detail: isStandalone ? 'Running as standalone PWA' : 'Running in browser tab',
    fixAction: !isStandalone ? 'Add to Home Screen for reliable offline payment' : undefined,
  };
}

async function checkServiceWorker(): Promise<ReadinessItem> {
  const hasWorker = typeof navigator !== 'undefined' && 'serviceWorker' in navigator;
  let cacheActive = false;

  if (hasWorker && typeof caches !== 'undefined') {
    try {
      const keys = await caches.keys();
      cacheActive = keys.length > 0;
    } catch { /* ignore */ }
  }

  const passed = hasWorker && (cacheActive || !!navigator.serviceWorker?.controller);

  return {
    id: 'service_worker',
    label: 'Offline Cache & Service Worker',
    passed,
    source: 'detected',
    weight: 20,
    detail: passed ? 'Offline assets cached' : 'Waiting for first offline sync',
    fixAction: !passed ? 'Open app once while online to complete offline caching' : undefined,
  };
}

async function checkStoragePersisted(): Promise<ReadinessItem> {
  try {
    if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persisted) {
      const persisted = await navigator.storage.persisted();
      return {
        id: 'storage',
        label: 'Persistent Storage',
        passed: persisted,
        source: 'detected',
        weight: 15,
        detail: persisted ? 'Storage protected against OS eviction' : 'Best-effort browser storage',
        fixAction: !persisted ? 'Tap to request persistent storage lock' : undefined,
      };
    }
  } catch { /* ignore */ }

  return {
    id: 'storage',
    label: 'Persistent Storage',
    passed: false,
    source: 'detected',
    weight: 15,
    detail: 'Standard browser cache',
    fixAction: 'Browser does not support storage lock',
  };
}

// ── User-Reported Checks ──

export function getUserReportedChecks(): ReadinessItem[] {
  let userChecks: Record<string, boolean> = {};
  try {
    const saved = localStorage.getItem('nonetpay-user-checks');
    if (saved) userChecks = JSON.parse(saved);
  } catch { /* ignore */ }

  return [
    {
      id: 'bank_linked',
      label: 'Bank account linked to *99#',
      passed: !!userChecks.bank_linked,
      source: 'user_reported',
      weight: 20,
      detail: userChecks.bank_linked ? 'Confirmed by you' : 'Needs setup',
      fixAction: !userChecks.bank_linked ? 'Link your bank via *99# dialer setup' : undefined,
    },
    {
      id: 'sim_signal',
      label: 'SIM has cellular GSM signal',
      passed: !!userChecks.sim_signal,
      source: 'user_reported',
      weight: 10,
      detail: userChecks.sim_signal ? 'Confirmed by you' : 'Check status bar',
      fixAction: !userChecks.sim_signal ? 'Verify phone shows cellular tower signal bars' : undefined,
    },
    {
      id: 'practice_call',
      label: 'Practice call to *99# tested',
      passed: !!userChecks.practice_call,
      source: 'user_reported',
      weight: 5,
      detail: userChecks.practice_call ? 'Tested successfully' : 'Not tested yet',
      fixAction: !userChecks.practice_call ? 'Run a test balance check in dialer' : undefined,
    },
  ];
}

export function updateUserCheck(id: string, value: boolean): void {
  try {
    const saved = localStorage.getItem('nonetpay-user-checks');
    const userChecks = saved ? JSON.parse(saved) : {};
    userChecks[id] = value;
    localStorage.setItem('nonetpay-user-checks', JSON.stringify(userChecks));
  } catch { /* ignore */ }
}

export async function requestStoragePersistence(): Promise<boolean> {
  try {
    if (navigator.storage && navigator.storage.persist) {
      return await navigator.storage.persist();
    }
  } catch { /* ignore */ }
  return false;
}

export async function runReadinessCheck(): Promise<ReadinessResult> {
  const [onlineItem, cameraItem, pwaItem, swItem, storageItem] = await Promise.all([
    checkOnlineStatus(),
    checkCameraPermission(),
    Promise.resolve(checkPWAInstalled()),
    checkServiceWorker(),
    checkStoragePersisted(),
  ]);

  const detectedItems = [onlineItem, cameraItem, pwaItem, swItem, storageItem];
  const userItems = getUserReportedChecks();
  const allItems = [...detectedItems, ...userItems];

  // Calculate weighted score
  const totalScorableWeight = allItems.reduce((sum, item) => sum + item.weight, 0);
  const earnedWeight = allItems.reduce((sum, item) => (item.passed ? sum + item.weight : sum), 0);

  const score = totalScorableWeight > 0 ? Math.round((earnedWeight / totalScorableWeight) * 100) : 0;

  let status: ReadinessStatus = 'NOT_READY';
  if (score >= 80) status = 'READY';
  else if (score >= 50) status = 'LIMITED';

  return {
    status,
    score,
    items: allItems,
    detectedCount: detectedItems.filter((i) => i.passed).length,
    userReportedCount: userItems.filter((i) => i.passed).length,
  };
}
