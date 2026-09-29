import React, { useState, useEffect } from 'react';
import { DownloadIcon, PhoneIcon, LaptopIcon, XCircleIcon, CheckIcon, ShareIcon, InfoIcon } from '../Icons';
import './PWAInstallModal.css';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'phone' | 'laptop'>('phone');
  const [isInstalled, setIsInstalled] = useState<boolean>(false);

  useEffect(() => {
    // Listen for PWA prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Check if already in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      alert('To install on your device, use your browser menu (3 dots) and tap "Install app" or "Add to Home Screen".');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content install-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="install-modal__header">
          <div className="install-modal__title-group">
            <div className="install-modal__icon">
              <DownloadIcon size={24} color="var(--color-teal-600)" />
            </div>
            <div>
              <h3 className="install-modal__title">Install NoNetPay</h3>
              <p className="install-modal__subtitle">Use offline anytime on Phone & Laptop</p>
            </div>
          </div>
          <button className="btn btn--icon install-modal__close" onClick={onClose} aria-label="Close">
            <XCircleIcon size={20} color="var(--color-slate-400)" />
          </button>
        </div>

        {/* Device Switcher Tabs */}
        <div className="install-modal__tabs">
          <button
            className={`install-modal__tab ${activeTab === 'phone' ? 'install-modal__tab--active' : ''}`}
            onClick={() => setActiveTab('phone')}
          >
            <PhoneIcon size={18} />
            <span>On Mobile Phone</span>
          </button>
          <button
            className={`install-modal__tab ${activeTab === 'laptop' ? 'install-modal__tab--active' : ''}`}
            onClick={() => setActiveTab('laptop')}
          >
            <LaptopIcon size={18} />
            <span>On Laptop / PC</span>
          </button>
        </div>

        {/* Status Badge */}
        {isInstalled && (
          <div className="install-modal__badge install-modal__badge--success">
            <CheckIcon size={16} />
            <span>NoNetPay is already installed on this device!</span>
          </div>
        )}

        {/* Direct Install Button (Chrome / Edge / Supported Browser) */}
        {!isInstalled && deferredPrompt && (
          <div className="install-modal__direct-box">
            <p className="install-modal__direct-text">Instant 1-Click Installation Available!</p>
            <button className="btn btn--primary btn--full install-modal__btn" onClick={handleInstallClick}>
              <DownloadIcon size={20} />
              <span>Install Now</span>
            </button>
          </div>
        )}

        {/* Instructions Content */}
        <div className="install-modal__body">
          {activeTab === 'phone' ? (
            <div className="install-steps">
              <h4 className="install-steps__heading">Mobile Instructions (Android & iOS)</h4>
              
              <div className="install-step">
                <div className="install-step__num">1</div>
                <div className="install-step__content">
                  <strong>Android (Chrome / Edge)</strong>
                  <p>Tap the <strong>3 dots menu (⋮)</strong> at the top right of your browser, then select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</p>
                </div>
              </div>

              <div className="install-step">
                <div className="install-step__num">2</div>
                <div className="install-step__content">
                  <strong>iPhone / iPad (Safari)</strong>
                  <p>Tap the <strong>Share button</strong> <ShareIcon size={14} className="inline-icon" /> at the bottom of Safari, scroll down and tap <strong>"Add to Home Screen"</strong>.</p>
                </div>
              </div>

              <div className="install-step">
                <div className="install-step__num">3</div>
                <div className="install-step__content">
                  <strong>Launch Offline</strong>
                  <p>An app icon will be added to your mobile home screen. Open it anytime even without active internet!</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="install-steps">
              <h4 className="install-steps__heading">Laptop & Desktop Instructions (Windows / Mac)</h4>
              
              <div className="install-step">
                <div className="install-step__num">1</div>
                <div className="install-step__content">
                  <strong>Address Bar Install Icon</strong>
                  <p>Look at the right side of your browser URL bar for the <strong>Install icon <DownloadIcon size={14} className="inline-icon" /></strong> and click it.</p>
                </div>
              </div>

              <div className="install-step">
                <div className="install-step__num">2</div>
                <div className="install-step__content">
                  <strong>Browser Menu Method</strong>
                  <p>Or click browser menu <strong>(⋮ or ...)</strong> &rarr; <strong>"Cast, save and share"</strong> &rarr; <strong>"Install NoNetPay..."</strong>.</p>
                </div>
              </div>

              <div className="install-step">
                <div className="install-step__num">3</div>
                <div className="install-step__content">
                  <strong>Desktop App Experience</strong>
                  <p>NoNetPay will open in its own clean app window like a native desktop app on your Laptop!</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Benefits Note */}
        <div className="install-modal__note">
          <InfoIcon size={16} color="var(--color-teal-700)" />
          <span>Installed PWA works offline without internet, loads in 0.1s, and saves no tracking data.</span>
        </div>

        {/* Footer */}
        <div className="install-modal__footer">
          <button className="btn btn--outline btn--full" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
