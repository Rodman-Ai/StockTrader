import { useEffect, useRef, useState } from 'react';
import {
  AreaSeries,
  CandlestickSeries,
  ColorType,
  createChart,
  CrosshairMode,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
} from 'lightweight-charts';
import type { Candle } from '@/market/provider';
import { RANGES, type RangeKey } from '@/market/ranges';

type ChartType = 'line' | 'candle';

type ChartProps = {
  candles: Candle[];
  livePrice?: number;
  height?: number;
  range: RangeKey;
  onRangeChange: (r: RangeKey) => void;
  loading?: boolean;
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
  const seriesRef = useRef<ISeriesApi<'Area'> | ISeriesApi<'Candlestick'> | null>(null);
  const seriesKindRef = useRef<ChartType>('line');

  const [chartType, setChartType] = useState<ChartType>('line');
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
      rightPriceScale: { borderColor: '#1f2937' },
      crosshair: { mode: CrosshairMode.Magnet },
      handleScroll: { mouseWheel: false, pressedMouseMove: true },
      handleScale: { mouseWheel: true, pinch: true, axisPressedMouseMove: true },
    });

    chartRef.current = chart;

    return () => {
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!chartRef.current) return;
    chartRef.current.applyOptions({
      timeScale: {
        timeVisible: intraday,
        secondsVisible: false,
      },
    });
  }, [intraday]);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;

    if (seriesRef.current && seriesKindRef.current !== chartType) {
      chart.removeSeries(seriesRef.current);
      seriesRef.current = null;
    }

    if (!seriesRef.current) {
      if (chartType === 'candle') {
        seriesRef.current = chart.addSeries(CandlestickSeries, {
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
        seriesRef.current = chart.addSeries(AreaSeries, {
          lineColor: up ? '#22c55e' : '#ef4444',
          topColor: up ? 'rgba(34, 197, 94, 0.30)' : 'rgba(239, 68, 68, 0.30)',
          bottomColor: up ? 'rgba(34, 197, 94, 0)' : 'rgba(239, 68, 68, 0)',
          lineWidth: 2,
          priceLineVisible: false,
          lastValueVisible: true,
        });
      }
      seriesKindRef.current = chartType;
    }

    const series = seriesRef.current;
    if (!series || candles.length === 0) return;

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
      (series as ISeriesApi<'Candlestick'>).setData(data);
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
      (series as ISeriesApi<'Area'>).setData(data);
    }
  }, [candles, livePrice, chartType]);

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
  );
}
