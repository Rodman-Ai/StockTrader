import { useEffect, useRef, useState } from 'react';
import {
  AreaSeries,
  CandlestickSeries,
  ColorType,
  createChart,
  CrosshairMode,
  HistogramSeries,
  LineSeries,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
} from 'lightweight-charts';
import type { Candle } from '@/market/provider';
import { RANGES, type RangeKey } from '@/market/ranges';
import { sma } from '@/utils/indicators';

type ChartType = 'line' | 'candle';
type SmaKey = 20 | 50 | 200;

type ChartProps = {
  candles: Candle[];
  livePrice?: number;
  height?: number;
  range: RangeKey;
  onRangeChange: (r: RangeKey) => void;
  loading?: boolean;
};

const SMA_COLORS: Record<SmaKey, string> = {
  20: '#fbbf24',
  50: '#a78bfa',
  200: '#60a5fa',
};

const SMA_KEYS: SmaKey[] = [20, 50, 200];

type SeriesBag = {
  price: ISeriesApi<'Area'> | ISeriesApi<'Candlestick'> | null;
  priceKind: ChartType;
  volume: ISeriesApi<'Histogram'> | null;
  sma: Record<SmaKey, ISeriesApi<'Line'> | null>;
};

export function Chart({
  candles,
  livePrice,
  height = 280,
  range,
  onRangeChange,
  loading,
}: ChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const refs = useRef<SeriesBag>({
    price: null,
    priceKind: 'line',
    volume: null,
    sma: { 20: null, 50: null, 200: null },
  });

  const [chartType, setChartType] = useState<ChartType>('line');
  const [smaOn, setSmaOn] = useState<Record<SmaKey, boolean>>({
    20: false,
    50: false,
    200: false,
  });
  const intraday = range === '1D' || range === '1W';

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#9ca3af',
        fontSize: 11,
        attributionLogo: false,
      },
      grid: {
        vertLines: { color: 'rgba(31,41,55,0.5)' },
        horzLines: { color: 'rgba(31,41,55,0.5)' },
      },
      timeScale: {
        borderColor: '#1f2937',
        timeVisible: intraday,
        secondsVisible: false,
      },
      rightPriceScale: {
        borderColor: '#1f2937',
        scaleMargins: { top: 0.05, bottom: 0.28 },
      },
      crosshair: { mode: CrosshairMode.Magnet },
      handleScroll: { mouseWheel: false, pressedMouseMove: true },
      handleScale: { mouseWheel: true, pinch: true, axisPressedMouseMove: true },
    });

    chartRef.current = chart;

    const volume = chart.addSeries(HistogramSeries, {
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume',
      lastValueVisible: false,
      priceLineVisible: false,
    });
    chart.priceScale('volume').applyOptions({
      scaleMargins: { top: 0.78, bottom: 0 },
    });
    refs.current.volume = volume;

    return () => {
      chart.remove();
      chartRef.current = null;
      refs.current = {
        price: null,
        priceKind: 'line',
        volume: null,
        sma: { 20: null, 50: null, 200: null },
      };
    };
  }, []);

  useEffect(() => {
    if (!chartRef.current) return;
    chartRef.current.applyOptions({
      timeScale: { timeVisible: intraday, secondsVisible: false },
    });
  }, [intraday]);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;

    if (refs.current.price && refs.current.priceKind !== chartType) {
      chart.removeSeries(refs.current.price);
      refs.current.price = null;
    }

    if (!refs.current.price) {
      if (chartType === 'candle') {
        refs.current.price = chart.addSeries(CandlestickSeries, {
          upColor: '#22c55e',
          downColor: '#ef4444',
          borderUpColor: '#22c55e',
          borderDownColor: '#ef4444',
          wickUpColor: '#22c55e',
          wickDownColor: '#ef4444',
        });
      } else {
        const first = candles[0]?.c ?? 0;
        const last = livePrice ?? candles[candles.length - 1]?.c ?? 0;
        const up = last >= first;
        refs.current.price = chart.addSeries(AreaSeries, {
          lineColor: up ? '#22c55e' : '#ef4444',
          topColor: up ? 'rgba(34, 197, 94, 0.30)' : 'rgba(239, 68, 68, 0.30)',
          bottomColor: up ? 'rgba(34, 197, 94, 0)' : 'rgba(239, 68, 68, 0)',
          lineWidth: 2,
          priceLineVisible: false,
          lastValueVisible: true,
        });
      }
      refs.current.priceKind = chartType;
    }

    for (const k of SMA_KEYS) {
      const want = smaOn[k];
      const have = refs.current.sma[k];
      if (want && !have) {
        refs.current.sma[k] = chart.addSeries(LineSeries, {
          color: SMA_COLORS[k],
          lineWidth: 1,
          priceLineVisible: false,
          lastValueVisible: false,
        });
      } else if (!want && have) {
        chart.removeSeries(have);
        refs.current.sma[k] = null;
      }
    }

    if (candles.length === 0 || !refs.current.price) return;

    const closes = candles.map((c) => c.c);
    if (livePrice != null && closes.length > 0) {
      closes[closes.length - 1] = livePrice;
    }

    if (chartType === 'candle') {
      const data = candles.map((c) => ({
        time: Math.floor(c.t / 1000) as UTCTimestamp,
        open: c.o,
        high: c.h,
        low: c.l,
        close: c.c,
      }));
      if (livePrice != null && data.length > 0) {
        const last = data[data.length - 1];
        data[data.length - 1] = {
          ...last,
          close: livePrice,
          high: Math.max(last.high, livePrice),
          low: Math.min(last.low, livePrice),
        };
      }
      (refs.current.price as ISeriesApi<'Candlestick'>).setData(data);
    } else {
      const data = candles.map((c) => ({
        time: Math.floor(c.t / 1000) as UTCTimestamp,
        value: c.c,
      }));
      if (livePrice != null && data.length > 0) {
        const nowSec = Math.floor(Date.now() / 1000) as UTCTimestamp;
        const lastTime = data[data.length - 1].time as UTCTimestamp;
        if (nowSec > lastTime) data.push({ time: nowSec, value: livePrice });
        else data[data.length - 1] = { time: lastTime, value: livePrice };
      }
      (refs.current.price as ISeriesApi<'Area'>).setData(data);
    }

    if (refs.current.volume) {
      const volumeData = candles.map((c) => ({
        time: Math.floor(c.t / 1000) as UTCTimestamp,
        value: c.v,
        color: c.c >= c.o ? 'rgba(34,197,94,0.45)' : 'rgba(239,68,68,0.45)',
      }));
      refs.current.volume.setData(volumeData);
    }

    for (const k of SMA_KEYS) {
      const series = refs.current.sma[k];
      if (!series) continue;
      const values = sma(closes, k);
      const data: { time: UTCTimestamp; value: number }[] = [];
      for (let i = 0; i < values.length; i++) {
        const v = values[i];
        if (v == null) continue;
        data.push({
          time: Math.floor(candles[i].t / 1000) as UTCTimestamp,
          value: v,
        });
      }
      series.setData(data);
    }
  }, [candles, livePrice, chartType, smaOn]);

  return (
    <div className="flex flex-col">
      <div
        ref={containerRef}
        style={{ height, width: '100%' }}
        className="relative"
      >
        {(loading || candles.length === 0) && (
          <div className="absolute inset-0 flex items-center justify-center text-text-dim text-sm pointer-events-none">
            {loading ? 'Loading chart…' : 'No chart data for this range'}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 px-2 pt-2 flex-wrap">
        <div className="flex items-center gap-1">
          {RANGES.map((r) => (
            <button
              key={r}
              onClick={() => onRangeChange(r)}
              className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${
                r === range
                  ? 'bg-accent text-bg'
                  : 'text-text-dim hover:text-text hover:bg-bg-subtle'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 border border-line rounded-md p-0.5">
            {SMA_KEYS.map((k) => (
              <button
                key={k}
                onClick={() => setSmaOn((s) => ({ ...s, [k]: !s[k] }))}
                className={`px-2 py-0.5 text-xs rounded font-mono ${
                  smaOn[k]
                    ? 'text-bg'
                    : 'text-text-dim hover:text-text'
                }`}
                style={
                  smaOn[k] ? { backgroundColor: SMA_COLORS[k] } : undefined
                }
                title={`Simple Moving Average (${k})`}
              >
                MA{k}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 border border-line rounded-md p-0.5">
            {(['line', 'candle'] as ChartType[]).map((t) => (
              <button
                key={t}
                onClick={() => setChartType(t)}
                className={`px-2 py-0.5 text-xs rounded ${
                  chartType === t
                    ? 'bg-bg-subtle text-text'
                    : 'text-text-dim hover:text-text'
                }`}
                title={t === 'candle' ? 'Candlesticks' : 'Line'}
              >
                {t === 'candle' ? '▦' : '∿'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
