import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SEEDED_SYMBOLS, symbolName } from '@/market/symbols';

export function SymbolSearch() {
  const navigate = useNavigate();
  const [q, setQ] = useState('');

  const matches = useMemo(() => {
    const term = q.trim().toUpperCase();
    if (!term) return [];
    return SEEDED_SYMBOLS.filter(
      (s) => s.startsWith(term) || symbolName(s).toUpperCase().includes(term),
    ).slice(0, 8);
  }, [q]);

  const submit = (sym: string) => {
    const target = sym.toUpperCase().trim();
    if (!target) return;
    navigate(`/ticker/${target}`);
    setQ('');
  };

  return (
    <div className="card p-3">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(matches[0] ?? q);
        }}
        className="flex gap-2"
      >
        <input
          className="input flex-1 text-sm"
          placeholder="Search by symbol or company (e.g. AAPL, NVIDIA)"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          autoComplete="off"
          spellCheck={false}
        />
        <button type="submit" className="btn-primary text-xs px-4" disabled={!q.trim()}>
          Open
        </button>
      </form>
      {matches.length > 0 && (
        <ul className="mt-2 divide-y divide-line">
          {matches.map((s) => (
            <li key={s}>
              <button
                onClick={() => submit(s)}
                className="w-full flex items-center justify-between gap-3 px-2 py-2 text-left text-sm hover:bg-bg-subtle rounded"
              >
                <span className="font-mono font-semibold">{s}</span>
                <span className="text-text-dim text-xs truncate">{symbolName(s)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
