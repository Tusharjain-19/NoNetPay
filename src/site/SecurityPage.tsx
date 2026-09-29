import React from 'react';
import { ShieldIcon, CheckCircleIcon, AlertCircleIcon, WifiOffIcon } from '../ui/Icons';

export const SecurityPage: React.FC = () => {
  return (
    <div style={{ maxWidth: '840px', margin: '0 auto', padding: '40px 20px 80px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', background: 'rgba(15, 118, 110, 0.1)', color: 'var(--color-accent)', borderRadius: '16px', fontSize: '0.85rem', fontWeight: 700, marginBottom: '14px' }}>
          SECURITY & PRIVACY ARCHITECTURE
        </div>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '14px' }}>
          Zero Backend. Never Sees Your PIN.
        </h1>
        <p style={{ fontSize: '1.05rem', color: 'var(--color-ink-muted)', lineHeight: '1.6' }}>
          How NoNetPay is engineered from the ground up for strict cryptographic privacy and zero risk.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '40px' }}>
        {/* Core Principle 1: PIN Security */}
        <div className="card card--elevated" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(15, 118, 110, 0.1)', color: 'var(--color-accent)' }}>
              <ShieldIcon size={24} />
            </div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, margin: 0 }}>
              The App Never Touches or Stores Your UPI PIN
            </h2>
          </div>
          <p style={{ fontSize: '0.95rem', color: 'var(--color-ink-muted)', lineHeight: '1.6' }}>
            There is <strong>no PIN input field anywhere in NoNetPay</strong>. When you pay, you enter your confidential 4 or 6-digit UPI PIN only within the native phone dialer interface provided by your telecom operator and the banking network. No web form or JavaScript code has access to your keystrokes.
          </p>
        </div>

        {/* Core Principle 2: Zero Backend */}
        <div className="card card--elevated" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(15, 118, 110, 0.1)', color: 'var(--color-accent)' }}>
              <WifiOffIcon size={24} />
            </div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, margin: 0 }}>
              Zero Runtime Network Requests
            </h2>
          </div>
          <p style={{ fontSize: '0.95rem', color: 'var(--color-ink-muted)', lineHeight: '1.6' }}>
            NoNetPay has no server backend, no analytics trackers, no tracking pixels, and no cloud databases. Once the progressive web app shell is cached on your device, all logic (QR decoding, route evaluation, session state machines) runs completely offline in your browser.
          </p>
        </div>

        {/* Core Principle 3: Encrypted History */}
        <div className="card card--elevated" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(15, 118, 110, 0.1)', color: 'var(--color-accent)' }}>
              <CheckCircleIcon size={24} />
            </div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, margin: 0 }}>
              Client-Side AES-GCM Encrypted Storage
            </h2>
          </div>
          <p style={{ fontSize: '0.95rem', color: 'var(--color-ink-muted)', lineHeight: '1.6' }}>
            Payment history entries stored in IndexedDB are protected using WebCrypto standard 256-bit AES-GCM encryption with non-extractable crypto keys. Furthermore, an automated regex sanitizer strips any digit runs resembling OTPs or PINs before anything touches device storage.
          </p>
        </div>

        {/* Honest Notice */}
        <div className="card" style={{ background: '#FFFBEB', border: '1px solid #FDE68A', padding: '24px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <AlertCircleIcon size={22} color="#D97706" />
            <div>
              <strong style={{ fontSize: '1rem', color: '#92400E', display: 'block', marginBottom: '6px' }}>
                Honest Storage Notice: Browser vs Native Keystore
              </strong>
              <p style={{ fontSize: '0.9rem', color: '#78350F', lineHeight: '1.5', margin: 0 }}>
                Web storage is tied to your browser profile. If you clear browser website data, your offline history will be deleted. For hardware-backed Android Keystore isolation and encrypted SQLCipher databases, use our companion Android application.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
