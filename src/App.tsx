import { Suspense, lazy } from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppShell } from '@/components/AppShell';
import { useMarketStream } from '@/hooks/useMarketStream';

const PortfolioRoute = lazy(() => import('@/routes/portfolio'));
const ActivityRoute = lazy(() => import('@/routes/activity'));
const MarketsRoute = lazy(() => import('@/routes/markets'));
const TickerRoute = lazy(() => import('@/routes/ticker'));

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
            <Route element={<AppShell />}>
              <Route index element={<PortfolioRoute />} />
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
