import React from 'react';
import banksData from '../content/banks.json';
import carriersData from '../content/carriers.json';
import { AlertCircleIcon, CheckCircleIcon } from '../ui/Icons';

export const CompatibilityPage: React.FC = () => {
  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '40px 20px 80px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '14px' }}>
          Bank & Carrier Compatibility Matrix
        </h1>
        <p style={{ fontSize: '15px', color: '#64748B', maxWidth: '640px', margin: '0 auto', lineHeight: 1.6 }}>
          Data-driven compatibility records from versioned config. We label every entry as verified with date or honestly mark it as Unverified.
        </p>
      </div>

      {/* Honesty Callout */}
      <div className="card card--accent" style={{ marginBottom: '32px', borderLeft: '4px solid #D97706', padding: '18px 20px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <AlertCircleIcon size={22} color="#D97706" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: '13.5px', lineHeight: '1.5', color: '#78350F' }}>
            <strong>Tested Evidence Policy:</strong> Only configurations tested with real physical SIM cards and bank accounts receive a "Verified" date. Everything else is labeled "UNVERIFIED" by default.
          </div>
        </div>
      </div>

      {/* Carriers Section */}
      <h2 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '16px', color: '#0F172A' }}>Mobile Telecom Carriers</h2>
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: '40px' }}>
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table style={{ width: '100%', minWidth: '560px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                <th style={{ padding: '12px 18px', fontWeight: 700, color: '#0F172A' }}>Carrier</th>
                <th style={{ padding: '12px 18px', fontWeight: 700, color: '#0F172A' }}>Status</th>
                <th style={{ padding: '12px 18px', fontWeight: 700, color: '#0F172A' }}>Verified On</th>
                <th style={{ padding: '12px 18px', fontWeight: 700, color: '#0F172A' }}>Technical Notes</th>
              </tr>
            </thead>
            <tbody>
              {carriersData.carriers.map((carrier) => (
                <tr key={carrier.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '12px 18px', fontWeight: 600, color: '#0F172A' }}>{carrier.name}</td>
                  <td style={{ padding: '12px 18px' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 700,
                        background: carrier.ussd.status === 'WORKS' ? '#DCFCE7' : '#FEF3C7',
                        color: carrier.ussd.status === 'WORKS' ? '#166534' : '#92400E',
                      }}
                    >
                      {carrier.ussd.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 18px', color: '#64748B' }}>
                    {carrier.ussd.verified_on || 'Not verified'}
                  </td>
                  <td style={{ padding: '12px 18px', color: '#64748B', fontSize: '12.5px' }}>
                    {carrier.notes}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Banks Section */}
      <h2 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '16px', color: '#0F172A' }}>Supported Banks (NPCI NUUP)</h2>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table style={{ width: '100%', minWidth: '560px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                <th style={{ padding: '12px 18px', fontWeight: 700, color: '#0F172A' }}>Bank Name</th>
                <th style={{ padding: '12px 18px', fontWeight: 700, color: '#0F172A' }}>Shortcode</th>
                <th style={{ padding: '12px 18px', fontWeight: 700, color: '#0F172A' }}>Status</th>
                <th style={{ padding: '12px 18px', fontWeight: 700, color: '#0F172A' }}>Verified Date</th>
              </tr>
            </thead>
            <tbody>
              {banksData.banks.map((bank) => (
                <tr key={bank.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '12px 18px', fontWeight: 600, color: '#0F172A' }}>{bank.name}</td>
                  <td style={{ padding: '12px 18px', fontFamily: 'monospace', fontWeight: 700, color: '#2563EB' }}>
                    {bank.ussd.shortcutFormat || '*99#'}
                  </td>
                  <td style={{ padding: '12px 18px' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 700,
                        background: bank.ussd.status === 'WORKS' ? '#DCFCE7' : '#FEF3C7',
                        color: bank.ussd.status === 'WORKS' ? '#166534' : '#92400E',
                      }}
                    >
                      {bank.ussd.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 18px', color: '#64748B' }}>
                    {bank.ussd.verified_on || 'Not verified'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
