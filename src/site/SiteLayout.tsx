import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { SovereignBrandLogo, WifiOffIcon, ShieldIcon, PhoneIcon, DownloadIcon, XCircleIcon } from '../ui/Icons';
import './SiteLayout.css';

export const SiteLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isLinkActive = (path: string) => location.pathname === path;

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <div className="site-layout">
      {/* Top Marketing Navigation */}
      <header className="site-nav">
        <div className="site-nav__inner">
          <Link to="/" className="site-logo" onClick={closeMenu}>
            <SovereignBrandLogo size={32} showBadge={true} />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="site-nav__links">
            <Link to="/how-it-works" className={`site-nav__link ${isLinkActive('/how-it-works') ? 'active' : ''}`}>
              How It Works
            </Link>
            <Link to="/compatibility" className={`site-nav__link ${isLinkActive('/compatibility') ? 'active' : ''}`}>
              Compatibility
            </Link>
            <Link to="/security" className={`site-nav__link ${isLinkActive('/security') ? 'active' : ''}`}>
              Security & PIN
            </Link>
            <Link to="/faq" className={`site-nav__link ${isLinkActive('/faq') ? 'active' : ''}`}>
              FAQ
            </Link>
            <Link to="/download" className={`site-nav__link ${isLinkActive('/download') ? 'active' : ''}`}>
              Install & Download
            </Link>
          </nav>

          {/* Header Action / Mobile Toggle */}
          <div className="site-nav__actions">
            <Link to="/app" className="site-nav__cta" id="nav-open-app-btn">
              <span>Launch App</span>
              <span className="site-nav__cta-badge">PWA</span>
            </Link>

            {/* Mobile Hamburger Toggle */}
            <button
              className="site-nav__mobile-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <XCircleIcon size={24} color="var(--color-ink)" />
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Slide-Down Navigation Menu */}
        {mobileMenuOpen && (
          <div className="site-nav__mobile-drawer page-enter">
            <div className="site-nav__mobile-links">
              <Link to="/how-it-works" className={`site-nav__mobile-link ${isLinkActive('/how-it-works') ? 'active' : ''}`} onClick={closeMenu}>
                <span>How It Works (*99#)</span>
              </Link>
              <Link to="/compatibility" className={`site-nav__mobile-link ${isLinkActive('/compatibility') ? 'active' : ''}`} onClick={closeMenu}>
                <span>Bank & Carrier List</span>
              </Link>
              <Link to="/security" className={`site-nav__mobile-link ${isLinkActive('/security') ? 'active' : ''}`} onClick={closeMenu}>
                <span>Security & Zero-PIN</span>
              </Link>
              <Link to="/faq" className={`site-nav__mobile-link ${isLinkActive('/faq') ? 'active' : ''}`} onClick={closeMenu}>
                <span>Frequently Asked Questions</span>
              </Link>
              <Link to="/download" className={`site-nav__mobile-link ${isLinkActive('/download') ? 'active' : ''}`} onClick={closeMenu}>
                <span>Install App / Download APK</span>
              </Link>
              <div style={{ paddingTop: '10px' }}>
                <Link to="/app" className="btn btn--primary btn--full" onClick={closeMenu} style={{ padding: '12px' }}>
                  Open Offline Web App (PWA) →
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="site-main">{children}</main>

      {/* Sovereign Marketing Footer */}
      <footer className="site-footer">
        <div className="site-footer__inner">
          <div className="site-footer__col">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <SovereignBrandLogo size={28} showBadge={false} />
            </div>
            <p style={{ fontSize: '0.88rem', lineHeight: '1.6', color: '#94A3B8' }}>
              Sovereign, connectivity-adaptive UPI payment infrastructure for India. Pay when mobile data fails via verified *99# USSD rails.
            </p>
          </div>

          <div className="site-footer__col">
            <h4>Navigation</h4>
            <ul className="site-footer__links">
              <li><Link to="/app">Launch Offline Web App</Link></li>
              <li><Link to="/how-it-works">How *99# Works</Link></li>
              <li><Link to="/compatibility">Bank & Carrier List</Link></li>
              <li><Link to="/download">Install & Download APK</Link></li>
            </ul>
          </div>

          <div className="site-footer__col">
            <h4>Security & Standards</h4>
            <ul className="site-footer__links">
              <li><Link to="/security">Zero PIN Capture Architecture</Link></li>
              <li><Link to="/app/diagnostics">Diagnostic Hardware Audit</Link></li>
              <li><Link to="/faq">Offline FAQ & Troubleshooting</Link></li>
              <li><a href="https://www.npci.org.in/what-we-do/nuup/product-overview" target="_blank" rel="noopener noreferrer">NPCI *99# Official Portal ↗</a></li>
            </ul>
          </div>

          <div className="site-footer__col">
            <h4>Compliance</h4>
            <p style={{ fontSize: '0.8rem', lineHeight: '1.5', color: '#64748B' }}>
              NoNetPay is an open-source assistive utility. Not an intermediary. Standard carrier USSD operator rates apply.
            </p>
          </div>
        </div>

        <div className="site-footer__bottom">
          <span>© 2026 NoNetPay • Sovereign Offline UPI Infrastructure</span>
          <span>100% Client-Side • Zero Data Dispatch</span>
        </div>
      </footer>
    </div>
  );
};
