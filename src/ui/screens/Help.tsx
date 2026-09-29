import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useI18n } from '../../i18n';
import {
  SearchIcon,
  ChevronRightIcon,
  ShieldIcon,
  AlertCircleIcon,
  PhoneIcon,
  WalletIcon,
  LaptopIcon,
} from '../Icons';
import './Help.css';

interface FAQItem {
  question: string;
  answer: string;
  category: 'general' | 'payments' | 'troubleshooting' | 'security';
}

const faqs: FAQItem[] = [
  {
    category: 'general',
    question: 'What is NoNetPay and how does it work without internet?',
    answer:
      'NoNetPay is a sovereign offline UPI payment client for India. When cellular data or Wi-Fi is unavailable (trains, basements, crowded markets, outages), NoNetPay decodes UPI QR codes locally and routes the transaction through NPCI’s official *99# USSD GSM rail or 123PAY voice banking. It requires zero internet data.',
  },
  {
    category: 'general',
    question: 'Is NoNetPay a bank or payment intermediary?',
    answer:
      'No. NoNetPay is a client-side routing assistant. It never holds, handles, or moves money. All settlements occur directly between your registered bank account and the payee via NPCI’s national financial switch.',
  },
  {
    category: 'payments',
    question: 'How do I scan a QR code and complete an offline payment?',
    answer:
      '1. Open the Scan screen and point your rear camera at any standard UPI QR code (or import a photo from your gallery).\n2. NoNetPay decodes the merchant’s VPA (UPI ID), verified name, and suggested amount offline.\n3. Tap "Initiate Offline Payment" to dial *99#.\n4. Follow the step-by-step overlay guide to enter your UPI PIN directly in your phone’s native dialer.\n5. Return to NoNetPay to record the outcome and generate your offline cryptographic receipt.',
  },
  {
    category: 'payments',
    question: 'What is the *99# USSD service and which banks support it?',
    answer:
      '*99# is the National Unified USSD Platform (NUUP) built by NPCI and Indian telecom carriers. Over 80 commercial and regional rural banks in India support *99#, including SBI (*99*41#), HDFC (*99*44#), ICICI (*99*45#), Axis (*99*46#), and PNB (*99*42#).',
  },
  {
    category: 'security',
    question: 'Why doesn’t NoNetPay ever ask for or store my UPI PIN?',
    answer:
      'Per RBI and NPCI sovereign security protocols, your UPI PIN should NEVER be entered into a third-party app or webpage. In NoNetPay, you enter your PIN strictly within your phone’s native operating system dialer (USSD session). NoNetPay has zero access to your keystrokes or PIN.',
  },
  {
    category: 'security',
    question: 'How is transaction history stored on my device?',
    answer:
      'All transaction records and bank preferences are encrypted using browser WebCrypto AES-GCM and stored inside local IndexedDB. No analytics, tracking beacons, or telemetry packets are transmitted to external servers.',
  },
  {
    category: 'troubleshooting',
    question: 'What should I do if a payment ends in "UNKNOWN" status?',
    answer:
      'CRITICAL: Never pay again immediately. If the USSD session timed out or closed abruptly, the funds may still have been debited. Tap "Check Balance" in NoNetPay or check your SMS inbox. If money was deducted, show the merchant your transaction timestamp and mark it "Confirmed". If not debited after 10 minutes, retry.',
  },
  {
    category: 'troubleshooting',
    question: 'What if dialing *99# displays "Connection problem or invalid MMI code"?',
    answer:
      'This occurs if: 1) Your phone is set to a data-only SIM without active voice/USSD recharge, 2) You are in an area with zero cellular tower signal (Dead Zone), or 3) Your carrier requires disabling Wi-Fi Calling while executing USSD codes. Switch to your bank-registered SIM and ensure you have mobile signal bars.',
  },
];

export const HelpScreen: React.FC = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filteredFaqs = faqs.filter((faq) => {
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q || faq.question.toLowerCase().includes(q) || faq.answer.toLowerCase().includes(q);
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { id: 'all', label: 'All Topics' },
    { id: 'general', label: 'Overview' },
    { id: 'payments', label: 'Payments & *99#' },
    { id: 'security', label: 'PIN & Security' },
    { id: 'troubleshooting', label: 'Failures & Recovery' },
  ];

  return (
    <div className="help" id="help-screen">
      {/* Header */}
      <div className="help__header">
        <h1 className="help__title">{t.help.title}</h1>
        <p style={{ fontSize: '13px', color: 'var(--color-ink-secondary)', marginTop: '4px' }}>
          Knowledge base & troubleshooting guide for offline financial resilience
        </p>
      </div>

      {/* Search Bar */}
      <div className="help__search stagger-item">
        <SearchIcon size={18} color="var(--color-ink-muted)" />
        <input
          type="text"
          className="help__search-input"
          placeholder="Search questions, *99#, PIN security, error codes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          id="help-search"
        />
      </div>

      {/* Category Pills */}
      <div className="help__categories stagger-item">
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`help__category ${activeCategory === cat.id ? 'help__category--active' : ''}`}
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* FAQ Accordion List */}
      <div className="help__faq-list">
        {filteredFaqs.map((faq, i) => (
          <div
            key={i}
            className={`help__faq-item card stagger-item ${
              openIndex === i ? 'help__faq-item--open' : ''
            }`}
            id={`faq-${i}`}
          >
            <button
              className="help__faq-question"
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              aria-expanded={openIndex === i}
            >
              <span>{faq.question}</span>
              <ChevronRightIcon
                size={16}
                className={`help__faq-chevron ${openIndex === i ? 'help__faq-chevron--open' : ''}`}
              />
            </button>
            {openIndex === i && (
              <div className="help__faq-answer page-enter">
                {faq.answer.split('\n').map((line, j) => (
                  <p key={j} style={{ margin: '0 0 8px 0', lineHeight: 1.6 }}>
                    {line}
                  </p>
                ))}
              </div>
            )}
          </div>
        ))}

        {filteredFaqs.length === 0 && (
          <div className="help__empty card">
            <p style={{ margin: 0, color: 'var(--color-ink-muted)' }}>
              No matching topics found for "{search}". Try searching for "*99#", "PIN", or "Bank".
            </p>
          </div>
        )}
      </div>

      {/* Quick Diagnostics & Setup Links */}
      <div className="card" style={{ marginTop: '20px', padding: '18px', background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 6px 0', color: '#0F172A' }}>
          Diagnostic Tools & Offline Testing
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--color-ink-secondary)', margin: '0 0 14px 0', lineHeight: 1.5 }}>
          Test carrier compatibility, verify PWA offline cache state, and generate full diagnostic reports.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <button
            className="btn btn--secondary"
            onClick={() => navigate('/app/diagnostics')}
            style={{ fontSize: '12.5px', padding: '10px 12px' }}
          >
            System Diagnostics →
          </button>
          <button
            className="btn btn--secondary"
            onClick={() => navigate('/app/readiness')}
            style={{ fontSize: '12.5px', padding: '10px 12px' }}
          >
            Rail Readiness Dial →
          </button>
        </div>
      </div>
    </div>
  );
};
