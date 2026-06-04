'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Search, X } from 'lucide-react';

type Phil = {
  id: number;
  name: string;
  birthYear: number | null;
  deathYear: number | null;
  period: { id: number; name: string } | null;
  school: { id: number; name: string } | null;
};

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const norm = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

const fmtYears = (b: number | null, d: number | null) => {
  if (b == null && d == null) return '';
  const fmt = (y: number) => (y < 0 ? `${-y} a.C.` : `${y}`);
  if (b != null && d != null) return `${fmt(b)} – ${fmt(d)}`;
  if (b != null) return `n. ${fmt(b)}`;
  return `m. ${fmt(d as number)}`;
};

export function PhilosopherIndex() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [philosophers, setPhilosophers] = useState<Phil[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    fetch(`${API}/api/philosophers?limit=500`)
      .then(r => r.json())
      .then(j => setPhilosophers(j.data || []))
      .catch(() => setPhilosophers([]));
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      const isTyping = tag === 'input' || tag === 'textarea' || (e.target as HTMLElement)?.isContentEditable;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(o => !o);
      } else if (!isTyping && e.key === '/') {
        e.preventDefault();
        setOpen(true);
      } else if (e.key === 'Escape' && open) {
        e.preventDefault();
        setOpen(false);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener('keydown', onKey);
    window.addEventListener('open-philosopher-index', onOpen);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('open-philosopher-index', onOpen);
    };
  }, [open]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 30);
    else setQuery('');
  }, [open]);

  const groups = useMemo(() => {
    const q = norm(query.trim());
    const filtered = q
      ? philosophers.filter(p => norm(p.name).includes(q))
      : philosophers;
    const byPeriod = new Map<string, Phil[]>();
    for (const p of filtered) {
      const key = p.period?.name || 'Sin período';
      if (!byPeriod.has(key)) byPeriod.set(key, []);
      byPeriod.get(key)!.push(p);
    }
    for (const arr of byPeriod.values()) {
      arr.sort((a, b) => (a.birthYear ?? 0) - (b.birthYear ?? 0));
    }
    const periodOrder = [
      'Filosofía Antigua', 'Filosofía Medieval', 'Renacimiento', 'Filosofía Moderna',
      'Filosofía del Siglo XIX', 'Filosofía del Siglo XX', 'Filosofía Contemporánea',
    ];
    return Array.from(byPeriod.entries()).sort(
      ([a], [b]) => {
        const ia = periodOrder.indexOf(a), ib = periodOrder.indexOf(b);
        return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
      }
    );
  }, [philosophers, query]);

  const total = useMemo(
    () => groups.reduce((acc, [, arr]) => acc + arr.length, 0),
    [groups]
  );

  const select = (id: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('philosopher', String(id));
    router.push(`${pathname}?${params.toString()}`);
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] bg-black/40 backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-[min(720px,92vw)] max-h-[78vh] bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
          <Search className="h-4 w-4 text-zinc-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar filósofo…"
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-zinc-400"
          />
          <span className="text-xs text-zinc-400">{total}</span>
          <button
            onClick={() => setOpen(false)}
            className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"
            title="Cerrar (Esc)"
          >
            <X className="h-4 w-4 text-zinc-500" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-2 py-2">
          {groups.length === 0 && (
            <div className="px-3 py-8 text-center text-sm text-zinc-400">
              Sin resultados
            </div>
          )}
          {groups.map(([period, items]) => (
            <div key={period} className="mb-3">
              <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                {period}
              </div>
              <ul>
                {items.map((p) => (
                  <li key={p.id}>
                    <button
                      onClick={() => select(p.id)}
                      className="w-full text-left px-3 py-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-baseline gap-3"
                    >
                      <span className="font-medium text-sm text-zinc-900 dark:text-zinc-100 truncate">
                        {p.name}
                      </span>
                      <span className="text-xs text-zinc-500 whitespace-nowrap">
                        {fmtYears(p.birthYear, p.deathYear)}
                      </span>
                      {p.school?.name && (
                        <span className="text-xs text-zinc-400 truncate ml-auto">
                          {p.school.name}
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="px-4 py-2 border-t border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-400 flex items-center justify-between">
          <span>Cmd/Ctrl+K para abrir · / para buscar · Esc para cerrar</span>
          <span>{philosophers.length} filósofos</span>
        </div>
      </div>
    </div>
  );
}
