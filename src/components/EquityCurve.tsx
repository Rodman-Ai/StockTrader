import { useEffect, useMemo, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AreaSeries,
  ColorType,
  CrosshairMode,
  HistogramSeries,
  LineSeries,
  createChart,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
} from 'lightweight-charts';
import { fetchYahooByRange } from '@/market/yahoo';
import { computeDrawdowns, type EquityPoint } from '@/utils/stats';

type Props = {
  series: EquityPoint[];
  height?: number;
};

export function EquityCurve({ series, height = 280 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const equityRef = useRef<ISeriesApi<'Area'> | null>(null);
  const benchRef = useRef<ISeriesApi<'Line'> | null>(null);
  const ddRef = useRef<ISeriesApi<'Histogram'> | null>(null);

  const { data: spy = [] } = useQuery({
    queryKey: ['spy-3m'],
    queryFn: () => fetchYahooByRange('SPY', '3M').catch(() => []),
    staleTime: 60 * 60 * 1000,
    retry: 0,
  });

  const dd = useMemo(() => computeDrawdowns(series), [series]);

  useEffect(() => {
    if (!containerRef.current) return;
    const chart = createChart(containerRef.current, {
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#9ca3af',
        fontSize: 11,
        attributionLogo: false,
        panes: { separatorColor: '#1f2937', separatorHoverColor: '#374151' },
      },
      grid: {
        vertLines: { color: 'rgba(31,41,55,0.5)' },
        horzLines: { color: 'rgba(31,41,55,0.5)' },
      },
      timeScale: { borderColor: '#1f2937', timeVisible: false, secondsVisible: false },
      rightPriceScale: { borderColor: '#1f2937' },
      crosshair: { mode: CrosshairMode.Magnet },
      handleScroll: { mouseWheel: false, pressedMouseMove: true },
      handleScale: { mouseWheel: true, pinch: true, axisPressedMouseMove: true },
    });
    chartRef.current = chart;

    const equity = chart.addSeries(AreaSeries, {
      lineColor: '#60a5fa',
      topColor: 'rgba(96,165,250,0.30)',
      bottomColor: 'rgba(96,165,250,0)',
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: true,
    });
    equityRef.current = equity;

    const bench = chart.addSeries(LineSeries, {
      color: '#9ca3af',
      lineWidth: 1,
      priceLineVisible: false,
      lastValueVisible: false,
      priceScaleId: 'bench',
    });
    chart.priceScale('bench').applyOptions({ visible: false, scaleMargins: { top: 0.05, bottom: 0.05 } });
    benchRef.current = bench;

    const ddSeries = chart.addSeries(
      HistogramSeries,
      {
        priceFormat: { type: 'percent' },
        priceLineVisible: false,
        lastValueVisible: false,
        color: '#ef4444',
      },
      1,
    );
    ddRef.current = ddSeries;
    chart.panes()[1]?.setHeight(72);

    return () => {
      chart.remove();
      chartRef.current = null;
      equityRef.current = null;
      benchRef.current = null;
      ddRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!equityRef.current || series.length === 0) return;
    equityRef.current.setData(
      series.map((p) => ({
        time: Math.floor(p.t / 1000) as UTCTimestamp,
        value: p.v,
      })),
    );
    if (ddRef.current) {
      ddRef.current.setData(
        dd.series.map((p) => ({
          time: Math.floor(p.t / 1000) as UTCTimestamp,
          value: p.v * 100,
          color: p.v < -0.001 ? '#ef4444' : 'rgba(31,41,55,0.5)',
        })),
      );
    }
  }, [series, dd.series]);

  useEffect(() => {
    if (!benchRef.current || spy.length === 0 || series.length === 0) return;
    const startEquity = series[0].v;
    const startSpy = spy[0].c;
    if (!startSpy) return;
    const overlapStart = series[0].t;
    const points = spy
      .filter((c) => c.t >= overlapStart)
      .map((c) => ({
        time: Math.floor(c.t / 1000) as UTCTimestamp,
        value: (c.c / startSpy) * startEquity,
      }));
    benchRef.current.setData(points);
  }, [spy, series]);

  return (
    <div
      ref={containerRef}
      style={{ height, width: '100%' }}
      className="relative"
    >
      {series.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-text-dim text-sm pointer-events-none">
          No equity history yet
        </div>
      )}
    </div>
  );
}
