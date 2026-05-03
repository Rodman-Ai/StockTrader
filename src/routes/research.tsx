import { useMemo } from 'react';
import { usePortfolio } from '@/store/usePortfolio';
import { useWatchlist } from '@/store/useWatchlist';
import { SymbolSearch } from '@/components/SymbolSearch';
import { IndexStrip } from '@/components/IndexStrip';
import { MoversList } from '@/components/MoversList';
import { AggregateNewsPanel } from '@/components/AggregateNewsPanel';

export default function ResearchRoute() {
  const positions = usePortfolio((s) => s.portfolio.positions);
  const watchlist = useWatchlist((s) => s.symbols);

  const newsSymbols = useMemo(() => {
    const held = Object.keys(positions);
    return Array.from(new Set([...held, ...watchlist])).slice(0, 8);
  }, [positions, watchlist]);

  return (
    <div className="flex flex-col gap-4 p-4">
      <SymbolSearch />
      <IndexStrip />
      <MoversList />
      <AggregateNewsPanel symbols={newsSymbols} />
    </div>
  );
}
