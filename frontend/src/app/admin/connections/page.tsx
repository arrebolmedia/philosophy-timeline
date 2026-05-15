'use client';

import { useState, useEffect } from 'react';
import AdminNav from '@/components/layout/AdminNav';

interface Philosopher {
  id: number;
  name: string;
  slug: string;
  birthYear?: number;
}

interface Connection {
  id: number;
  connectionType: string;
  connectionSubtype?: string | null;
  auditStatus: string;
  auditNotes?: string | null;
  auditedAt?: string | null;
  explanation?: string;
  strength: number;
  confidence: number;
  sourceTitle?: string;
  sourceAuthor?: string;
  statementFrom: {
    id: number;
    text: string;
    philosopher: Philosopher;
  };
  statementTo: {
    id: number;
    text: string;
    philosopher: Philosopher;
  };
}

const SUBTYPES_RESONATE = [
  { value: 'cita_directa', label: 'Cita directa' },
  { value: 'discipulado', label: 'Discipulado' },
  { value: 'desarrollo', label: 'Desarrollo' },
  { value: 'respuesta', label: 'Respuesta' },
  { value: 'influencia', label: 'Influencia' },
  { value: 'convergencia', label: 'Convergencia' },
];

const SUBTYPES_OPPOSE = [
  { value: 'refutacion', label: 'Refutación' },
  { value: 'critica', label: 'Crítica' },
  { value: 'inversion', label: 'Inversión' },
  { value: 'superacion', label: 'Superación' },
  { value: 'deconstruccion', label: 'Deconstrucción' },
  { value: 'contraste_doctrinal', label: 'Contraste doctrinal' },
  { value: 'oposicion_reconstruida', label: 'Oposición reconstruida' },
];

