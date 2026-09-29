import React, { useState } from 'react';
import { ChevronRightIcon } from '../ui/Icons';

export const FaqPage: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Does NoNetPay require an active internet connection or mobile data recharge?',
      a: 'No. The app functions completely without internet after your first visit. Payments are completed over your mobile operator’s GSM voice signaling band using NPCI’s official *99# USSD channel.',
    },
    {
      q: 'Does *99# work on Jio, Airtel, Vi, and BSNL?',
      a: 'Yes. NPCI’s *99# is an industry-wide protocol. On Airtel, Vi, and BSNL, it works via standard 2G/3G/4G GSM USSD. On Jio, it operates via VoLTE IMS USSD messaging.',
    },
    {
      q: 'Is there a transaction limit for offline payments?',
      a: 'Yes. Under NPCI regulations, the daily limit for *99# USSD payments is ₹5,000 per transaction, and up to ₹5,000 per day. There are no fees except a standard telecom carrier USSD cap of ₹0.50 per session.',
    },
    {
      q: 'Does NoNetPay ask for or see my UPI PIN?',
      a: 'Never. NoNetPay has zero PIN input fields. You enter your UPI PIN only inside the native phone dialer interface provided by your bank and carrier. Our code cannot read your PIN.',
    },
    {
      q: 'What should I do if a payment says UNKNOWN?',
      a: 'Do not pay again immediately. First use the "Check Balance" shortcut to verify if money left your account. If the balance decreased, your payment went through. If not, you can safely re-attempt.',
    },
    {
      q: 'How do I link my bank account to *99# for the first time?',
      a: 'Open your phone dialer, dial *99#, and type the first 3 letters of your bank (e.g. SBI, HDF, ICI). Select your bank account and enter the last 6 digits of your debit card and expiry date to set a UPI PIN.',
    },
  ];

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px 80px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '14px' }}>
          Frequently Asked Questions
        </h1>
        <p style={{ fontSize: '1.05rem', color: 'var(--color-ink-muted)' }}>
          Common questions about offline payments, security, and banking USSD codes.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {faqs.map((faq, i) => (
          <div
            key={i}
            className="card"
            style={{ cursor: 'pointer', transition: 'box-shadow var(--transition-fast)' }}
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--color-ink)' }}>
                {faq.q}
              </h2>
              <div style={{ transform: openIndex === i ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s ease', color: 'var(--color-accent)' }}>
                <ChevronRightIcon size={20} />
              </div>
            </div>
            {openIndex === i && (
              <p style={{ marginTop: '12px', fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--color-ink-muted)', marginBottom: 0 }}>
                {faq.a}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
