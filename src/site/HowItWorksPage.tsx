import React from 'react';
import { Link } from 'react-router-dom';
import { PhoneIcon, ShieldIcon, WifiOffIcon, ChevronRightIcon, CheckCircleIcon } from '../ui/Icons';

export const HowItWorksPage: React.FC = () => {
  return (
    <div style={{ maxWidth: '840px', margin: '0 auto', padding: '40px 20px 80px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', background: 'rgba(15, 118, 110, 0.1)', color: 'var(--color-accent)', borderRadius: '16px', fontSize: '0.85rem', fontWeight: 700, marginBottom: '14px' }}>
          NPCI NUUP PROTOCOL EXPLAINED
        </div>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '16px' }}>
          How NoNetPay Works Without Internet
        </h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--color-ink-muted)', lineHeight: '1.6' }}>
          Understanding the national USSD *99# infrastructure that connects your bank without 4G, 5G, or Wi-Fi.
        </p>
      </div>

      <div className="card card--elevated" style={{ padding: '32px', marginBottom: '36px' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '16px', color: 'var(--color-ink)' }}>
          What is *99# (NUUP)?
        </h2>
        <p style={{ fontSize: '1rem', lineHeight: '1.6', color: 'var(--color-ink-muted)', marginBottom: '16px' }}>
          <strong>NUUP (National Unified USSD Platform)</strong> is a national financial inclusion service developed by the <strong>National Payments Corporation of India (NPCI)</strong> and Indian telecom carriers.
        </p>
        <p style={{ fontSize: '1rem', lineHeight: '1.6', color: 'var(--color-ink-muted)', marginBottom: '16px' }}>
          Unlike mobile apps that require internet data packets (TCP/IP), USSD messages travel through the <strong>signalling channel (cellular GSM voice band)</strong> of your SIM card. As long as your phone has cellular signal bars to make a voice call, USSD functions.
        </p>
        <div style={{ background: 'var(--color-bg-secondary)', padding: '16px', borderRadius: '12px', borderLeft: '4px solid var(--color-accent)' }}>
          <strong style={{ fontSize: '0.95rem', display: 'block', marginBottom: '4px' }}>Telecom Regulatory Rule:</strong>
          <span style={{ fontSize: '0.88rem', color: 'var(--color-ink-muted)' }}>
            TRAI (Telecom Regulatory Authority of India) mandates that telecom operators cannot charge more than ₹0.50 per USSD session, making it a reliable public infrastructure.
          </span>
        </div>
      </div>

      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '20px' }}>
        The NoNetPay Guided Workflow
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '40px' }}>
        <div className="card" style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--color-accent)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>
            1
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '6px' }}>Local-First QR Decoding</h3>
            <p style={{ fontSize: '0.95rem', color: 'var(--color-ink-muted)', lineHeight: '1.5', margin: 0 }}>
              When you scan a UPI QR at a merchant store, our bundled WebAssembly QR engine parses the standard <code>upi://pay</code> payload locally. No data is sent to any server.
            </p>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--color-accent)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>
            2
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '6px' }}>Clipboard & Dialer Hand-off</h3>
            <p style={{ fontSize: '0.95rem', color: 'var(--color-ink-muted)', lineHeight: '1.5', margin: 0 }}>
              The recipient's UPI address is copied to your clipboard with a 60-second auto-wipe security timer. You tap <strong>Open Dialer</strong>, which opens the native dialer dialed to <code>*99#</code>.
            </p>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--color-accent)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>
            3
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '6px' }}>Bank-Specific Step Guidance</h3>
            <p style={{ fontSize: '0.95rem', color: 'var(--color-ink-muted)', lineHeight: '1.5', margin: 0 }}>
              NoNetPay stays in your recent apps tray showing you exactly what numbers to press for your specific bank (e.g. Reply 1 for Send Money &gt; Reply 3 for UPI ID &gt; Paste Payee &gt; Enter Amount).
            </p>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--color-accent)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>
            4
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '6px' }}>Duplicate Guard & Result Confirmation</h3>
            <p style={{ fontSize: '0.95rem', color: 'var(--color-ink-muted)', lineHeight: '1.5', margin: 0 }}>
              When you return to NoNetPay, we prompt for the outcome. If an outcome is uncertain, our state machine treats it as UNKNOWN and holds a 10-minute duplicate guard to protect your bank balance.
            </p>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center' }}>
        <Link to="/app" className="btn btn--primary" style={{ padding: '12px 28px', textDecoration: 'none' }}>
          Try It in the Web App →
        </Link>
      </div>
    </div>
  );
};
