import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../../i18n';
import { useApp } from '../../store/AppContext';
import banksData from '../../content/banks.json';
import {
  ChevronRightIcon,
  CheckCircleIcon,
  SearchIcon,
  CheckIcon,
  AlertCircleIcon,
  DownloadIcon,
  PhoneIcon,
  LaptopIcon,
  ShieldIcon,
  WalletIcon,
} from '../Icons';
import { PWAInstallModal } from '../components/PWAInstallModal';
import './Setup.css';

export const SetupScreen: React.FC = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { selectedBank, setSelectedBank, setSetupComplete, showToast } = useApp();

  // If a bank is already selected, default to step 2; otherwise step 1
  const [step, setStep] = useState<number>(selectedBank ? 2 : 1);
  const [bankSearch, setBankSearch] = useState('');
  const [showInstallModal, setShowInstallModal] = useState(false);

  const filteredBanks = useMemo(() => {
    const q = bankSearch.toLowerCase().trim();
    if (!q) return banksData.banks;
    return banksData.banks.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.id.toLowerCase().includes(q) ||
        (b.ussd.shortcutFormat && b.ussd.shortcutFormat.includes(q))
    );
  }, [bankSearch]);

  // Guaranteed fallback so currentBank is never undefined
  const currentBank = useMemo(() => {
    if (selectedBank) {
      const found = banksData.banks.find((b) => b.id === selectedBank);
      if (found) return found;
    }
    return banksData.banks[0]; // Default to State Bank of India
  }, [selectedBank]);

  const handleSelectBank = (bankId: string) => {
    setSelectedBank(bankId);
    setStep(2);
    const bank = banksData.banks.find((b) => b.id === bankId);
    showToast(`Selected ${bank?.name || 'Bank'}`, 'info');
  };

  const handleFinish = () => {
    setSetupComplete(true);
    showToast('Offline UPI setup complete! You are ready to pay without internet.', 'success');
    navigate('/app');
  };

  return (
    <div className="setup" id="setup-screen">
      {/* Header */}
      <div className="setup__header">
        <h1 className="setup__title">{t.setup.title}</h1>
        <p style={{ fontSize: '13px', color: 'var(--color-ink-secondary)', marginTop: '4px' }}>
          Configure your bank's sovereign offline *99# rail in 4 simple steps
        </p>
      </div>

      {/* Interactive Step Stepper */}
      <div className="setup__progress stagger-item">
        {[
          { num: 1, label: 'Bank' },
          { num: 2, label: 'USSD Link' },
          { num: 3, label: 'Install' },
          { num: 4, label: 'Practice' },
        ].map(({ num, label }) => (
          <div
            key={num}
            className={`setup__progress-step ${num === step ? 'setup__progress-step--active' : ''} ${
              num < step ? 'setup__progress-step--done' : ''
            }`}
            onClick={() => setStep(num)}
            role="button"
            tabIndex={0}
            title={`Go to step ${num}: ${label}`}
          >
            <div className="setup__progress-dot">
              {num < step ? <CheckIcon size={14} /> : num}
            </div>
            <span className="setup__progress-label">{label}</span>
          </div>
        ))}
        <div className="setup__progress-line" style={{ width: `${((step - 1) / 3) * 100}%` }} />
      </div>

      {/* ── STEP 1: Select Bank ── */}
      {step === 1 && (
        <div className="setup__step page-enter">
          <div>
            <h2 className="setup__step-title">{t.setup.step1Title}</h2>
            <p className="setup__step-desc">{t.setup.step1Desc}</p>
          </div>

          <div className="setup__bank-search">
            <SearchIcon size={18} color="var(--color-ink-muted)" />
            <input
              type="text"
              placeholder="Search by bank name or shortcut (e.g. SBI, HDFC, *99*41#)..."
              value={bankSearch}
              onChange={(e) => setBankSearch(e.target.value)}
              className="setup__bank-search-input"
              id="bank-search"
              autoFocus
            />
          </div>

          <div className="setup__bank-list">
            {filteredBanks.map((bank) => (
              <button
                key={bank.id}
                className={`setup__bank-item card ${
                  selectedBank === bank.id ? 'setup__bank-item--selected' : ''
                }`}
                onClick={() => handleSelectBank(bank.id)}
                id={`bank-${bank.id}`}
              >
                <div className="setup__bank-initial">{bank.name[0]}</div>
                <div className="setup__bank-info">
                  <span className="setup__bank-name">{bank.name}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                    <span className="setup__bank-shortcut font-mono" style={{ fontSize: '11px', color: 'var(--color-ink-muted)' }}>
                      {bank.ussd.shortcutFormat || '*99#'}
                    </span>
                    <span
                      className={`setup__bank-status setup__bank-status--${bank.ussd.status.toLowerCase()}`}
                    >
                      {bank.ussd.status === 'UNVERIFIED' ? t.setup.notVerified : t.setup.verified}
                    </span>
                  </div>
                </div>
                <ChevronRightIcon size={18} color="var(--color-ink-muted)" />
              </button>
            ))}

            {filteredBanks.length === 0 && (
              <div style={{ textAlign: 'center', padding: '30px', color: 'var(--color-ink-muted)' }}>
                No bank found matching "{bankSearch}". You can use the universal *99# dialer with any NPCI-registered bank.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── STEP 2: Link Guide ── */}
      {step === 2 && (
        <div className="setup__step page-enter">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h2 className="setup__step-title">{t.setup.step2Title}</h2>
              <p className="setup__step-desc">{t.setup.step2Desc}</p>
            </div>
            <button
              className="btn btn--ghost btn--sm"
              onClick={() => setStep(1)}
              style={{ fontSize: '12px' }}
            >
              Change Bank
            </button>
          </div>

          <div className="setup__link-card card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
              <div>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-ink-muted)', fontWeight: 700, letterSpacing: '0.04em' }}>
                  Configured Bank
                </span>
                <div className="setup__link-bank" style={{ marginTop: '2px' }}>{currentBank.name}</div>
              </div>
              <div className="setup__link-code font-mono">
                {currentBank.ussd.shortcutFormat || '*99#'}
              </div>
            </div>

            <div className="setup__link-steps">
              {(currentBank.linkGuide || currentBank.ussd.menuSteps).map(
                (stepText: string, i: number) => (
                  <div key={i} className="setup__link-step">
                    <div className="setup__link-step-num">{i + 1}</div>
                    <span style={{ lineHeight: 1.5 }}>{stepText}</span>
                  </div>
                )
              )}
            </div>

            <div className="setup__link-status">
              <span
                className={`setup__bank-status setup__bank-status--${currentBank.ussd.status.toLowerCase()}`}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                {currentBank.ussd.status === 'UNVERIFIED' ? (
                  <>
                    <AlertCircleIcon size={14} /> {t.setup.notVerified}
                  </>
                ) : (
                  <>
                    <CheckIcon size={14} /> Verified Offline Compatible
                  </>
                )}
              </span>
              {currentBank.ussd.verified_on && (
                <span className="setup__link-verified">
                  Last verified: {currentBank.ussd.verified_on}
                </span>
              )}
            </div>
          </div>

          <div className="setup__nav-btns">
            <button className="btn btn--secondary" onClick={() => setStep(1)}>
              {t.setup.back}
            </button>
            <button className="btn btn--primary" onClick={() => setStep(3)}>
              Next: Offline Install →
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 3: Offline PWA Installation ── */}
      {step === 3 && (
        <div className="setup__step page-enter">
          <div>
            <h2 className="setup__step-title">{t.setup.step3Title}</h2>
            <p className="setup__step-desc">{t.setup.step3Desc}</p>
          </div>

          <div className="setup__install-card card">
            <div style={{ marginBottom: '16px', textAlign: 'center' }}>
              <button
                className="btn btn--primary btn--full"
                onClick={() => setShowInstallModal(true)}
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <DownloadIcon size={18} />
                <span>Launch App Installation Helper</span>
              </button>
            </div>

            <div className="setup__install-section">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <PhoneIcon size={18} color="var(--color-brand-blue)" />
                <h3 style={{ margin: 0, fontSize: '15px' }}>On Mobile Phone (Recommended)</h3>
              </div>
              <ol className="setup__install-steps" style={{ marginTop: '8px' }}>
                <li>Tap browser menu (⋮) → select <strong>"Install App"</strong> or <strong>"Add to Home screen"</strong>.</li>
                <li>An app icon is saved to your phone. It launches instantly even when mobile data is turned completely off.</li>
              </ol>
            </div>

            <div className="setup__install-divider" />

            <div className="setup__install-section">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <LaptopIcon size={18} color="var(--color-brand-blue)" />
                <h3 style={{ margin: 0, fontSize: '15px' }}>On Laptop / Desktop</h3>
              </div>
              <ol className="setup__install-steps" style={{ marginTop: '8px' }}>
                <li>Click the Install badge in your address bar or browser menu.</li>
                <li>Runs as a standalone desktop window with offline service worker caching.</li>
              </ol>
            </div>
          </div>

          <div className="setup__nav-btns">
            <button className="btn btn--secondary" onClick={() => setStep(2)}>
              {t.setup.back}
            </button>
            <button className="btn btn--primary" onClick={() => setStep(4)}>
              Next: Practice Run →
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 4: Practice Run ── */}
      {step === 4 && (
        <div className="setup__step page-enter">
          <div>
            <h2 className="setup__step-title">{t.setup.step4Title}</h2>
            <p className="setup__step-desc">{t.setup.step4Desc}</p>
          </div>

          <div className="setup__practice-card card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <WalletIcon size={22} color="var(--color-brand-blue)" />
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>Test Offline Balance Query</h3>
            </div>
            <p style={{ margin: '4px 0 16px 0', fontSize: '13.5px', color: 'var(--color-ink-secondary)' }}>
              A practice run validates your SIM card's USSD connection with {currentBank.name}. It checks your balance using the offline *99# dialer without moving any funds.
            </p>
            <button
              className="btn btn--secondary btn--full"
              onClick={() => navigate('/app/balance')}
              id="practice-balance-btn"
            >
              <span>Practice Balance Check ({currentBank.ussd.shortcutFormat || '*99#'})</span>
            </button>
          </div>

          <div className="card" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-success)' }}>
              <ShieldIcon size={18} />
              <strong style={{ fontSize: '13px' }}>Bank Security Note</strong>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--color-ink-secondary)', margin: '6px 0 0 0', lineHeight: 1.5 }}>
              Your UPI PIN is never entered into or handled by NoNetPay. You always enter your PIN in your phone's native dialer.
            </p>
          </div>

          <div className="setup__nav-btns" style={{ marginTop: '12px' }}>
            <button className="btn btn--secondary" onClick={() => setStep(3)}>
              {t.setup.back}
            </button>
            <button className="btn btn--primary" onClick={handleFinish} id="finish-setup-btn">
              <span>{t.setup.finish} & Enter App ✓</span>
            </button>
          </div>
        </div>
      )}

      <PWAInstallModal isOpen={showInstallModal} onClose={() => setShowInstallModal(false)} />
    </div>
  );
};
