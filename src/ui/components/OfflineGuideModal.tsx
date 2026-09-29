import React from 'react';
import { WifiOffIcon, PhoneIcon, ScanIcon, ShieldIcon, XCircleIcon, CheckCircleIcon, ZapIcon } from '../Icons';
import './OfflineGuideModal.css';

interface OfflineGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OfflineGuideModal: React.FC<OfflineGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content offline-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="offline-modal__header">
          <div className="offline-modal__title-group">
            <div className="offline-modal__icon">
              <WifiOffIcon size={24} color="var(--color-teal-600)" />
            </div>
            <div>
              <h3 className="offline-modal__title">How Offline Payment Works</h3>
              <p className="offline-modal__subtitle">No Internet? Pay in 3 Easy Steps!</p>
            </div>
          </div>
          <button className="btn btn--icon offline-modal__close" onClick={onClose} aria-label="Close">
            <XCircleIcon size={20} color="var(--color-slate-400)" />
          </button>
        </div>

        {/* Highlight Banner */}
        <div className="offline-modal__highlight">
          <ZapIcon size={20} color="var(--color-amber-600)" />
          <div>
            <strong>Works in Airplane Mode & Remote Areas</strong>
            <p>NPCI USSD *99# network runs directly via 2G/GSM voice towers. Internet data is NOT required.</p>
          </div>
        </div>

        {/* 3 Step Visual Guide */}
        <div className="offline-steps">
          <div className="offline-step">
            <div className="offline-step__icon-box">
              <ScanIcon size={20} color="var(--color-teal-700)" />
            </div>
            <div className="offline-step__info">
              <strong>Step 1: Scan QR or Enter UPI ID</strong>
              <p>Open NoNetPay (works 100% offline via Service Worker). Scan merchant QR or enter `name@upi`.</p>
            </div>
          </div>

          <div className="offline-step">
            <div className="offline-step__icon-box">
              <PhoneIcon size={20} color="var(--color-teal-700)" />
            </div>
            <div className="offline-step__info">
              <strong>Step 2: Tap "Pay Now" to Open Phone Dialer</strong>
              <p>NoNetPay generates the encoded USSD command (`*99*1*3*upi_id*amount#`) and opens your phone's dialer.</p>
            </div>
          </div>

          <div className="offline-step">
            <div className="offline-step__icon-box">
              <ShieldIcon size={20} color="var(--color-teal-700)" />
            </div>
            <div className="offline-step__info">
              <strong>Step 3: Enter UPI PIN in Dialer Popup</strong>
              <p>Your bank prompts for your UPI PIN on your phone screen. Money is transferred directly between bank accounts!</p>
            </div>
          </div>
        </div>

        {/* Security Assurance */}
        <div className="offline-modal__security">
          <CheckCircleIcon size={16} color="var(--color-teal-600)" />
          <span>NoNetPay NEVER asks for or stores your bank UPI PIN. PIN is entered safely only in the official phone dialer.</span>
        </div>

        {/* Footer */}
        <div className="offline-modal__footer">
          <button className="btn btn--primary btn--full" onClick={onClose}>
            Got It! Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
