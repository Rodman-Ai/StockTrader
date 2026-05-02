import { getProvider } from '@/market/finnhub';
import type { Candle } from '@/market/provider';
import { useMarket } from '@/store/useMarket';
import { usePortfolio } from '@/store/usePortfolio';
import { useReplay, type ReplaySpeed } from '@/store/useReplay';
import { etMarketBounds } from '@/utils/et-bounds';

const TICK_INTERVAL_MS = 200;

class ReplayEngine {
  private timer: number | null = null;
  private startedAt = 0;
  private clockAt = 0;
  private speed: ReplaySpeed = 10;
  private bounds: { open: number; close: number } = { open: 0, close: 0 };
  private subscribed = new Set<string>();
  private candles = new Map<string, Candle[]>();
  private prevClose = new Map<string, number>();
  private cursor = new Map<string, number>();
  private inflight = new Map<string, Promise<void>>();

  isActive(): boolean {
    const m = useReplay.getState().mode;
    return m === 'loading' || m === 'playing' || m === 'paused' || m === 'ended';
  }

  async start(date: string, speed: ReplaySpeed, initialSymbols: string[]) {
    this.stop();
    this.bounds = etMarketBounds(date);
    this.clockAt = this.bounds.open;
    this.startedAt = Date.now();
    this.speed = speed;

    useReplay.getState().setDate(date);
    useReplay.getState().setSpeed(speed);
    useReplay.getState().setClock(this.bounds.open);
    useReplay.getState().setError(null);
    useReplay.getState().setMode('loading');

    for (const sym of initialSymbols) this.subscribed.add(sym);

    try {
      await Promise.all([...this.subscribed].map((s) => this.preload(s)));
      useReplay.getState().setMode('playing');
      this.timer = window.setInterval(() => this.tick(), TICK_INTERVAL_MS);
    } catch (err) {
      useReplay.getState().setError(
        err instanceof Error ? err.message : 'Failed to load replay data',
      );
      useReplay.getState().setMode('off');
    }
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.subscribed.clear();
    this.candles.clear();
    this.prevClose.clear();
    this.cursor.clear();
    this.inflight.clear();
    useReplay.getState().reset();
  }

  pause() {
    if (useReplay.getState().mode !== 'playing') return;
    this.clockAt = this.simNow();
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    useReplay.getState().setMode('paused');
  }

  resume() {
    if (useReplay.getState().mode !== 'paused') return;
    this.startedAt = Date.now();
    this.timer = window.setInterval(() => this.tick(), TICK_INTERVAL_MS);
    useReplay.getState().setMode('playing');
  }

  setSpeed(speed: ReplaySpeed) {
    if (!this.isActive()) return;
    if (useReplay.getState().mode === 'playing') {
      this.clockAt = this.simNow();
      this.startedAt = Date.now();
    }
    this.speed = speed;
    useReplay.getState().setSpeed(speed);
  }

  subscribe(symbol: string) {
    if (this.subscribed.has(symbol)) return;
    this.subscribed.add(symbol);
    if (this.isActive()) void this.preload(symbol);
  }

  unsubscribe(symbol: string) {
    this.subscribed.delete(symbol);
  }

  getCandles(symbol: string): Candle[] | undefined {
    return this.candles.get(symbol);
  }

  getBounds() {
    return this.bounds;
  }

  private simNow(): number {
    if (useReplay.getState().mode !== 'playing') return this.clockAt;
    const advanced = (Date.now() - this.startedAt) * this.speed;
    return Math.min(this.clockAt + advanced, this.bounds.close);
  }

  private async preload(symbol: string) {
    if (this.candles.has(symbol)) return;
    const existing = this.inflight.get(symbol);
    if (existing) return existing;
    const p = (async () => {
      try {
        const candles = await getProvider().getCandles(
          symbol,
          this.bounds.open - 60_000,
          this.bounds.close + 60_000,
          '1',
        );
        this.candles.set(symbol, candles);
        this.prevClose.set(symbol, candles[0]?.o ?? candles[0]?.c ?? 0);
        this.cursor.set(symbol, 0);
        if (candles.length > 0) {
          useMarket.getState().setReplayTick(
            symbol,
            candles[0].o,
            this.prevClose.get(symbol) ?? candles[0].o,
            candles[0].t,
          );
        }
      } finally {
        this.inflight.delete(symbol);
      }
    })();
    this.inflight.set(symbol, p);
    return p;
  }

  private tick() {
    const sim = this.simNow();
    const market = useMarket.getState();
    const portfolio = usePortfolio.getState();

    let advanced = false;
    for (const sym of this.subscribed) {
      const candles = this.candles.get(sym);
      if (!candles || candles.length === 0) continue;
      let i = this.cursor.get(sym) ?? 0;
      const prev = this.prevClose.get(sym) ?? candles[0].o;
      while (i < candles.length && candles[i].t <= sim) {
        market.setReplayTick(sym, candles[i].c, prev, candles[i].t);
        advanced = true;
        i++;
      }
      this.cursor.set(sym, i);
    }

    if (advanced) {
      portfolio.onTick(market.prices(), sim);
    }

    useReplay.getState().setClock(sim);

    if (sim >= this.bounds.close) {
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
      useReplay.getState().setMode('ended');
    }
  }
}

export const replayEngine = new ReplayEngine();
