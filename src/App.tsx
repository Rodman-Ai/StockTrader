import { Suspense, lazy } from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppShell } from '@/components/AppShell';
import { useMarketStream } from '@/hooks/useMarketStream';

const LandingRoute = lazy(() => import('@/routes/landing'));
const PortfolioRoute = lazy(() => import('@/routes/portfolio'));
const ActivityRoute = lazy(() => import('@/routes/activity'));
const MarketsRoute = lazy(() => import('@/routes/markets'));
const TickerRoute = lazy(() => import('@/routes/ticker'));
const ResearchRoute = lazy(() => import('@/routes/research'));
const TransactRoute = lazy(() => import('@/routes/transact'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

function StreamBoot() {
  useMarketStream();
  return null;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <StreamBoot />
        <Suspense fallback={<div className="p-4 text-sm text-text-dim">Loading…</div>}>
          <Routes>
            <Route index element={<LandingRoute />} />
            <Route element={<AppShell />}>
              <Route path="portfolio" element={<PortfolioRoute />} />
              <Route path="research" element={<ResearchRoute />} />
              <Route path="transact" element={<TransactRoute />} />
              <Route path="markets" element={<MarketsRoute />} />
              <Route path="activity" element={<ActivityRoute />} />
              <Route path="ticker/:symbol" element={<TickerRoute />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </Suspense>
      </HashRouter>
    </QueryClientProvider>
  );
}
