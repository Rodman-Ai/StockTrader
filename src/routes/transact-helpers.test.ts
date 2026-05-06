import { buildTradeUniverse, chooseTradeSymbol } from './transact-helpers';
import type { Order, Position } from '@/broker/types';

const position = (symbol: string): Position => ({
  symbol,
  qty: 1,
  avgCost: 100,
});

const order = (symbol: string): Pick<Order, 'symbol'> => ({ symbol });

describe('buildTradeUniverse', () => {
  it('combines positions, watchlist, and open order symbols in priority order', () => {
    const positions = {
      MSFT: position('MSFT'),
      AAPL: position('AAPL'),
    };

    expect(
      buildTradeUniverse(positions, ['TSLA', 'AAPL'], [order('NVDA'), order('MSFT')]),
    ).toEqual(['MSFT', 'AAPL', 'TSLA', 'NVDA']);
  });

  it('normalizes symbols and skips empty values', () => {
    expect(buildTradeUniverse({}, [' aapl ', '', 'msft'], [order(' aapl ')])).toEqual([
      'AAPL',
      'MSFT',
    ]);
  });
});

describe('chooseTradeSymbol', () => {
  it('keeps the current symbol when it is still tradable', () => {
    expect(chooseTradeSymbol(' msft ', ['AAPL', 'MSFT'])).toBe('MSFT');
  });

  it('falls back to the first tradable symbol when the current one is removed', () => {
    expect(chooseTradeSymbol('TSLA', ['AAPL', 'MSFT'])).toBe('AAPL');
  });

  it('returns an empty string when there is no tradable universe', () => {
    expect(chooseTradeSymbol('TSLA', [])).toBe('');
  });
});
