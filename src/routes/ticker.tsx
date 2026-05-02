import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useMarket } from '@/store/useMarket';
import { useSubscribeSymbol } from '@/hooks/useMarketStream';
import { getProvider } from '@/market/finnhub';
import { QuoteHeader } from '@/components/QuoteHeader';
import { Chart } from '@/components/Chart';
import { OrderTicket } from '@/components/OrderTicket';

export default function TickerRoute() {
  const { symbol = '' } = useParams();
  const sym = symbol.toUpperCase();
  useSubscribeSymbol(sym);

  const livePrice = useMarket((s) => s.quotes[sym]?.price);

  const { data: candles = [] } = useQuery({
    queryKey: ['candles', sym, '6mo'],
    queryFn: async () => {
      const to = Date.now();
      const from = to - 1000 * 60 * 60 * 24 * 180;
      try {
        return await getProvider().getCandles(sym, from, to, 'D');
      } catch (err) {
        console.warn(`Candles ${sym} failed`, err);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div className="flex flex-col h-full pb-24 lg:pb-0">
      <div className="border-b border-line">
        <QuoteHeader symbol={sym} />
      </div>

      <div className="grid lg:grid-cols-[1fr_340px] flex-1">
        <div className="p-4 flex flex-col gap-4">
          <div className="card p-2">
            <Chart candles={candles} livePrice={livePrice} />
            <div className="text-xs text-text-dim text-center pb-2">
              Daily closes (last 6 months) · live last point
            </div>
          </div>
          <LiveTicker symbol={sym} />
        </div>
        <div className="p-4 lg:border-l lg:border-line">
          <OrderTicket symbol={sym} />
        </div>
      </div>
    </div>
  );
}

function LiveTicker({ symbol }: { symbol: string }) {
  const quote = useMarket((s) => s.quotes[symbol]);
  const [pulse, setPulse] = useState(0);
  useEffect(() => {
    setPulse((p) => p + 1);
    const t = setTimeout(() => setPulse((p) => p + 1), 250);
    return () => clearTimeout(t);
  }, [quote?.ts, quote?.price]);

  if (!quote) {
    return (
      <div className="card p-4 text-sm text-text-dim">
        Waiting for live trades…
      </div>
    );
  }

  return (
    <div className="card p-4 flex items-center gap-3 text-sm">
      <span
        className={`inline-block w-2 h-2 rounded-full ${
          pulse % 2 === 0 ? 'bg-up' : 'bg-up/40'
        }`}
      />
      <span className="text-text-dim">Live · last tick</span>
      <span className="font-mono ml-auto">
        {new Date(quote.ts).toLocaleTimeString()}
      </span>
    </div>
  );
}
