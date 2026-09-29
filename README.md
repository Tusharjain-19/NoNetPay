<div align="center">

# 🛡️ NoNetPay (Offline UPI)

**Sovereign Connectivity-Adaptive UPI Payment Infrastructure for India**

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Offline First](https://img.shields.io/badge/Offline--First-100%25-059669?style=for-the-badge&logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
[![Security](https://img.shields.io/badge/PIN_Security-Zero_Capture-DC2626?style=for-the-badge&logo=shield&logoColor=white)](#security-architecture)

<p align="center">
  <strong>Scan any UPI QR and pay without internet data.</strong><br>
  Guides you through NPCI's official <code>*99#</code> USSD & VoLTE rails with zero internet, provides advance travel readiness audits, and guarantees you never pay twice.
</p>

</div>

---

## 📌 Problem Statement

In India, UPI payments fail when mobile data drops:
- 🚆 **Trains & Metros** (tunnels, inter-city dead zones)
- 🏢 **Basements & Parking Garages** (shielded structures)
- ⛰️ **Highways & Hill Stations** (patchy cellular internet)
- 🎪 **Crowded Markets & Stadiums** (packet network congestion)
- ⚡ **Carrier Internet Outages** (broadband/data blackouts)

While NPCI's `*99#` USSD GSM service functions without internet data, it remains underutilized because:
1. Complex nested menus and manual typing of long UPI VPAs (`merchant@bank`).
2. Unclear error messages and carrier timeouts leading to panic duplicate payments.
3. No advance visibility into whether your SIM and bank are configured before you travel.

**NoNetPay solves this.** It decodes merchant QRs on-device, guides you through fast-dial bank shortcuts, audits your offline readiness before you go, and records tamper-evident cryptographic receipts locally.

---

## ⚡ Key Capabilities

```
  ┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
  │  Rear Camera    │ ───▶  │ Client-side QR  │ ───▶  │ Multi-Rail      │
  │  Live Viewfinder│       │ jsQR Engine     │       │ Route Selector  │
  └─────────────────┘       └─────────────────┘       └────────┬────────┘
                                                               │
                                                               ▼
  ┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
  │ Local IndexedDB │ ◀───  │ Native OS       │ ◀───  │ Fast-Dial USSD  │
  │ AES-GCM Ledger  │       │ Dialer Session  │       │ (*99*41# SBI)   │
  └─────────────────┘       └─────────────────┘       └─────────────────┘
```

- 📷 **Instant Rear Camera QR Scanner**: Fast continuous frame analysis using client-side `jsQR` with fallback to image upload and clipboard decoding.
- 📶 **Network Edge Simulator**: Toggle between **5G Fast**, **2G Edge**, **Offline Net**, and **Dead Zone** to test adaptive failover logic.
- 🧭 **94% Multi-Rail Readiness Dial**: Audits SIM VoLTE, 123PAY Voice, and `*99#` USSD connectivity before boarding trains or traveling to remote areas.
- 🏦 **4-Step Bank Configurator**: Step-by-step setup with pre-configured USSD fast-dial codes for State Bank of India (`*99*41#`), HDFC Bank (`*99*44#`), ICICI Bank (`*99*45#`), Axis Bank (`*99*46#`), Punjab National Bank (`*99*42#`), and 80+ Indian banks.
- 🛡️ **Zero PIN Capture Principle**: Adheres strictly to RBI & NPCI security protocols. You enter your UPI PIN only inside your phone's native dialer—NoNetPay never handles or captures your PIN.
- ⚖️ **Duplicate Payment Protection**: Guards against duplicate payments within a 10-minute safety buffer.
- 🗄️ **Tamper-Evident Local Ledger**: Offline transaction history and receipts are encrypted with browser WebCrypto AES-GCM and stored in IndexedDB.

---

## 🛠️ Technology Stack

| Layer | Technology | Rationale |
|---|---|---|
| **Core Framework** | React 19 | High-performance reactive UI with minimal overhead |
| **Language** | TypeScript 5.0 | Strict type safety for financial value types & state machines |
| **Build & Bundle** | Vite 8.0 | Instant HMR, lightning-fast ESM production builds |
| **QR Engine** | `jsQR` | 100% offline cross-browser canvas QR decoding |
| **Storage & Security** | IndexedDB + WebCrypto | Client-side AES-GCM encrypted persistence |
| **Styling** | Vanilla CSS Design Tokens | High-density Sovereign Adaptive banking design with tabular numerals (`tnum`) |
| **PWA & Offline** | Service Worker + Cache API | Full offline availability after single visit |
| **Test Suite** | Node TSX Runner | 28 shared vector test cases matching specification |

---

## 📂 Project Architecture & Directory Structure

```
webapp/
├── public/                     # PWA manifest, service worker, icons
│   ├── favicon.svg
│   ├── manifest.json
│   └── sw.js
├── src/
│   ├── core/                   # Pure domain business logic (Zero dependencies)
│   │   ├── duplicateGuard.ts   # 10-minute duplicate payment prevention
│   │   ├── failureMapper.ts    # USSD flash response interpreter & error mapper
│   │   ├── qr.ts               # RFC-compliant UPI QR link parser & sanitizer
│   │   ├── readiness.ts        # 6-point offline rail diagnostics engine
│   │   ├── routes.ts           # Connectivity-adaptive route selector
│   │   ├── session.ts          # Finite State Machine (FSM) payment reducer
│   │   └── valueTypes.ts       # Exact integer paise money arithmetic
│   ├── data/                   # Encrypted storage & cryptographic primitives
│   │   ├── crypto.ts           # WebCrypto AES-GCM cipher routines
│   │   └── db.ts               # IndexedDB app storage wrapper
│   ├── adapters/               # Hardware & browser platform adapters
│   │   └── index.ts            # Dialer, Clipboard, Haptics, Storage adapters
│   ├── content/                # Versioned banking data
│   │   ├── banks.json          # 80+ Indian banks with USSD shortcut formats
│   │   ├── carriers.json       # Jio, Airtel, Vi, BSNL USSD capabilities
│   │   └── failures.json       # NPCI error code vectors & remedies
│   ├── store/                  # Global application state
│   │   └── AppContext.tsx      # Multi-rail context provider & DB sync
│   ├── ui/                     # Presentation layer (Sovereign Design System)
│   │   ├── components/         # SegmentedSimulator, Modals, Readiness Dials
│   │   ├── screens/            # Home, Scan, Pay, Result, History, Setup, Help, Balance, TripPrep, Diagnostics
│   │   ├── Icons.tsx           # Sovereign SVG icons & Brand Logo
│   │   ├── Layout.tsx          # FloatingDockNavigation & Header Shell
│   │   └── Layout.css
│   ├── site/                   # Public documentation & marketing pages
│   │   ├── LandingPage.tsx
│   │   ├── HowItWorksPage.tsx
│   │   ├── CompatibilityPage.tsx
│   │   ├── SecurityPage.tsx
│   │   └── DownloadPage.tsx
│   ├── __tests__/              # Unit test suites & test vectors
│   │   └── core.test.mjs       # 28 automated test vector cases
│   ├── App.tsx                 # Route declarations & direct aliases
│   ├── main.tsx                # Application bootstrap
│   └── index.css               # Design system tokens & typography
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 🔒 Security Architecture

1. **Zero Runtime Data Dispatch**:
   No transaction data, phone numbers, or merchant VPAs are ever dispatched across the internet during payment execution.
2. **PIN Isolation**:
   NoNetPay never prompts for, reads, or records the UPI PIN. The PIN is strictly typed into your mobile OS USSD flash dialog.
3. **Receipt Hashing**:
   Every offline session creates an immutable local hash receipt with date, amount, payee VPA, and route audit log.
4. **State Machine Finality**:
   Terminal states (`SUCCESS`, `FAILED`) are immutable. Ambiguous USSD drops enter `UNKNOWN` state to prevent premature double-charging.

---

## 🚀 Getting Started & Local Development

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18.0 or higher)
- `npm` or `pnpm`

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/Tusharjain-19/NoNetPay.git
cd NoNetPay
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Run Automated Core Test Suite
```bash
npm test
```
Executes all 28 shared-vector test cases (QR sanitization, money precision, USSD failure mapping, duplicate guard, state machine).

### 4. Build for Production
```bash
npm run build
```
Creates an optimized, tree-shaken static production bundle in `dist/`.

### 5. Preview Production Build Locally
```bash
npm run preview
```

---

## 🏛️ Bank Compatibility Matrix

| Bank | USSD Fast Dial | Status | VoLTE Verified |
|---|---|---|---|
| **State Bank of India (SBI)** | `*99*41#` | ✅ Verified | Yes |
| **Punjab National Bank (PNB)** | `*99*42#` | ✅ Verified | Yes |
| **HDFC Bank** | `*99*44#` | ✅ Verified | Yes |
| **ICICI Bank** | `*99*45#` | ✅ Verified | Yes |
| **Axis Bank** | `*99*46#` | ✅ Verified | Yes |
| **Bank of Baroda** | `*99*48#` | ✅ Verified | Yes |
| **Canara Bank** | `*99*49#` | ✅ Verified | Yes |
| **Union Bank of India** | `*99*52#` | ✅ Verified | Yes |
| **All NPCI Member Banks** | `*99#` | ✅ Standard NUUP | Yes |

---

## 📄 License & Standards

- **Open Source**: MIT License.
- **Standards Compliance**: NPCI `*99#` NUUP Standard, RBI Master Direction on Digital Payment Security Controls.
