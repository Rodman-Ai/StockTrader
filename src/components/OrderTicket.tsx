import { useMemo, useState } from 'react';
import { useMarket } from '@/store/useMarket';
import { usePortfolio } from '@/store/usePortfolio';
import { fmtUsd } from '@/utils/format';
import type { OrderSide } from '@/broker/types';

export function OrderTicket({ symbol }: { symbol: string }) {
  const quote = useMarket((s) => s.quotes[symbol]);
  const cash = usePortfolio((s) => s.portfolio.cash);
  const heldQty = usePortfolio((s) => s.portfolio.positions[symbol]?.qty ?? 0);
  const submitOrder = usePortfolio((s) => s.submitOrder);

  const [side, setSide] = useState<OrderSide>('buy');
  const [qtyStr, setQtyStr] = useState('1');
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  const qty = Number(qtyStr);
  const validQty = Number.isFinite(qty) && qty > 0;
  const lastPrice = quote?.price ?? 0;
  const estTotal = useMemo(() => (validQty ? qty * lastPrice : 0), [qty, lastPrice, validQty]);

  const guard = (() => {
    if (!validQty) return 'Enter a quantity.';
    if (lastPrice <= 0) return 'Waiting for live price…';
    if (side === 'buy' && estTotal > cash) return `Need ${fmtUsd(estTotal)}, have ${fmtUsd(cash)}.`;
    if (side === 'sell' && qty > heldQty) return `You hold ${heldQty} share(s).`;
    return null;
  })();

  const onPreview = () => {
    setMessage(null);
    if (guard) return;
    setConfirming(true);
  };

  const onConfirm = () => {
    const result = submitOrder(
      { symbol, side, type: 'market', qty },
      lastPrice,
    );
    setConfirming(false);
    if (result.ok && result.trade) {
      setMessage({
        kind: 'ok',
        text: `Filled ${result.trade.side.toUpperCase()} ${result.trade.qty} ${symbol} @ ${fmtUsd(result.trade.price)}`,
      });
      setQtyStr('1');
    } else if (!result.ok) {
      setMessage({ kind: 'err', text: result.reason });
    }
  };

  return (
    <div className="card p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Order ticket</h3>
        <span className="text-xs text-text-dim">Market order · simulated</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          className={`btn ${side === 'buy' ? 'bg-up text-bg' : 'btn-ghost'}`}
          onClick={() => setSide('buy')}
        >
          Buy
        </button>
        <button
          className={`btn ${side === 'sell' ? 'bg-down text-bg' : 'btn-ghost'}`}
          onClick={() => setSide('sell')}
        >
          Sell
        </button>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-xs text-text-dim">Quantity (shares)</span>
        <input
          className="input font-mono"
          inputMode="decimal"
          value={qtyStr}
          onChange={(e) => setQtyStr(e.target.value)}
          placeholder="0"
        />
      </label>

      <div className="text-sm flex justify-between">
        <span className="text-text-dim">Est. price</span>
        <span className="font-mono">{fmtUsd(lastPrice)}</span>
      </div>
      <div className="text-sm flex justify-between">
        <span className="text-text-dim">Est. total</span>
        <span className="font-mono">{fmtUsd(estTotal)}</span>
      </div>
      <div className="text-xs text-text-dim flex justify-between">
        <span>{side === 'buy' ? 'Cash available' : `Shares held`}</span>
        <span className="font-mono">
          {side === 'buy' ? fmtUsd(cash) : `${heldQty}`}
        </span>
      </div>

      {guard && <div className="text-xs text-down">{guard}</div>}
      {message && (
        <div className={`text-xs ${message.kind === 'ok' ? 'text-up' : 'text-down'}`}>
          {message.text}
        </div>
      )}

      <button
        className={side === 'buy' ? 'btn-buy' : 'btn-sell'}
        onClick={onPreview}
        disabled={!!guard}
      >
        Preview {side}
      </button>

      {confirming && (
        <div
          className="fixed inset-0 z-40 bg-black/60 flex items-center justify-center p-4"
          onClick={() => setConfirming(false)}
        >
          <div
            className="card p-6 max-w-sm w-full flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="font-semibold">Confirm {side}</h4>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-text-dim">Symbol</span>
                <span className="font-mono">{symbol}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-dim">Side</span>
                <span className="font-mono uppercase">{side}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-dim">Quantity</span>
                <span className="font-mono">{qty}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-dim">Est. price</span>
                <span className="font-mono">{fmtUsd(lastPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-dim">Est. total</span>
                <span className="font-mono">{fmtUsd(estTotal)}</span>
              </div>
            </div>
            <div className="text-xs text-text-dim">
              Simulated fill at the last trade ± a small synthetic slippage. No real order is sent.
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button className="btn-ghost" onClick={() => setConfirming(false)}>
                Cancel
              </button>
              <button
                className={side === 'buy' ? 'btn-buy' : 'btn-sell'}
                onClick={onConfirm}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
