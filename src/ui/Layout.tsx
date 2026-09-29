import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useI18n } from '../i18n';
import {
  HomeIcon,
  ScanIcon,
  HistoryIcon,
  SetupIcon,
  HelpIcon,
  SovereignBrandLogo,
  DownloadIcon,
  WifiOffIcon,
} from './Icons';
import { useApp } from '../store/AppContext';
import { PWAInstallModal } from './components/PWAInstallModal';
import { OfflineGuideModal } from './components/OfflineGuideModal';
import { SegmentedSimulator } from './components/SegmentedSimulator';
import './Layout.css';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t, lang, setLang } = useI18n();
  const { toast, clearToast } = useApp();
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [showOfflineModal, setShowOfflineModal] = useState(false);

  return (
    <div className="app-layout">
      {/* Header with Sovereign Brand Logo */}
      <header className="app-header" id="app-header">
        <div className="app-header__logo">
          <SovereignBrandLogo size={32} showBadge={true} />
        </div>
        <div className="app-header__actions">
          <button
            className="btn btn--sm header-offline-btn"
            onClick={() => setShowOfflineModal(true)}
            title="How offline mode works"
          >
            <WifiOffIcon size={14} />
            <span>Guide</span>
          </button>

          <button
            className="btn btn--sm header-install-btn"
            onClick={() => setShowInstallModal(true)}
            title="Install app on Phone or Laptop"
          >
            <DownloadIcon size={14} />
            <span>Install</span>
          </button>

          <button
            className="btn btn--icon lang-toggle"
            onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
            aria-label="Switch language"
            id="lang-toggle"
            title="Switch Language (English / Hindi)"
          >
            <span className="lang-toggle__text">{lang === 'en' ? 'हि' : 'EN'}</span>
          </button>
        </div>
      </header>

      {/* Network Edge Segmented Simulator */}
      <SegmentedSimulator />

      {/* Global Toast Notification */}
      {toast && (
        <div className="toast-container" onClick={clearToast}>
          <div className={`toast toast--${toast.type}`}>
            {toast.message}
          </div>
        </div>
      )}

      {/* Main Page Content */}
      <main className="app-content page-enter" id="app-content">
        {children}
      </main>

      {/* FloatingDockNavigation with Elevated Central Scan Trigger */}
      <nav className="floating-dock-nav" id="bottom-nav" aria-label="Sovereign Navigation">
        {/* Home */}
        <NavLink
          to="/app"
          end
          className={({ isActive }) =>
            `floating-dock__item ${isActive ? 'floating-dock__item--active' : ''}`
          }
          id="nav-home"
        >
          <HomeIcon size={20} />
          <span>{t.nav.home}</span>
        </NavLink>

        {/* History */}
        <NavLink
          to="/app/history"
          className={({ isActive }) =>
            `floating-dock__item ${isActive ? 'floating-dock__item--active' : ''}`
          }
          id="nav-history"
        >
          <HistoryIcon size={20} />
          <span>{t.nav.history}</span>
        </NavLink>

        {/* Central Elevated Scan Trigger */}
        <div className="floating-dock__center-wrap">
          <NavLink
            to="/app/scan"
            className={({ isActive }) =>
              `floating-dock__scan-btn ${isActive ? 'floating-dock__scan-btn--active' : ''}`
            }
            id="nav-scan"
            aria-label="Scan QR Code"
          >
            <ScanIcon size={22} color="#FFFFFF" />
            <span className="floating-dock__scan-label">Scan</span>
          </NavLink>
        </div>

        {/* Setup */}
        <NavLink
          to="/app/setup"
          className={({ isActive }) =>
            `floating-dock__item ${isActive ? 'floating-dock__item--active' : ''}`
          }
          id="nav-setup"
        >
          <SetupIcon size={20} />
          <span>{t.nav.setup}</span>
        </NavLink>

        {/* Help */}
        <NavLink
          to="/app/help"
          className={({ isActive }) =>
            `floating-dock__item ${isActive ? 'floating-dock__item--active' : ''}`
          }
          id="nav-help"
        >
          <HelpIcon size={20} />
          <span>{t.nav.help}</span>
        </NavLink>
      </nav>

      {/* Global Modals */}
      <PWAInstallModal isOpen={showInstallModal} onClose={() => setShowInstallModal(false)} />
      <OfflineGuideModal isOpen={showOfflineModal} onClose={() => setShowOfflineModal(false)} />
    </div>
  );
};
