'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminNav from '@/components/layout/AdminNav';

interface Statement {
  id: number;
  text: string;
  philosopherId: number;
  philosopher: {
    name: string;
  };
}

interface Philosopher {
  id: number;
  name: string;
}

export default function StatementsAdmin() {
  const [statements, setStatements] = useState<Statement[]>([]);
  const [philosophers, setPhilosophers] = useState<Philosopher[]>([]);
  const [filteredStatements, setFilteredStatements] = useState<Statement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPhilosopher, setFilterPhilosopher] = useState<string>('all');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    let filtered = statements;
    
    if (searchTerm) {
      filtered = filtered.filter(s =>
        s.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.philosopher.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterPhilosopher !== 'all') {
      filtered = filtered.filter(s => s.philosopherId === parseInt(filterPhilosopher));
    }
    
    setFilteredStatements(filtered);
  }, [searchTerm, filterPhilosopher, statements]);

  const fetchData = async () => {
    try {
      const [stmtRes, philoRes] = await Promise.all([
        fetch(`${apiUrl}/api/statements`),
        fetch(`${apiUrl}/api/philosophers`)
      ]);
      const stmtData = await stmtRes.json();
      const philoData = await philoRes.json();
      setStatements(stmtData.data || stmtData);
      setPhilosophers(philoData.data || philoData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, id?: number) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      text: formData.get('text') as string,
      philosopherId: parseInt(formData.get('philosopherId') as string),
    };

    try {
      const url = id ? `${apiUrl}/api/admin/statements/${id}` : `${apiUrl}/api/admin/statements`;
      const method = id ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error('Error saving statement');
      
      setEditingId(null);
      setIsCreating(false);
      fetchData();
    } catch (error) {
      console.error('Error saving statement:', error);
      alert('Error al guardar el statement');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este statement? Se eliminarán también sus conexiones.')) return;
    
    try {
      const res = await fetch(`${apiUrl}/api/admin/statements/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error deleting statement');
      fetchData();
    } catch (error) {
      console.error('Error deleting statement:', error);
      alert('Error al eliminar el statement');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando statements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestión de Statements</h1>
              <p className="mt-1 text-sm text-gray-600">{statements.length} statements en total</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setIsCreating(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                + Nuevo Statement
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar en texto..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filtrar por Filósofo</label>
              <select
                value={filterPhilosopher}
                onChange={(e) => setFilterPhilosopher(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos</option>
                {philosophers.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-gray-600">
              Mostrando <strong>{filteredStatements.length}</strong> de <strong>{statements.length}</strong> statements
            </p>
          </div>
        </div>

        {/* Create Form */}
        {isCreating && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Crear Nuevo Statement</h2>
            <form onSubmit={(e) => handleSubmit(e)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Filósofo *</label>
                <select name="philosopherId" required className="w-full px-3 py-2 border border-gray-300 rounded-md">
                  <option value="">Seleccionar...</option>
                  {philosophers.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Texto del Statement *</label>
                <textarea
                  name="text"
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Escribe el statement aquí..."
                />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Crear
                </button>
                <button type="button" onClick={() => setIsCreating(false)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* List */}
        <div className="space-y-4">
          {filteredStatements.map((s) => (
            <div key={s.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-gray-900">{s.philosopher.name}</span>
                      <span className="text-xs text-gray-500">ID: {s.id}</span>
                    </div>
                    <p className="text-gray-700">{s.text}</p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => setEditingId(editingId === s.id ? null : s.id)}
                      className="px-3 py-1 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 rounded"
                    >
                      {editingId === s.id ? 'Cancelar' : 'Editar'}
                    </button>
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="px-3 py-1 text-sm bg-red-50 hover:bg-red-100 text-red-700 rounded"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>

                {editingId === s.id && (
                  <form onSubmit={(e) => handleSubmit(e, s.id)} className="mt-4 pt-4 border-t space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Filósofo *</label>
                      <select name="philosopherId" defaultValue={s.philosopherId} required className="w-full px-3 py-2 border border-gray-300 rounded-md">
                        {philosophers.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Texto del Statement *</label>
                      <textarea
                        name="text"
                        defaultValue={s.text}
                        required
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                        Guardar
                      </button>
                      <button type="button" onClick={() => setEditingId(null)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">
                        Cancelar
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredStatements.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-600">No se encontraron statements.</p>
          </div>
        )}
      </main>
    </div>
  );
}
