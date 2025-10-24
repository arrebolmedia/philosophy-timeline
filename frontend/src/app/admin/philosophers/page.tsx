'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Philosopher {
  id: number;
  name: string;
  slug: string;
  birthYear: number;
  deathYear: number;
  era?: string;
  school?: string;
  imageUrl?: string;
}

export default function PhilosophersAdmin() {
  const [philosophers, setPhilosophers] = useState<Philosopher[]>([]);
  const [filteredPhilosophers, setFilteredPhilosophers] = useState<Philosopher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchPhilosophers();
  }, []);

  useEffect(() => {
    const filtered = philosophers.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPhilosophers(filtered);
  }, [searchTerm, philosophers]);

  const fetchPhilosophers = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/philosophers`);
      const data = await res.json();
      setPhilosophers(data);
    } catch (error) {
      console.error('Error fetching philosophers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, id?: number) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      slug: formData.get('slug') as string,
      birthYear: parseInt(formData.get('birthYear') as string),
      deathYear: parseInt(formData.get('deathYear') as string),
      era: formData.get('era') as string,
      school: formData.get('school') as string,
      imageUrl: formData.get('imageUrl') as string,
    };

    try {
      const url = id ? `${apiUrl}/api/admin/philosophers/${id}` : `${apiUrl}/api/admin/philosophers`;
      const method = id ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error('Error saving philosopher');
      
      setEditingId(null);
      setIsCreating(false);
      fetchPhilosophers();
    } catch (error) {
      console.error('Error saving philosopher:', error);
      alert('Error al guardar el filósofo');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este filósofo? Se eliminarán también sus statements y conexiones.')) return;
    
    try {
      const res = await fetch(`${apiUrl}/api/admin/philosophers/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error deleting philosopher');
      fetchPhilosophers();
    } catch (error) {
      console.error('Error deleting philosopher:', error);
      alert('Error al eliminar el filósofo');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando filósofos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestión de Filósofos</h1>
              <p className="mt-1 text-sm text-gray-600">{philosophers.length} filósofos en total</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setIsCreating(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                + Nuevo Filósofo
              </button>
              <Link href="/admin" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors">
                ← Volver al Admin
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar filósofo..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Create Form */}
        {isCreating && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Crear Nuevo Filósofo</h2>
            <form onSubmit={(e) => handleSubmit(e)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                  <input type="text" name="name" required className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
                  <input type="text" name="slug" required className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Año Nacimiento *</label>
                  <input type="number" name="birthYear" required className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Año Muerte *</label>
                  <input type="number" name="deathYear" required className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Era</label>
                  <input type="text" name="era" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Escuela</label>
                  <input type="text" name="school" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL Imagen</label>
                  <input type="text" name="imageUrl" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
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
          {filteredPhilosophers.map((p) => (
            <div key={p.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900">{p.name}</h3>
                    <p className="text-sm text-gray-600">
                      {p.birthYear < 0 ? `${Math.abs(p.birthYear)} BCE` : p.birthYear} – {p.deathYear < 0 ? `${Math.abs(p.deathYear)} BCE` : p.deathYear}
                    </p>
                    {p.school && <p className="text-sm text-gray-500 mt-1">{p.school}</p>}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingId(editingId === p.id ? null : p.id)}
                      className="px-3 py-1 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 rounded"
                    >
                      {editingId === p.id ? 'Cancelar' : 'Editar'}
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="px-3 py-1 text-sm bg-red-50 hover:bg-red-100 text-red-700 rounded"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>

                {editingId === p.id && (
                  <form onSubmit={(e) => handleSubmit(e, p.id)} className="mt-4 pt-4 border-t space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                        <input type="text" name="name" defaultValue={p.name} required className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
                        <input type="text" name="slug" defaultValue={p.slug} required className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Año Nacimiento *</label>
                        <input type="number" name="birthYear" defaultValue={p.birthYear} required className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Año Muerte *</label>
                        <input type="number" name="deathYear" defaultValue={p.deathYear} required className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Era</label>
                        <input type="text" name="era" defaultValue={p.era || ''} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Escuela</label>
                        <input type="text" name="school" defaultValue={p.school || ''} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">URL Imagen</label>
                        <input type="text" name="imageUrl" defaultValue={p.imageUrl || ''} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                      </div>
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

        {filteredPhilosophers.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-600">No se encontraron filósofos.</p>
          </div>
        )}
      </main>
    </div>
  );
}