const AUDIT_STATUSES = [
  { value: 'pending', label: 'Pendiente', color: 'bg-gray-100 text-gray-700 border-gray-300' },
  { value: 'validated', label: 'Validada', color: 'bg-green-100 text-green-800 border-green-300' },
  { value: 'recalificada', label: 'Recalificada', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  { value: 'marcada_debil', label: 'Marcada débil', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  { value: 'rechazada', label: 'Rechazada', color: 'bg-red-100 text-red-800 border-red-300' },
];

export default function ConnectionsAdminPage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const [connections, setConnections] = useState<Connection[]>([]);
  const [filteredConnections, setFilteredConnections] = useState<Connection[]>([]);
  const [philosophers, setPhilosophers] = useState<Philosopher[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterSubtype, setFilterSubtype] = useState<string>('all');
  const [filterAuditStatus, setFilterAuditStatus] = useState<string>('all');
  const [filterPhilosopher, setFilterPhilosopher] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'philosopher' | 'audit'>('audit');

  useEffect(() => { fetchConnections(); fetchPhilosophers(); }, []);

  useEffect(() => { applyFilters(); }, [connections, searchTerm, filterType, filterSubtype, filterAuditStatus, filterPhilosopher, sortBy]);

  const fetchConnections = async (philosopherId?: number) => {
    setLoading(true);
    try {
      const url = philosopherId
        ? `${apiUrl}/api/admin/connections/by-philosopher/${philosopherId}`
        : `${apiUrl}/api/admin/connections`;
      const res = await fetch(url);
      const json = await res.json();
      setConnections(json.data || json);
    } catch (e) {
      console.error('Error fetching connections:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchPhilosophers = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/philosophers`);
      const json = await res.json();
      setPhilosophers(json.data || json);
    } catch (e) {
      console.error('Error fetching philosophers:', e);
    }
  };

  const applyFilters = () => {
    let f = [...connections];

    if (searchTerm) {
      const t = searchTerm.toLowerCase();
      f = f.filter(c =>
        c.statementFrom.philosopher.name.toLowerCase().includes(t) ||
        c.statementTo.philosopher.name.toLowerCase().includes(t) ||
        c.statementFrom.text.toLowerCase().includes(t) ||
        c.statementTo.text.toLowerCase().includes(t) ||
        c.explanation?.toLowerCase().includes(t)
      );
    }

    if (filterType !== 'all') f = f.filter(c => c.connectionType === filterType);
    if (filterSubtype !== 'all') f = f.filter(c => c.connectionSubtype === filterSubtype);
    if (filterAuditStatus !== 'all') f = f.filter(c => c.auditStatus === filterAuditStatus);
    if (filterPhilosopher !== 'all') {
      const pid = parseInt(filterPhilosopher);
      f = f.filter(c => c.statementFrom.philosopher.id === pid || c.statementTo.philosopher.id === pid);
    }

    if (sortBy === 'philosopher') {
      f.sort((a, b) => a.statementFrom.philosopher.name.localeCompare(b.statementFrom.philosopher.name));
    } else if (sortBy === 'audit') {
      const order: Record<string, number> = { pending: 0, marcada_debil: 1, recalificada: 2, validated: 3, rechazada: 4 };
      f.sort((a, b) => (order[a.auditStatus] ?? 9) - (order[b.auditStatus] ?? 9));
    }

    setFilteredConnections(f);
  };

  const handleAuditUpdate = async (id: number, patch: Partial<Connection>) => {
    try {
      const res = await fetch(`${apiUrl}/api/admin/connections/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...patch, auditedAt: new Date().toISOString() }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setEditingId(null);
      fetchConnections(filterPhilosopher !== 'all' ? parseInt(filterPhilosopher) : undefined);
    } catch (e) {
      console.error('Error updating:', e);
      alert('Error al guardar');
    }
  };

  const getTypeColor = (t: string) => t === 'oppose' ? 'text-red-600 border-red-300 bg-red-50' : 'text-green-700 border-green-300 bg-green-50';
  const getStatusBadge = (s: string) => AUDIT_STATUSES.find(a => a.value === s) || AUDIT_STATUSES[0];

  const stats = {
    total: connections.length,
    pending: connections.filter(c => c.auditStatus === 'pending').length,
    validated: connections.filter(c => c.auditStatus === 'validated').length,
    recalificada: connections.filter(c => c.auditStatus === 'recalificada').length,
    debil: connections.filter(c => c.auditStatus === 'marcada_debil').length,
    rechazada: connections.filter(c => c.auditStatus === 'rechazada').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />

      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Auditoría de Conexiones</h1>
          <div className="mt-2 flex flex-wrap gap-3 text-sm">
            <span className="text-gray-600">{stats.total} totales</span>
            <span className="text-gray-700">{stats.pending} pendientes</span>
            <span className="text-green-700">{stats.validated} validadas</span>
            <span className="text-blue-700">{stats.recalificada} recalificadas</span>
            <span className="text-yellow-700">{stats.debil} marcadas débil</span>
            <span className="text-red-700">{stats.rechazada} rechazadas</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
            <input
              type="text" placeholder="Buscar..."
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="px-3 py-2 border rounded text-sm"
            />
            <select value={filterPhilosopher} onChange={e => setFilterPhilosopher(e.target.value)} className="px-3 py-2 border rounded text-sm">
              <option value="all">Todos los filósofos</option>
              {philosophers.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <select value={filterType} onChange={e => setFilterType(e.target.value)} className="px-3 py-2 border rounded text-sm">
              <option value="all">Todos los tipos</option>
              <option value="resonate">Resonate</option>
              <option value="oppose">Oppose</option>
            </select>
            <select value={filterSubtype} onChange={e => setFilterSubtype(e.target.value)} className="px-3 py-2 border rounded text-sm">
              <option value="all">Todos los subtipos</option>
              <optgroup label="Resonate">
                {SUBTYPES_RESONATE.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </optgroup>
              <optgroup label="Oppose">
                {SUBTYPES_OPPOSE.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </optgroup>
            </select>
            <select value={filterAuditStatus} onChange={e => setFilterAuditStatus(e.target.value)} className="px-3 py-2 border rounded text-sm">
              <option value="all">Todos los estados</option>
              {AUDIT_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div className="mt-3 flex justify-between items-center">
            <p className="text-sm text-gray-600">{filteredConnections.length} de {connections.length}</p>
            <select value={sortBy} onChange={e => setSortBy(e.target.value as any)} className="px-3 py-1 border rounded text-sm">
              <option value="audit">Orden: pendientes primero</option>
              <option value="recent">Orden: más recientes</option>
              <option value="philosopher">Orden: filósofo A-Z</option>
            </select>
          </div>
        </div>

        {loading && <div className="text-center py-8 text-gray-500">Cargando...</div>}

        <div className="space-y-3">
          {filteredConnections.map(conn => {
            const typeColor = getTypeColor(conn.connectionType);
            const statusBadge = getStatusBadge(conn.auditStatus);
            const subtypes = conn.connectionType === 'oppose' ? SUBTYPES_OPPOSE : SUBTYPES_RESONATE;
            const subtypeLabel = subtypes.find(s => s.value === conn.connectionSubtype)?.label;

            return (
              <div key={conn.id} className="bg-white rounded-lg shadow border-l-4" style={{ borderLeftColor: conn.connectionType === 'oppose' ? '#ef4444' : '#22c55e' }}>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded border ${typeColor}`}>{conn.connectionType}</span>
                        {subtypeLabel && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 rounded border border-gray-300">{subtypeLabel}</span>
                        )}
                        <span className={`px-2 py-0.5 text-xs font-medium rounded border ${statusBadge.color}`}>{statusBadge.label}</span>
                        <span className="text-xs text-gray-500">S{conn.strength}/C{conn.confidence}</span>
                        <span className="text-xs text-gray-400">#{conn.id}</span>
                      </div>

                      <div className="text-sm space-y-1">
                        <div>
                          <span className="font-medium text-gray-700">{conn.statementFrom.philosopher.name}</span>
                          <span className="text-gray-500"> #{conn.statementFrom.id}</span>
                          <span className="text-gray-600">: </span>
                          <span className="text-gray-700">{conn.statementFrom.text.substring(0, 150)}{conn.statementFrom.text.length > 150 ? '…' : ''}</span>
                        </div>
                        <div className="text-gray-400 text-xs">↓</div>
                        <div>
                          <span className="font-medium text-gray-700">{conn.statementTo.philosopher.name}</span>
                          <span className="text-gray-500"> #{conn.statementTo.id}</span>
                          <span className="text-gray-600">: </span>
                          <span className="text-gray-700">{conn.statementTo.text.substring(0, 150)}{conn.statementTo.text.length > 150 ? '…' : ''}</span>
                        </div>
                      </div>

                      {conn.explanation && (
                        <p className="mt-2 text-sm text-gray-600 italic">{conn.explanation}</p>
                      )}
                      {conn.auditNotes && (
                        <p className="mt-1 text-xs text-blue-700">📝 {conn.auditNotes}</p>
                      )}
                    </div>

                    <button
                      onClick={() => setEditingId(editingId === conn.id ? null : conn.id)}
                      className="px-3 py-1 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 rounded"
                    >
                      {editingId === conn.id ? 'Cerrar' : 'Auditar'}
                    </button>
                  </div>

                  {editingId === conn.id && (
                    <form
                      onSubmit={e => {
                        e.preventDefault();
                        const fd = new FormData(e.currentTarget);
                        handleAuditUpdate(conn.id, {
                          connectionType: fd.get('connectionType') as string,
                          connectionSubtype: (fd.get('connectionSubtype') as string) || null,
                          auditStatus: fd.get('auditStatus') as string,
                          auditNotes: (fd.get('auditNotes') as string) || null,
                          strength: parseInt(fd.get('strength') as string),
                          confidence: parseInt(fd.get('confidence') as string),
                        });
                      }}
                      className="mt-4 pt-4 border-t border-gray-200 space-y-3"
                    >
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Tipo</label>
                          <select name="connectionType" defaultValue={conn.connectionType} className="w-full px-2 py-1 border rounded text-sm">
                            <option value="resonate">resonate</option>
                            <option value="oppose">oppose</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Subtipo</label>
                          <select name="connectionSubtype" defaultValue={conn.connectionSubtype || ''} className="w-full px-2 py-1 border rounded text-sm">
                            <option value="">— sin asignar —</option>
                            <optgroup label="Resonate">
                              {SUBTYPES_RESONATE.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                            </optgroup>
                            <optgroup label="Oppose">
                              {SUBTYPES_OPPOSE.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                            </optgroup>
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Estado</label>
                          <select name="auditStatus" defaultValue={conn.auditStatus} className="w-full px-2 py-1 border rounded text-sm">
                            {AUDIT_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Strength</label>
                          <input type="number" name="strength" min="1" max="5" defaultValue={conn.strength} className="w-full px-2 py-1 border rounded text-sm" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Confidence</label>
                          <input type="number" name="confidence" min="1" max="5" defaultValue={conn.confidence} className="w-full px-2 py-1 border rounded text-sm" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Notas de auditoría</label>
                        <textarea name="auditNotes" rows={2} defaultValue={conn.auditNotes || ''} className="w-full px-2 py-1 border rounded text-sm" placeholder="Justificación de la decisión, fuente, etc." />
                      </div>
                      <div className="flex gap-2">
                        <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">Guardar</button>
                        <button type="button" onClick={() => setEditingId(null)} className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm">Cancelar</button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {!loading && filteredConnections.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow text-gray-500">No hay conexiones con esos filtros</div>
        )}
      </main>
    </div>
  );
}
