'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import * as Slider from '@radix-ui/react-slider';
import { ChevronDown, X, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

type Option = { id: number; name: string };

const YEAR_MIN = -700;
const YEAR_MAX = 2030;

function parseIdList(raw: string | null): number[] {
  if (!raw) return [];
  return raw.split(',').map(s => parseInt(s, 10)).filter(n => Number.isFinite(n));
}

function parseYearRange(raw: string | null): [number, number] | null {
  if (!raw) return null;
  const m = raw.match(/^(-?\d+)-(-?\d+)$/);
  if (!m) return null;
  const a = parseInt(m[1], 10);
  const b = parseInt(m[2], 10);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
  return [Math.min(a, b), Math.max(a, b)];
}

function formatYear(y: number): string {
  return y < 0 ? `${Math.abs(y)} a.C.` : `${y}`;
}

export function FilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [periods, setPeriods] = useState<Option[]>([]);
  const [schools, setSchools] = useState<Option[]>([]);
  const [categories, setCategories] = useState<Option[]>([]);

  // Active filter state — sourced from URL on every render
  const activePeriods = useMemo(() => parseIdList(searchParams.get('periods')), [searchParams]);
  const activeSchools = useMemo(() => parseIdList(searchParams.get('schools')), [searchParams]);
  const activeCategories = useMemo(() => parseIdList(searchParams.get('categories')), [searchParams]);
  const activeYears = useMemo(() => parseYearRange(searchParams.get('years')), [searchParams]);

  // Suppress filter UI when a single-item filter (philosopher/statement) is active
  const hasReactiveFilter = !!(searchParams.get('philosopher') || searchParams.get('statement'));
  const meditationMode = searchParams.get('meditation') === '1';

  const hasAnyFilter =
    activePeriods.length > 0 ||
    activeSchools.length > 0 ||
    activeCategories.length > 0 ||
    activeYears !== null;

  // Fetch catalogs once
  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/api/periods`).then(r => r.json()).catch(() => null),
      fetch(`${API_URL}/api/schools`).then(r => r.json()).catch(() => null),
      fetch(`${API_URL}/api/categories`).then(r => r.json()).catch(() => null),
    ]).then(([p, s, c]) => {
      if (p?.data) setPeriods(p.data.map((x: any) => ({ id: x.id, name: x.name })));
      if (s?.data) setSchools(s.data.map((x: any) => ({ id: x.id, name: x.name })));
      if (c?.data) setCategories(c.data.map((x: any) => ({ id: x.id, name: x.name })));
    });
  }, []);

  const updateFilter = useCallback(
    (key: 'periods' | 'schools' | 'categories' | 'years', value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === null || value === '') params.delete(key);
      else params.set(key, value);
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [searchParams, pathname, router]
  );

  const toggleId = (key: 'periods' | 'schools' | 'categories', id: number) => {
    const current =
      key === 'periods' ? activePeriods : key === 'schools' ? activeSchools : activeCategories;
    const next = current.includes(id) ? current.filter(x => x !== id) : [...current, id];
    updateFilter(key, next.length > 0 ? next.join(',') : null);
  };

  const clearAll = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('periods');
    params.delete('schools');
    params.delete('categories');
    params.delete('years');
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  if (hasReactiveFilter) {
    return null;
  }

  return (
    <div className={`absolute top-4 left-4 z-40 pointer-events-none transition-opacity duration-500 ${meditationMode ? 'opacity-0' : 'opacity-100'}`}>
      <div className={`flex items-center gap-2 ${meditationMode ? 'pointer-events-none' : 'pointer-events-auto'}`}>
        <Chip
          label="Época"
          activeIds={activePeriods}
          options={periods}
          onToggle={(id) => toggleId('periods', id)}
          onClear={() => updateFilter('periods', null)}
        />
        <Chip
          label="Rama"
          activeIds={activeCategories}
          options={categories}
          onToggle={(id) => toggleId('categories', id)}
          onClear={() => updateFilter('categories', null)}
        />
        <Chip
          label="Escuela"
          activeIds={activeSchools}
          options={schools}
          onToggle={(id) => toggleId('schools', id)}
          onClear={() => updateFilter('schools', null)}
          searchable
        />
        <YearChip
          range={activeYears}
          onChange={(r) => updateFilter('years', r ? `${r[0]}-${r[1]}` : null)}
        />

        {hasAnyFilter && (
          <Button variant="ghost" size="sm" onClick={clearAll} className="ml-auto text-xs">
            Limpiar filtros
          </Button>
        )}
      </div>
    </div>
  );
}

function Chip({
  label,
  activeIds,
  options,
  onToggle,
  onClear,
  searchable = false,
}: {
  label: string;
  activeIds: number[];
  options: Option[];
  onToggle: (id: number) => void;
  onClear: () => void;
  searchable?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown, true);
    return () => document.removeEventListener('mousedown', onDown, true);
  }, [open]);

  const filtered = useMemo(() => {
    if (!searchable || !query.trim()) return options;
    const q = query.trim().toLowerCase();
    return options.filter(o => o.name.toLowerCase().includes(q));
  }, [options, query, searchable]);

  const activeCount = activeIds.length;
  const summary = activeCount === 0
    ? label
    : activeCount === 1
      ? `${label}: ${options.find(o => o.id === activeIds[0])?.name ?? '…'}`
      : `${label}: ${activeCount}`;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
          activeCount > 0
            ? 'bg-gray-900 text-white border-gray-900'
            : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
        }`}
      >
        <span className="max-w-[200px] truncate">{summary}</span>
        {activeCount > 0 && (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => { e.stopPropagation(); onClear(); }}
            className="hover:bg-white/20 rounded-full p-0.5"
            aria-label="Limpiar"
          >
            <X className="h-3 w-3" />
          </span>
        )}
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full mt-1 left-0 w-64 max-h-80 overflow-y-auto bg-white border rounded-lg shadow-lg z-50">
          {searchable && (
            <div className="sticky top-0 bg-white border-b p-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar…"
                  className="w-full pl-7 pr-2 py-1 text-xs border rounded focus:outline-none focus:border-gray-400"
                  autoFocus
                />
              </div>
            </div>
          )}
          <div className="py-1">
            {filtered.length === 0 ? (
              <div className="px-3 py-2 text-xs text-gray-400">Sin resultados</div>
            ) : (
              filtered.map(opt => {
                const checked = activeIds.includes(opt.id);
                return (
                  <label
                    key={opt.id}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => onToggle(opt.id)}
                      className="h-3.5 w-3.5"
                    />
                    <span className="flex-1 truncate">{opt.name}</span>
                  </label>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function YearChip({
  range,
  onChange,
}: {
  range: [number, number] | null;
  onChange: (r: [number, number] | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [local, setLocal] = useState<[number, number]>(range ?? [YEAR_MIN, YEAR_MAX]);

  useEffect(() => {
    setLocal(range ?? [YEAR_MIN, YEAR_MAX]);
  }, [range]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown, true);
    return () => document.removeEventListener('mousedown', onDown, true);
  }, [open]);

  const active = range !== null;
  const label = active
    ? `Años: ${formatYear(range![0])} – ${formatYear(range![1])}`
    : 'Años';

  const commit = (next: [number, number]) => {
    if (next[0] === YEAR_MIN && next[1] === YEAR_MAX) {
      onChange(null);
    } else {
      onChange(next);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
          active
            ? 'bg-gray-900 text-white border-gray-900'
            : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
        }`}
      >
        <span className="max-w-[260px] truncate">{label}</span>
        {active && (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => { e.stopPropagation(); onChange(null); }}
            className="hover:bg-white/20 rounded-full p-0.5"
            aria-label="Limpiar"
          >
            <X className="h-3 w-3" />
          </span>
        )}
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full mt-1 left-0 w-80 bg-white border rounded-lg shadow-lg z-50 p-4">
          <div className="text-xs font-medium text-gray-700 mb-3">
            {formatYear(local[0])} — {formatYear(local[1])}
          </div>
          <Slider.Root
            className="relative flex items-center select-none touch-none w-full h-5"
            value={local}
            min={YEAR_MIN}
            max={YEAR_MAX}
            step={10}
            minStepsBetweenThumbs={1}
            onValueChange={(v) => setLocal([v[0], v[1]] as [number, number])}
            onValueCommit={(v) => commit([v[0], v[1]] as [number, number])}
          >
            <Slider.Track className="bg-gray-200 relative grow rounded-full h-1">
              <Slider.Range className="absolute bg-gray-900 rounded-full h-full" />
            </Slider.Track>
            <Slider.Thumb className="block w-4 h-4 bg-white border-2 border-gray-900 rounded-full hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400" />
            <Slider.Thumb className="block w-4 h-4 bg-white border-2 border-gray-900 rounded-full hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400" />
          </Slider.Root>
          <div className="flex justify-between mt-2 text-[10px] text-gray-400">
            <span>{formatYear(YEAR_MIN)}</span>
            <span>{formatYear(YEAR_MAX)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
