import { useState } from 'react';
import { useMarket } from '@/store/useMarket';
import { usePortfolio } from '@/store/usePortfolio';
import { fmtUsd } from '@/utils/format';

export function QuickBuyButton({ symbol, qty = 1 }: { symbol: string; qty?: number }) {
  const lastPrice = useMarket((s) => s.quotes[symbol]?.price ?? 0);
  const cash = usePortfolio((s) => s.portfolio.cash);
  const submitOrder = usePortfolio((s) => s.submitOrder);
  const [flash, setFlash] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  const cost = qty * lastPrice;
  const disabled = lastPrice <= 0 || cost > cash;

  const onClick = () => {
    setFlash(null);
    if (lastPrice <= 0) {
      setFlash({ kind: 'err', text: 'No live price yet' });
      return;
    }
    const result = submitOrder(
      { symbol, side: 'buy', type: 'market', qty },
      lastPrice,
    );
    if (result.ok && result.trade) {
      setFlash({
        kind: 'ok',
        text: `Bought ${qty} @ ${fmtUsd(result.trade.price)}`,
      });
      setTimeout(() => setFlash(null), 2200);
    } else if (!result.ok) {
      setFlash({ kind: 'err', text: result.reason });
      setTimeout(() => setFlash(null), 2200);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {flash && (
        <span
          className={`text-[10px] font-mono whitespace-nowrap ${
            flash.kind === 'ok' ? 'text-up' : 'text-down'
          }`}
        >
          {flash.text}
        </span>
      )}
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        title={
          disabled
            ? cost > cash
              ? `Need ${fmtUsd(cost)}, have ${fmtUsd(cash)}`
              : 'Waiting for price'
            : `Buy ${qty} @ ~${fmtUsd(lastPrice)}`
        }
        className="text-[10px] font-semibold uppercase tracking-wider rounded px-2 py-1 bg-up/15 text-up hover:bg-up/25 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        +{qty}
      </button>
    </div>
  );
}
