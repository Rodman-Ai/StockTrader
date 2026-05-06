import type { Order, Position } from '@/broker/types';

type SymbolRef = Pick<Order, 'symbol'>;

function normalizeSymbol(symbol: string): string {
  return symbol.trim().toUpperCase();
}

export function buildTradeUniverse(
  positions: Record<string, Position>,
  watchlist: readonly string[],
  openOrders: readonly SymbolRef[],
): string[] {
  const symbols: string[] = [];
  const seen = new Set<string>();

  const add = (symbol: string) => {
    const normalized = normalizeSymbol(symbol);
    if (!normalized || seen.has(normalized)) return;
    seen.add(normalized);
    symbols.push(normalized);
  };

  for (const symbol of Object.keys(positions)) add(symbol);
  for (const symbol of watchlist) add(symbol);
  for (const order of openOrders) add(order.symbol);

  return symbols;
}

export function chooseTradeSymbol(
  current: string | undefined,
  universe: readonly string[],
): string {
  const normalizedUniverse = universe.map(normalizeSymbol).filter(Boolean);
  const normalizedCurrent = current ? normalizeSymbol(current) : '';

  if (normalizedCurrent && normalizedUniverse.includes(normalizedCurrent)) {
    return normalizedCurrent;
  }

  return normalizedUniverse[0] ?? '';
}
