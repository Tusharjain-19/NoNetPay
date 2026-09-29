import React from 'react';
import { useApp } from '../../store/AppContext';
import './SegmentedSimulator.css';

export const SegmentedSimulator: React.FC = () => {
  const { simulatedNetwork, setSimulatedNetwork, showToast } = useApp();

  const options: Array<{ id: '5G' | '2G' | 'OFFLINE' | 'DEADZONE'; label: string; badge: string; desc: string }> = [
    { id: '5G', label: '5G Fast', badge: 'Online IP', desc: 'High-speed internet active' },
    { id: '2G', label: '2G Edge', badge: 'High Latency', desc: 'Slow, unstable packet data' },
    { id: 'OFFLINE', label: 'Offline Net', badge: 'No Data', desc: 'No internet data. Voice & USSD active.' },
    { id: 'DEADZONE', label: 'Dead Zone', badge: 'Zero Signal', desc: 'Total radio blackout' },
  ];

  const handleSelect = (id: '5G' | '2G' | 'OFFLINE' | 'DEADZONE') => {
    setSimulatedNetwork(id);
    const selected = options.find((o) => o.id === id);
    if (id === 'OFFLINE') {
      showToast('Switched to Offline Net: Transactions will route through *99# USSD', 'info');
    } else if (id === 'DEADZONE') {
      showToast('Dead Zone Simulated: Local cache & cryptographic ledger ready', 'info');
    } else if (id === '5G') {
      showToast('5G Fast Active: Full connectivity available', 'success');
    } else {
      showToast('2G Edge Active: Failover buffers enabled', 'info');
    }
  };

  return (
    <div className="segmented-sim-wrapper" id="segmented-network-simulator">
      <div className="segmented-sim-bar">
        {options.map((opt) => (
          <button
            key={opt.id}
            className={`segmented-sim-item ${simulatedNetwork === opt.id ? 'segmented-sim-item--active' : ''}`}
            onClick={() => handleSelect(opt.id)}
            title={opt.desc}
            type="button"
          >
            <span className={`segmented-sim-dot segmented-sim-dot--${opt.id.toLowerCase()}`} />
            <span className="segmented-sim-label">{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
