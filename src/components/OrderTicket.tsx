import { useEffect, useMemo, useState } from 'react';
import { useMarket } from '@/store/useMarket';
import { usePortfolio } from '@/store/usePortfolio';
import { fmtUsd } from '@/utils/format';
import type { OrderSide, OrderType, TimeInForce } from '@/broker/types';

const TYPE_OPTIONS: { value: OrderType; label: string }[] = [
  { value: 'market', label: 'Market' },
  { value: 'limit', label: 'Limit' },
  { value: 'stop', label: 'Stop' },
  { value: 'stop_limit', label: 'Stop limit' },
];

const TIF_OPTIONS: { value: TimeInForce; label: string; hint: string }[] = [
  { value: 'DAY', label: 'Day', hint: 'cancels at end of day' },
  { value: 'GTC', label: 'GTC', hint: 'good till cancelled' },
  { value: 'IOC', label: 'IOC', hint: 'fill now or cancel' },
  { value: 'FOK', label: 'FOK', hint: 'all-or-none, immediate' },
];

const needsLimit = (t: OrderType) => t === 'limit' || t === 'stop_limit';
const needsStop = (t: OrderType) => t === 'stop' || t === 'stop_limit';

export function OrderTicket({ symbol }: { symbol: string }) {
  const quote = useMarket((s) => s.quotes[symbol]);
  const cash = usePortfolio((s) => s.portfolio.cash);
  const heldQty = usePortfolio((s) => s.portfolio.positions[symbol]?.qty ?? 0);
  const submitOrder = usePortfolio((s) => s.submitOrder);

  const [side, setSide] = useState<OrderSide>('buy');
  const [orderType, setOrderType] = useState<OrderType>('market');
  const [tif, setTif] = useState<TimeInForce>('DAY');
  const [qtyStr, setQtyStr] = useState('1');
  const [limitStr, setLimitStr] = useState('');
  const [stopStr, setStopStr] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  const qty = Number(qtyStr);
  const limitPrice = Number(limitStr);
  const stopPrice = Number(stopStr);
  const validQty = Number.isFinite(qty) && qty > 0;
  const validLimit = !needsLimit(orderType) || (Number.isFinite(limitPrice) && limitPrice > 0);
  const validStop = !needsStop(orderType) || (Number.isFinite(stopPrice) && stopPrice > 0);
  const lastPrice = quote?.price ?? 0;

  const refPrice = useMemo(() => {
    if (orderType === 'market') return lastPrice;
    if (orderType === 'limit') return validLimit ? limitPrice : lastPrice;
    if (orderType === 'stop') return validStop ? stopPrice : lastPrice;
    return validLimit ? limitPrice : lastPrice;
  }, [orderType, lastPrice, limitPrice, stopPrice, validLimit, validStop]);

  const estTotal = validQty ? qty * refPrice : 0;

  useEffect(() => {
    if (needsLimit(orderType) && limitStr === '' && lastPrice > 0) {
      setLimitStr(lastPrice.toFixed(2));
    }
    if (needsStop(orderType) && stopStr === '' && lastPrice > 0) {
      const buf = side === 'buy' ? 1.02 : 0.98;
      setStopStr((lastPrice * buf).toFixed(2));
    }
  }, [orderType, limitStr, stopStr, lastPrice, side]);

  const guard = (() => {
    if (!validQty) return 'Enter a quantity.';
    if (needsLimit(orderType) && !validLimit) return 'Enter a valid limit price.';
    if (needsStop(orderType) && !validStop) return 'Enter a valid stop price.';
    if (orderType === 'market' && lastPrice <= 0) return 'Waiting for live price…';
    if (side === 'buy' && estTotal > cash && (orderType === 'market' || orderType === 'limit'))
      return `Need ${fmtUsd(estTotal)}, have ${fmtUsd(cash)}.`;
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
      {
        symbol,
        side,
        type: orderType,
        qty,
        timeInForce: tif,
        ...(needsLimit(orderType) ? { limitPrice } : {}),
        ...(needsStop(orderType) ? { stopPrice } : {}),
      },
      lastPrice,
    );
    setConfirming(false);
    if (result.ok && result.trade) {
      setMessage({
        kind: 'ok',
        text: `Filled ${result.trade.side.toUpperCase()} ${result.trade.qty} ${symbol} @ ${fmtUsd(result.trade.price)}`,
      });
      setQtyStr('1');
    } else if (result.ok) {
      const triggered = (result.order.type === 'stop' || result.order.type === 'stop_limit') && result.order.stopTriggered;
      setMessage({
        kind: 'ok',
        text:
          result.order.type === 'limit'
            ? `Limit working at ${fmtUsd(limitPrice)} (${tif})`
            : result.order.type === 'stop'
              ? `Stop armed — triggers ${side === 'buy' ? '≥' : '≤'} ${fmtUsd(stopPrice)} (${tif})`
              : triggered
                ? `Stop triggered — limit working at ${fmtUsd(limitPrice)} (${tif})`
                : `Stop-limit armed — triggers ${side === 'buy' ? '≥' : '≤'} ${fmtUsd(stopPrice)} → limit ${fmtUsd(limitPrice)} (${tif})`,
      });
      setQtyStr('1');
    } else {
      setMessage({ kind: 'err', text: result.reason });
    }
  };

  const typeLabel = TYPE_OPTIONS.find((t) => t.value === orderType)?.label ?? orderType;

  return (
    <div className="card p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Order ticket</h3>
        <span className="text-xs text-text-dim">Simulated</span>
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

      <div className="grid grid-cols-4 gap-1 text-xs">
        {TYPE_OPTIONS.map((t) => (
          <button
            key={t.value}
            className={`px-2 py-1.5 rounded-md font-medium transition-colors ${
              orderType === t.value
                ? 'bg-bg-subtle text-text border border-line'
                : 'text-text-dim hover:text-text border border-transparent'
            }`}
            onClick={() => setOrderType(t.value)}
          >
            {t.label}
          </button>
        ))}
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

      {needsStop(orderType) && (
        <label className="flex flex-col gap-1">
          <span className="text-xs text-text-dim">
            Stop price ($) — triggers {side === 'buy' ? 'at or above' : 'at or below'}
          </span>
          <input
            className="input font-mono"
            inputMode="decimal"
            value={stopStr}
            onChange={(e) => setStopStr(e.target.value)}
            placeholder="0.00"
          />
        </label>
      )}

      {needsLimit(orderType) && (
        <label className="flex flex-col gap-1">
          <span className="text-xs text-text-dim">Limit price ($)</span>
          <input
            className="input font-mono"
            inputMode="decimal"
            value={limitStr}
            onChange={(e) => setLimitStr(e.target.value)}
            placeholder="0.00"
          />
        </label>
      )}

      <label className="flex flex-col gap-1">
        <span className="text-xs text-text-dim">Time in force</span>
        <select
          className="input font-mono"
          value={tif}
          onChange={(e) => setTif(e.target.value as TimeInForce)}
        >
          {TIF_OPTIONS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label} — {t.hint}
            </option>
          ))}
        </select>
      </label>

      <div className="text-sm flex justify-between">
        <span className="text-text-dim">{orderType === 'market' ? 'Est. price' : needsStop(orderType) && !needsLimit(orderType) ? 'Stop trigger' : 'Limit price'}</span>
        <span className="font-mono">{fmtUsd(refPrice)}</span>
      </div>
      <div className="text-sm flex justify-between">
        <span className="text-text-dim">Est. total</span>
        <span className="font-mono">{fmtUsd(estTotal)}</span>
      </div>
      <div className="text-xs text-text-dim flex justify-between">
        <span>{side === 'buy' ? 'Cash available' : 'Shares held'}</span>
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
        Preview {side} {orderType !== 'market' ? typeLabel.toLowerCase() : ''}
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
            <h4 className="font-semibold">Confirm {side} {typeLabel}</h4>
            <div className="text-sm space-y-1">
              <Row label="Symbol" value={symbol} />
              <Row label="Side" value={side.toUpperCase()} />
              <Row label="Type" value={typeLabel} />
              <Row label="Quantity" value={String(qty)} />
              {needsStop(orderType) && <Row label="Stop trigger" value={fmtUsd(stopPrice)} />}
              {needsLimit(orderType) && <Row label="Limit price" value={fmtUsd(limitPrice)} />}
              {orderType === 'market' && <Row label="Est. price" value={fmtUsd(lastPrice)} />}
              <Row label="Time in force" value={tif} />
              <Row label="Est. total" value={fmtUsd(estTotal)} />
            </div>
            <div className="text-xs text-text-dim">
              {orderType === 'market'
                ? 'Simulated fill at the last trade ± a small synthetic slippage.'
                : orderType === 'limit'
                  ? `Order rests until the price ${side === 'buy' ? 'falls to' : 'rises to'} the limit, then fills at the better price.`
                  : orderType === 'stop'
                    ? `Order arms; when last ${side === 'buy' ? '≥' : '≤'} stop trigger, fills at market.`
                    : `Order arms; when last ${side === 'buy' ? '≥' : '≤'} stop trigger, becomes a working limit at the limit price.`}
              {' '}No real order is sent.
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

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-text-dim">{label}</span>
      <span className="font-mono">{value}</span>
    </div>
  );
}
