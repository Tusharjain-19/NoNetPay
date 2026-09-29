import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PhoneIcon,
  LaptopIcon,
  DownloadIcon,
  CheckCircleIcon,
  ShieldIcon,
  CheckIcon,
  ShareIcon,
  InfoIcon,
  ChevronRightIcon,
} from '../ui/Icons';

export const DownloadPage: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handlePWAInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      alert('To install on your phone: Tap browser menu (⋮) → "Install app" or "Add to Home screen".');
    }
  };

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '40px 20px 80px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '44px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', background: '#ECFDF5', color: '#059669', borderRadius: '9999px', fontSize: '12px', fontWeight: 700, marginBottom: '14px', border: '1px solid #A7F3D0' }}>
          <CheckCircleIcon size={14} color="#059669" />
          <span>100% OFFLINE COMPATIBLE</span>
        </div>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 2.8rem)', fontWeight: 800, letterSpacing: '-0.03em', color: '#0F172A', margin: '0 0 12px 0' }}>
          Get NoNetPay for Your Device
        </h1>
        <p style={{ fontSize: '16px', color: '#64748B', maxWidth: '640px', margin: '0 auto', lineHeight: 1.6 }}>
          Install the offline Progressive Web App directly from your browser on iPhone, Android, or laptop PC, or download the companion Android native APK.
        </p>
      </div>

      {/* Main Download / Install Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        
        {/* ── CARD 1: Progressive Web App (PWA) ── */}
        <div className="card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '2px solid #0F172A', background: '#FFFFFF', borderRadius: '18px', boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span style={{ padding: '3px 10px', background: '#0F172A', color: '#FFFFFF', borderRadius: '6px', fontSize: '11px', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                Recommended (Instant)
              </span>
              <span style={{ fontSize: '12px', color: '#059669', fontWeight: 700 }}>
                ✓ Zero App Store Required
              </span>
            </div>

            <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', margin: '0 0 10px 0' }}>
              Progressive Web App (PWA)
            </h2>
            <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.55, margin: '0 0 20px 0' }}>
              Works natively on <strong>Android Chrome</strong>, <strong>iPhone Safari</strong>, and desktop laptops. Once opened, it caches completely and operates 100% offline without cellular internet data.
            </p>

            <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                How to Install in 5 Seconds:
              </h3>
              <ul style={{ paddingLeft: '20px', margin: 0, fontSize: '13px', color: '#334155', lineHeight: 1.6 }}>
                <li><strong>Android:</strong> Tap browser menu <strong>(⋮)</strong> → <em>"Install App"</em> or <em>"Add to Home screen"</em>.</li>
                <li><strong>iPhone:</strong> Tap Share button <ShareIcon size={13} className="inline-icon" /> in Safari → <em>"Add to Home Screen"</em>.</li>
                <li><strong>Laptop:</strong> Click the Install icon <DownloadIcon size={13} className="inline-icon" /> in the address bar.</li>
              </ul>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {deferredPrompt ? (
              <button className="btn btn--primary btn--full" onClick={handlePWAInstall} style={{ padding: '12px', fontSize: '14px' }}>
                <DownloadIcon size={18} />
                <span>Install PWA to Device</span>
              </button>
            ) : (
              <Link to="/app" className="btn btn--primary btn--full" style={{ padding: '12px', fontSize: '14px', textDecoration: 'none', textAlign: 'center' }}>
                <span>Launch & Use Web App Now →</span>
              </Link>
            )}
          </div>
        </div>

        {/* ── CARD 2: Native Android APK ── */}
        <div className="card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid #E2E8F0', background: '#FFFFFF', borderRadius: '18px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span style={{ padding: '3px 10px', background: '#F1F5F9', color: '#475569', borderRadius: '6px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', border: '1px solid #CBD5E1' }}>
                Android APK Sideload
              </span>
              <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>
                v1.0.0 Release
              </span>
            </div>

            <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', margin: '0 0 10px 0' }}>
              Native Android APK
            </h2>
            <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.55, margin: '0 0 20px 0' }}>
              Android package built with Kotlin, CameraX QR scanning, and zero internet permission (`INTERNET` permission disabled in manifest).
            </p>

            <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '12.5px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: '#64748B' }}>Package:</span>
                <span className="font-mono" style={{ fontWeight: 600, color: '#0F172A' }}>NoNetPay-release.apk</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: '#64748B' }}>Target OS:</span>
                <span style={{ fontWeight: 600, color: '#0F172A' }}>Android 8.0+ (API 26+)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Permissions:</span>
                <span style={{ color: '#059669', fontWeight: 700 }}>CALL_PHONE Only (Zero Data)</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <a
              href="https://github.com/Tusharjain-19/NoNetPay/releases"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--secondary btn--full"
              style={{ padding: '12px', fontSize: '14px', textDecoration: 'none', textAlign: 'center' }}
            >
              <DownloadIcon size={18} />
              <span>Get APK from GitHub Releases ↗</span>
            </a>
            <div style={{ textAlign: 'center', fontSize: '11.5px', color: '#94A3B8' }}>
              Open-source binary • Signed with standard key
            </div>
          </div>
        </div>

      </div>

      {/* Security & Offline Guarantee */}
      <div className="card" style={{ padding: '24px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '16px', display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
        <ShieldIcon size={24} color="#059669" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: '0 0 4px 0' }}>
            Privacy & Trust Architecture
          </h3>
          <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.5, margin: 0 }}>
            Neither the PWA nor the Android APK ever transmits your UPI IDs, transaction amounts, or personal phone number to external tracking servers. Payments execute purely between your device and your bank's official *99# telecom switch.
          </p>
        </div>
      </div>
    </div>
  );
};
