import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { I18nProvider } from './i18n';
import { AppProvider } from './store/AppContext';

// Marketing Website Shell & Pages
import { SiteLayout } from './site/SiteLayout';
import { LandingPage } from './site/LandingPage';
import { HowItWorksPage } from './site/HowItWorksPage';
import { CompatibilityPage } from './site/CompatibilityPage';
import { SecurityPage } from './site/SecurityPage';
import { DownloadPage } from './site/DownloadPage';
import { FaqPage } from './site/FaqPage';
import { NotFoundPage } from './site/NotFoundPage';

// PWA Shell & Screens
import { Layout } from './ui/Layout';
import { HomeScreen } from './ui/screens/Home';
import { ScanScreen } from './ui/screens/Scan';
import { PayScreen } from './ui/screens/Pay';
import { ResultScreen } from './ui/screens/Result';
import { HistoryScreen } from './ui/screens/History';
import { ReadinessScreen } from './ui/screens/Readiness';
import { SetupScreen } from './ui/screens/Setup';
import { HelpScreen } from './ui/screens/Help';
import { BalanceScreen } from './ui/screens/Balance';
import { TripPrepScreen } from './ui/screens/TripPrep';
import { DiagnosticsScreen } from './ui/screens/Diagnostics';

const App: React.FC = () => {
  return (
    <I18nProvider>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            {/* ── Marketing & Educational Website ── */}
            <Route path="/" element={<SiteLayout><LandingPage /></SiteLayout>} />
            <Route path="/how-it-works" element={<SiteLayout><HowItWorksPage /></SiteLayout>} />
            <Route path="/compatibility" element={<SiteLayout><CompatibilityPage /></SiteLayout>} />
            <Route path="/security" element={<SiteLayout><SecurityPage /></SiteLayout>} />
            <Route path="/download" element={<SiteLayout><DownloadPage /></SiteLayout>} />
            <Route path="/faq" element={<SiteLayout><FaqPage /></SiteLayout>} />

            {/* ── Direct Top-Level Route Aliases ── */}
            <Route path="/scan" element={<Navigate to="/app/scan" replace />} />
            <Route path="/pay" element={<Navigate to="/app/pay" replace />} />
            <Route path="/history" element={<Navigate to="/app/history" replace />} />
            <Route path="/readiness" element={<Navigate to="/app/readiness" replace />} />
            <Route path="/setup" element={<Navigate to="/app/setup" replace />} />
            <Route path="/help" element={<Navigate to="/app/help" replace />} />
            <Route path="/balance" element={<Navigate to="/app/balance" replace />} />
            <Route path="/trip-prep" element={<Navigate to="/app/trip-prep" replace />} />
            <Route path="/diagnostics" element={<Navigate to="/app/diagnostics" replace />} />

            {/* ── Offline Progressive Web App (PWA) ── */}
            <Route path="/app" element={<Layout><HomeScreen /></Layout>} />
            <Route path="/app/scan" element={<Layout><ScanScreen /></Layout>} />
            <Route path="/app/pay" element={<Layout><PayScreen /></Layout>} />
            <Route path="/app/result" element={<Layout><ResultScreen /></Layout>} />
            <Route path="/app/history" element={<Layout><HistoryScreen /></Layout>} />
            <Route path="/app/readiness" element={<Layout><ReadinessScreen /></Layout>} />
            <Route path="/app/setup" element={<Layout><SetupScreen /></Layout>} />
            <Route path="/app/help" element={<Layout><HelpScreen /></Layout>} />
            <Route path="/app/balance" element={<Layout><BalanceScreen /></Layout>} />
            <Route path="/app/trip-prep" element={<Layout><TripPrepScreen /></Layout>} />
            <Route path="/app/diagnostics" element={<Layout><DiagnosticsScreen /></Layout>} />

            {/* Custom 404 Error Page Fallback */}
            <Route path="*" element={<SiteLayout><NotFoundPage /></SiteLayout>} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </I18nProvider>
  );
};

export default App;
