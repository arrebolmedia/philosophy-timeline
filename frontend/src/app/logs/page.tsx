'use client';

import { useEffect, useState } from 'react';

interface LogEntry {
  id: number;
  category: string;
  description: string;
  createdAt: string;
}

interface ChangelogData {
  desarrollo: LogEntry[];
  proposiciones: LogEntry[];
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

const PAGE_SIZE = 10;

function LogColumn({ title, entries, color }: { title: string; entries: LogEntry[]; color: string }) {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(entries.length / PAGE_SIZE);
  const visible = entries.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="flex-1 min-w-0">
      <h2 className={`text-lg font-semibold mb-6 pb-2 border-b ${color} font-[family-name:var(--font-playfair)]`}>
        {title}
      </h2>
      {entries.length === 0 ? (
        <p className="text-gray-400 text-sm">Sin entradas aún.</p>
      ) : (
        <>
          <ul className="space-y-4">
            {visible.map(entry => (
              <li key={entry.id} className="flex gap-4 items-start">
                <span className="text-xs text-gray-400 pt-0.5 whitespace-nowrap font-[family-name:var(--font-poppins)]">
                  {formatDate(entry.createdAt)}
                </span>
                <span className="text-sm text-gray-600 font-[family-name:var(--font-poppins)] leading-relaxed">
                  {entry.description}
                </span>
              </li>
            ))}
          </ul>
          {totalPages > 1 && (
            <div className="flex items-center gap-3 mt-8">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="text-xs text-gray-400 hover:text-gray-700 disabled:opacity-30 transition-colors font-[family-name:var(--font-poppins)]"
              >
                ← Anterior
              </button>
              <span className="text-xs text-gray-400 font-[family-name:var(--font-poppins)]">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="text-xs text-gray-400 hover:text-gray-700 disabled:opacity-30 transition-colors font-[family-name:var(--font-poppins)]"
              >
                Siguiente →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function LogsPage() {
  const [data, setData] = useState<ChangelogData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/changelog`)
      .then(r => r.json())
      .then(r => { if (r.success) setData({ desarrollo: r.data?.desarrollo ?? [], proposiciones: r.data?.proposiciones ?? [] }); else console.error('changelog error:', r); })
      .catch(e => console.error('changelog fetch failed:', e))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 max-w-5xl py-20">
        <h1 className="text-5xl font-bold mb-4 font-[family-name:var(--font-playfair)]">Registro de cambios</h1>
        <p className="text-gray-400 text-sm mb-16 font-[family-name:var(--font-poppins)]">
          Las actualizaciones de desarrollo, proposiciones y conexiones se registran automáticamente.
        </p>

        {loading ? (
          <p className="text-gray-400 text-sm">Cargando...</p>
        ) : data ? (
          <div className="flex flex-col md:flex-row gap-16">
            <LogColumn
              title="Desarrollo"
              entries={data.desarrollo}
              color="border-gray-200"
            />
            <LogColumn
              title="Proposiciones"
              entries={data.proposiciones}
              color="border-gray-200"
            />
          </div>
        ) : (
          <p className="text-gray-400 text-sm">Error al cargar el registro.</p>
        )}
      </div>
    </div>
  );
}
