import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ScanIcon,
  WifiOffIcon,
  ShieldIcon,
  PhoneIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  ChevronRightIcon,
  CopyIcon,
  DownloadIcon,
} from '../ui/Icons';

export const LandingPage: React.FC = () => {
  const [demoOffline, setDemoOffline] = useState(false);
  const [demoStep, setDemoStep] = useState<'idle' | 'checking' | 'routed'>('idle');

  const handleToggleInternet = () => {
    if (!demoOffline) {
      setDemoOffline(true);
      setDemoStep('checking');
      setTimeout(() => {
        setDemoStep('routed');
      }, 700);
    } else {
      setDemoOffline(false);
      setDemoStep('idle');
    }
  };

  return (
    <div className="landing-page" style={{ padding: '0 0 60px 0' }}>
      {/* ── Honesty Alert Banner ── */}
      <div style={{ background: '#FFFBEB', borderBottom: '1px solid #FDE68A', padding: '10px 20px', textAlign: 'center', fontSize: '13px', color: '#92400E' }}>
        <strong>Honest Architecture Notice:</strong> The web version guides you safely; you complete payments securely in your phone dialer. Zero server requests, no PIN ever requested.
      </div>

      {/* ── Hero Section ── */}
      <section style={{ maxWidth: '1120px', margin: '0 auto', padding: '50px 20px 40px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '5px 12px', background: '#ECFDF5', color: '#047857', borderRadius: '9999px', fontSize: '12px', fontWeight: 700, marginBottom: '20px', border: '1px solid #A7F3D0' }}>
            <WifiOffIcon size={15} />
            <span>NO INTERNET? NO PROBLEM.</span>
          </div>

          <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.2rem)', lineHeight: '1.12', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.035em', marginBottom: '18px' }}>
            Know before you go.<br />
            <span style={{ color: '#2563EB' }}>Pay when the network won't.</span>
          </h1>

          <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#64748B', marginBottom: '28px', maxWidth: '520px' }}>
            Scan any UPI QR code. We guide you through India's official *99# USSD cellular telecom network step-by-step. Works on iPhone, Android, and feature phones. Install once, use offline anywhere.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '28px' }}>
            <Link
              to="/app"
              className="btn btn--primary"
              style={{ padding: '14px 28px', fontSize: '15px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '10px' }}
              id="hero-launch-app"
            >
              <ScanIcon size={20} color="white" />
              <span>Open Web App</span>
            </Link>

            <Link
              to="/download"
              className="btn btn--secondary"
              style={{ padding: '14px 24px', fontSize: '15px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <span>Download & Install</span>
              <ChevronRightIcon size={16} />
            </Link>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '16px', fontSize: '12.5px', color: '#64748B' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldIcon size={15} color="#059669" /> 100% Client-Side
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircleIcon size={15} color="#059669" /> Never Sees PIN
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <WifiOffIcon size={15} color="#059669" /> Zero Runtime Data
            </span>
          </div>
        </div>

        {/* ── Interactive Phone Frame Demo with "Turn Internet Off" Toggle ── */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: '340px', background: '#FFFFFF', borderRadius: '32px', boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.2)', border: '8px solid #0F172A', padding: '18px', position: 'relative', overflow: 'hidden' }}>
            {/* Phone Notch */}
            <div style={{ width: '100px', height: '16px', background: '#0F172A', borderRadius: '0 0 10px 10px', margin: '-18px auto 14px' }} />

            {/* Toggle Switch */}
            <div style={{ background: '#F1F5F9', padding: '8px 12px', borderRadius: '10px', marginBottom: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #E2E8F0' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#0F172A' }}>Airplane Mode:</span>
              <button
                onClick={handleToggleInternet}
                style={{
                  background: demoOffline ? '#DC2626' : '#0F172A',
                  color: 'white',
                  border: 'none',
                  borderRadius: '14px',
                  padding: '4px 10px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'background 0.2s ease',
                }}
              >
                {demoOffline ? 'Offline Net' : 'Online (5G)'}
              </button>
            </div>

            {/* Route Status Card */}
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '14px', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '10.5px', fontWeight: 800, color: '#64748B', letterSpacing: '0.04em' }}>ADAPTIVE ROUTE</span>
                <div style={{ display: 'flex', gap: '3px' }}>
                  <div style={{ width: '3.5px', height: '6px', background: '#059669', borderRadius: '1px' }} />
                  <div style={{ width: '3.5px', height: '10px', background: '#059669', borderRadius: '1px' }} />
                  <div style={{ width: '3.5px', height: '14px', background: demoOffline ? '#CBD5E1' : '#059669', borderRadius: '1px' }} />
                  <div style={{ width: '3.5px', height: '18px', background: demoOffline ? '#CBD5E1' : '#059669', borderRadius: '1px' }} />
                </div>
              </div>

              {demoStep === 'idle' && (
                <div>
                  <div style={{ fontWeight: 700, color: '#059669', fontSize: '14px' }}>5G Online IP Fast Path</div>
                  <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>High-speed connectivity available.</div>
                </div>
              )}

              {demoStep === 'checking' && (
                <div>
                  <div style={{ fontWeight: 700, color: '#D97706', fontSize: '14px' }}>Routing to Telecom Rail...</div>
                  <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>Detecting SIM VoLTE signal...</div>
                </div>
              )}

              {demoStep === 'routed' && (
                <div>
                  <div style={{ fontWeight: 700, color: '#059669', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <CheckCircleIcon size={15} color="#059669" />
                    Sovereign USSD (*99#)
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>Cellular GSM band engaged. Zero data used.</div>
                </div>
              )}
            </div>

            {/* Simulated Payment Card */}
            <div style={{ background: '#FFFFFF', border: '1px dashed #CBD5E1', borderRadius: '12px', padding: '12px', textAlign: 'center', marginBottom: '14px' }}>
              <div style={{ fontSize: '10.5px', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>MERCHANT SCAN</div>
              <div style={{ fontWeight: 700, fontSize: '14px', color: '#0F172A', marginTop: '2px' }}>Sharma Kirana Store</div>
              <div className="font-mono" style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', margin: '3px 0' }}>₹150.00</div>
              <div className="font-mono" style={{ fontSize: '11px', color: '#2563EB', fontWeight: 600 }}>store@okhdfcbank</div>
            </div>

            <Link
              to="/app"
              className="btn btn--primary btn--full"
              style={{
                textAlign: 'center',
                padding: '10px',
                fontSize: '13px',
                textDecoration: 'none',
              }}
            >
              Test Live Guided Flow →
            </Link>
          </div>
        </div>
      </section>

      {/* ── 4-Step Visual Workflow ── */}
      <section style={{ background: '#F8FAFC', padding: '60px 20px', borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', fontWeight: 800, letterSpacing: '-0.025em', color: '#0F172A', marginBottom: '10px' }}>
              How Offline Payments Work in 4 Steps
            </h2>
            <p style={{ fontSize: '15px', color: '#64748B', maxWidth: '600px', margin: '0 auto' }}>
              Seamlessly executed over your telecom SIM card voice signaling channel without 4G, 5G, or Wi-Fi.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            <div className="card" style={{ padding: '22px' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#0F172A', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, marginBottom: '14px' }}>1</div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px', color: '#0F172A' }}>Scan QR Code</h3>
              <p style={{ fontSize: '13px', color: '#64748B', lineHeight: '1.5', margin: 0 }}>
                Point your rear camera, upload a photo, or paste a UPI ID. Local jsQR engine decodes payee VPA and amount on-device.
              </p>
            </div>

            <div className="card" style={{ padding: '22px' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#0F172A', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, marginBottom: '14px' }}>2</div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px', color: '#0F172A' }}>Open Phone Dialer</h3>
              <p style={{ fontSize: '13px', color: '#64748B', lineHeight: '1.5', margin: 0 }}>
                Recipient's UPI ID is prepared. Tap <strong>Open Dialer</strong> to immediately trigger *99# or bank shortcut on your SIM.
              </p>
            </div>

            <div className="card" style={{ padding: '22px' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#0F172A', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, marginBottom: '14px' }}>3</div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px', color: '#0F172A' }}>Guided Bank Menus</h3>
              <p style={{ fontSize: '13px', color: '#64748B', lineHeight: '1.5', margin: 0 }}>
                Follow bank-specific menu prompts shown on screen. Enter your secret UPI PIN only inside the phone dialer dialog.
              </p>
            </div>

            <div className="card" style={{ padding: '22px' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#0F172A', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, marginBottom: '14px' }}>4</div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px', color: '#0F172A' }}>Encrypted Receipt</h3>
              <p style={{ fontSize: '13px', color: '#64748B', lineHeight: '1.5', margin: 0 }}>
                Return to the app. Confirm status to log an immutable AES-GCM receipt with 10-minute duplicate payment protection.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Comparison Table ── */}
      <section style={{ maxWidth: '1080px', margin: '0 auto', padding: '60px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', fontWeight: 800, letterSpacing: '-0.025em', color: '#0F172A', marginBottom: '10px' }}>
            Transparent Comparison: Web App (PWA) vs Native APK
          </h2>
          <p style={{ fontSize: '15px', color: '#64748B' }}>
            Complete technical honesty regarding browser sandbox security vs native Android capabilities.
          </p>
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0' }}>
                  <th style={{ padding: '14px 20px', fontWeight: 700, color: '#0F172A' }}>Feature / Capability</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700, color: '#0F172A' }}>Web / PWA (Any Phone)</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700, color: '#2563EB' }}>Android APK (Native)</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '12px 20px', fontWeight: 600 }}>Scan QR (Rear Camera / Gallery)</td>
                  <td style={{ padding: '12px 20px', color: '#059669', fontWeight: 600 }}>✓ Supported (jsQR)</td>
                  <td style={{ padding: '12px 20px', color: '#059669', fontWeight: 600 }}>✓ Supported (CameraX)</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '12px 20px', fontWeight: 600 }}>Dialer Shortcut (*99#)</td>
                  <td style={{ padding: '12px 20px', color: '#059669', fontWeight: 600 }}>✓ One-Tap Dialer Launch</td>
                  <td style={{ padding: '12px 20px', color: '#059669', fontWeight: 600 }}>✓ Automated Dialing</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '12px 20px', fontWeight: 600 }}>Zero Runtime Internet</td>
                  <td style={{ padding: '12px 20px', color: '#059669', fontWeight: 600 }}>✓ 100% Offline Cache</td>
                  <td style={{ padding: '12px 20px', color: '#059669', fontWeight: 600 }}>✓ Zero Internet Permission</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '12px 20px', fontWeight: 600 }}>Encrypted Local History</td>
                  <td style={{ padding: '12px 20px' }}>IndexedDB + WebCrypto AES-GCM</td>
                  <td style={{ padding: '12px 20px' }}>Room + SQLCipher (Android Keystore)</td>
                </tr>
                <tr>
                  <td style={{ padding: '12px 20px', fontWeight: 600 }}>UPI PIN Isolation</td>
                  <td style={{ padding: '12px 20px', fontWeight: 700, color: '#059669' }}>Never Enters App</td>
                  <td style={{ padding: '12px 20px', fontWeight: 700, color: '#059669' }}>Never Enters App</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── Ready CTA ── */}
      <section style={{ maxWidth: '840px', margin: '0 auto', padding: '0 20px' }}>
        <div className="card" style={{ textAlign: 'center', padding: '36px 24px', borderRadius: '20px', background: '#0F172A', color: '#FFFFFF' }}>
          <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 800, marginBottom: '10px', color: '#FFFFFF' }}>
            Ready to experience offline UPI?
          </h2>
          <p style={{ fontSize: '14px', color: '#94A3B8', marginBottom: '22px', maxWidth: '480px', margin: '0 auto 22px', lineHeight: 1.5 }}>
            Launch the web app or add it to your home screen now so it's ready whenever you travel.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <Link to="/app" className="btn btn--primary" style={{ padding: '12px 24px', textDecoration: 'none', background: '#FFFFFF', color: '#0F172A' }}>
              Launch Web App
            </Link>
            <Link to="/download" className="btn btn--secondary" style={{ padding: '12px 24px', textDecoration: 'none', background: 'rgba(255,255,255,0.1)', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.2)' }}>
              Install & Download
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
