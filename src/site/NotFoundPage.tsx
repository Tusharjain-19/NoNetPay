import React from 'react';
import { Link } from 'react-router-dom';
import { WifiOffIcon, ScanIcon, ShieldIcon, HelpIcon, ChevronRightIcon } from '../ui/Icons';

export const NotFoundPage: React.FC = () => {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 20px 100px', textAlign: 'center' }}>
      {/* 404 Badge */}
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', background: '#FEF2F2', color: '#DC2626', borderRadius: '9999px', fontSize: '12px', fontWeight: 800, marginBottom: '20px', border: '1px solid #FECACA', letterSpacing: '0.04em' }}>
        <span>404 • ROUTE NOT FOUND</span>
      </div>

      {/* Main Error Headline */}
      <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.2rem)', fontWeight: 800, letterSpacing: '-0.03em', color: '#0F172A', margin: '0 0 14px 0' }}>
        Lost in the Signal Blackout?
      </h1>

      <p style={{ fontSize: '16px', color: '#64748B', maxWidth: '520px', margin: '0 auto 32px', lineHeight: 1.6 }}>
        The page or link you requested does not exist or may have been moved. Don't worry—your local offline payment data and cryptographic balances are completely safe.
      </p>

      {/* Action Buttons */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap', marginBottom: '48px' }}>
        <Link
          to="/"
          className="btn btn--secondary"
          style={{ padding: '12px 24px', fontSize: '14px', textDecoration: 'none' }}
        >
          ← Return to Website Home
        </Link>
        <Link
          to="/app"
          className="btn btn--primary"
          style={{ padding: '12px 28px', fontSize: '14px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
        >
          <ScanIcon size={18} color="white" />
          <span>Open Offline Web App →</span>
        </Link>
      </div>

      {/* Quick Helpful Destinations Grid */}
      <div style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'left' }}>
        <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>
          Suggested Offline Destinations
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
          <Link
            to="/app/scan"
            className="card"
            style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', textDecoration: 'none', color: '#0F172A', transition: 'all 0.15s ease' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ScanIcon size={18} color="#0F172A" />
              </div>
              <div>
                <strong style={{ fontSize: '14px', display: 'block' }}>Scan & Pay</strong>
                <span style={{ fontSize: '12px', color: '#64748B' }}>Decode merchant QR offline</span>
              </div>
            </div>
            <ChevronRightIcon size={16} color="#94A3B8" />
          </Link>

          <Link
            to="/app/help"
            className="card"
            style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', textDecoration: 'none', color: '#0F172A', transition: 'all 0.15s ease' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <HelpIcon size={18} color="#0F172A" />
              </div>
              <div>
                <strong style={{ fontSize: '14px', display: 'block' }}>Help & Knowledge Base</strong>
                <span style={{ fontSize: '12px', color: '#64748B' }}>*99# dialing and troubleshooting</span>
              </div>
            </div>
            <ChevronRightIcon size={16} color="#94A3B8" />
          </Link>

          <Link
            to="/compatibility"
            className="card"
            style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', textDecoration: 'none', color: '#0F172A', transition: 'all 0.15s ease' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldIcon size={18} color="#0F172A" />
              </div>
              <div>
                <strong style={{ fontSize: '14px', display: 'block' }}>Bank & Carrier Matrix</strong>
                <span style={{ fontSize: '12px', color: '#64748B' }}>Check *99# USSD support</span>
              </div>
            </div>
            <ChevronRightIcon size={16} color="#94A3B8" />
          </Link>

          <Link
            to="/download"
            className="card"
            style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', textDecoration: 'none', color: '#0F172A', transition: 'all 0.15s ease' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <WifiOffIcon size={18} color="#0F172A" />
              </div>
              <div>
                <strong style={{ fontSize: '14px', display: 'block' }}>Install Offline App</strong>
                <span style={{ fontSize: '12px', color: '#64748B' }}>PWA & Android APK</span>
              </div>
            </div>
            <ChevronRightIcon size={16} color="#94A3B8" />
          </Link>
        </div>
      </div>
    </div>
  );
};
