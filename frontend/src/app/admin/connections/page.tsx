'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// Estilos para las opciones del select
const selectStyles = `
  select option[value="disagreement"],
  select option[value="contrast"],
  select option[value="refutation"] {
    color: #ef4444;
  }
  select option[value="agreement"],
  select option[value="similarity"],
  select option[value="expansion"] {
    color: #22c55e;
  }
  select[id="filterType"] option[value="agreement"] {
    color: #22c55e;
  }
  select[id="filterType"] option[value="disagreement"] {
    color: #ef4444;
  }
`;

interface Connection {
  id: number;
  connectionType: string;
  explanation?: string;
  sourceType?: string;
  sourceTitle?: string;
  sourceAuthor?: string;
  sourceYear?: number;
  sourcePages?: string;
  sourceUrl?: string;
  confidence: number;
  statementFrom: {
    id: number;
    text: string;
    philosopher: {
      name: string;
      slug: string;
    };
  };
  statementTo: {
    id: number;
    text: string;
    philosopher: {
      name: string;
      slug: string;
    };
  };
}

export default function ConnectionsAdminPage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const [connections, setConnections] = useState<Connection[]>([]);
  const [filteredConnections, setFilteredConnections] = useState<Connection[]>([]);
  const [statements, setStatements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'philosopher' | 'type'>('recent');

  useEffect(() => {
    fetchConnections();
    fetchStatements();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [connections, searchTerm, filterType, sortBy]);

  const applyFilters = () => {
    let filtered = [...connections];

    // Búsqueda por texto
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(conn => 
        conn.statementFrom.philosopher.name.toLowerCase().includes(term) ||
        conn.statementTo.philosopher.name.toLowerCase().includes(term) ||
        conn.statementFrom.text.toLowerCase().includes(term) ||
        conn.statementTo.text.toLowerCase().includes(term)
      );
    }

    // Filtro por tipo
    if (filterType !== 'all') {
      if (filterType === 'agreement') {
        filtered = filtered.filter(conn => 
          ['agreement', 'similarity', 'expansion', 'inspiration'].includes(conn.connectionType)
        );
      } else if (filterType === 'disagreement') {
        filtered = filtered.filter(conn => 
          ['disagreement', 'contrast', 'refutation'].includes(conn.connectionType)
        );
      }
    }

    // Ordenamiento
    switch (sortBy) {
      case 'philosopher':
        filtered.sort((a, b) => 
          a.statementFrom.philosopher.name.localeCompare(b.statementFrom.philosopher.name)
        );
        break;
      case 'type':
        filtered.sort((a, b) => a.connectionType.localeCompare(b.connectionType));
        break;
      case 'recent':
      default:
        // Ya viene ordenado por createdAt desc del backend
        break;
    }

    setFilteredConnections(filtered);
  };

  const fetchConnections = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/admin/connections`);
      const data = await res.json();
      setConnections(data);
    } catch (error) {
      console.error('Error fetching connections:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatements = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/statements`);
      const data = await res.json();
      setStatements(data);
    } catch (error) {
      console.error('Error fetching statements:', error);
    }
  };

  const handleCreateConnection = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      statementFromId: parseInt(formData.get('statementFromId') as string),
      statementToId: parseInt(formData.get('statementToId') as string),
      connectionType: formData.get('connectionType') as string,
    };

    try {
      const res = await fetch(`${apiUrl}/api/admin/connections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Error creating connection');
      setIsCreating(false);
      fetchConnections();
    } catch (error) {
      console.error('Error creating connection:', error);
      alert('Error al crear la conexión');
    }
  };

  const getConnectionColor = (type: string) => {
    switch (type) {
      case 'disagreement':
      case 'refutation':
      case 'contrast':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'agreement':
      case 'expansion':
      case 'similarity':
      case 'inspiration':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getConnectionLabel = (type: string) => {
    // Agrupar por categoría
    if (['agreement', 'similarity', 'expansion', 'inspiration'].includes(type)) {
      return 'Acuerdo, similitud o expansión';
    }
    if (['disagreement', 'contrast', 'refutation'].includes(type)) {
      return 'Desacuerdo, contraste o refutación';
    }
    return type;
  };

  const getConfidenceLabel = (level: number) => {
    const labels = ['', 'Especulativa', 'Débil', 'Moderada', 'Fuerte', 'Documentada'];
    return labels[level] || 'Sin definir';
  };

  const getConfidenceColor = (level: number) => {
    if (level >= 4) return 'text-green-600';
    if (level === 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando conexiones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* CSS Styles for select options */}
      <style jsx>{selectStyles}</style>
      
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestión de Conexiones</h1>
              <p className="mt-1 text-sm text-gray-600">
                {connections.length} conexiones en total
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setIsCreating(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                + Nueva Conexión
              </button>
              <Link
                href="/admin"
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                ← Volver al Admin
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Create Form */}
        {isCreating && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Crear Nueva Conexión</h2>
            <form onSubmit={handleCreateConnection} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Statement Origen *</label>
                <select name="statementFromId" required className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                  <option value="">Seleccionar...</option>
                  {statements.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.philosopher.name}: {s.text.substring(0, 80)}...
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Statement Destino *</label>
                <select name="statementToId" required className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                  <option value="">Seleccionar...</option>
                  {statements.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.philosopher.name}: {s.text.substring(0, 80)}...
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Conexión *</label>
                <select name="connectionType" required className="w-full px-3 py-2 border border-gray-300 rounded-md">
                  <option value="agreement">Acuerdo, similitud o expansión</option>
                  <option value="disagreement">Desacuerdo, contraste o refutación</option>
                </select>
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
        
        {/* Filtros y Búsqueda */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Búsqueda */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Buscar
              </label>
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filósofo o texto..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filtro por Tipo */}
            <div>
              <label htmlFor="filterType" className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Conexión
              </label>
              <select
                id="filterType"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{
                  color: filterType === 'agreement' ? '#22c55e' : filterType === 'disagreement' ? '#ef4444' : '#000'
                }}
              >
                <option value="all">Todas</option>
                <option value="agreement">Acuerdo, similitud o expansión</option>
                <option value="disagreement">Desacuerdo, contraste o refutación</option>
              </select>
            </div>

            {/* Ordenar */}
            <div>
              <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 mb-2">
                Ordenar Por
              </label>
              <select
                id="sortBy"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'recent' | 'philosopher' | 'type')}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="recent">Más Recientes</option>
                <option value="philosopher">Filósofo (A-Z)</option>
                <option value="type">Tipo de Conexión</option>
              </select>
            </div>
          </div>

          {/* Contador de resultados */}
          <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Mostrando <strong>{filteredConnections.length}</strong> de <strong>{connections.length}</strong> conexiones
            </p>
            {(searchTerm || filterType !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterType('all');
                }}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>

        {/* Connections List */}
        <div className="space-y-4">
          {filteredConnections.map((conn) => (
            <div
              key={conn.id}
              className="bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            >
              {/* Connection Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* From */}
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium text-gray-500">DE:</span>
                      <span className="font-medium text-gray-900">
                        {conn.statementFrom.philosopher.name}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600 ml-16">
                      "{conn.statementFrom.text.substring(0, 100)}..."
                    </p>

                    {/* Connection Type */}
                    <div className="mt-3 flex items-center space-x-3">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getConnectionColor(conn.connectionType)}`}>
                        {getConnectionLabel(conn.connectionType)}
                      </span>
                    </div>

                    {/* To */}
                    <div className="mt-3 flex items-center space-x-3">
                      <span className="text-sm font-medium text-gray-500">HACIA:</span>
                      <span className="font-medium text-gray-900">
                        {conn.statementTo.philosopher.name}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600 ml-16">
                      "{conn.statementTo.text.substring(0, 100)}..."
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingId(editingId === conn.id ? null : conn.id)}
                      className="px-3 py-1 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 rounded transition-colors"
                    >
                      {editingId === conn.id ? 'Cancelar' : 'Editar'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Academic Citation Info - COMMENTED OUT 
              <div className="p-6 bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-700 flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    Fuente Académica
                  </h3>
                  <span className={`text-sm font-medium ${getConfidenceColor(conn.confidence)}`}>
                    Confianza: {getConfidenceLabel(conn.confidence)} ({conn.confidence}/5)
                  </span>
                </div>

                {conn.sourceTitle || conn.sourceAuthor ? (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {conn.sourceType && (
                      <div>
                        <span className="font-medium text-gray-600">Tipo:</span>
                        <span className="ml-2 text-gray-800 capitalize">{conn.sourceType}</span>
                      </div>
                    )}
                    {conn.sourceAuthor && (
                      <div>
                        <span className="font-medium text-gray-600">Autor:</span>
                        <span className="ml-2 text-gray-800">{conn.sourceAuthor}</span>
                      </div>
                    )}
                    {conn.sourceTitle && (
                      <div className="col-span-2">
                        <span className="font-medium text-gray-600">Título:</span>
                        <span className="ml-2 text-gray-800 italic">{conn.sourceTitle}</span>
                      </div>
                    )}
                    {conn.sourceYear && (
                      <div>
                        <span className="font-medium text-gray-600">Año:</span>
                        <span className="ml-2 text-gray-800">{conn.sourceYear}</span>
                      </div>
                    )}
                    {conn.sourcePages && (
                      <div>
                        <span className="font-medium text-gray-600">Páginas:</span>
                        <span className="ml-2 text-gray-800">{conn.sourcePages}</span>
                      </div>
                    )}
                    {conn.sourceUrl && (
                      <div className="col-span-2">
                        <span className="font-medium text-gray-600">URL:</span>
                        <a
                          href={conn.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 text-blue-600 hover:underline"
                        >
                          {conn.sourceUrl}
                        </a>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">
                    ⚠️ Sin fuente académica documentada. Click en "Editar" para agregar.
                  </p>
                )}
              </div>
              END COMMENTED OUT */}

              {/* Edit Form (when expanded) */}
              {editingId === conn.id && (
                <div className="p-6 border-t border-gray-200 bg-gray-50">
                  <h3 className="text-lg font-semibold mb-4">Editar Conexión</h3>
                  
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const updatedData = {
                      connectionType: formData.get('connectionType') as string,
                    };
                    
                    fetch(`${apiUrl}/api/admin/connections/${conn.id}`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(updatedData),
                    })
                      .then(res => {
                        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                        return res.json();
                      })
                      .then(() => {
                        setEditingId(null);
                        fetchConnections();
                      })
                      .catch(err => {
                        console.error('Error updating connection:', err);
                      });
                  }} className="space-y-4">
                    
                    {/* Connection Type */}
                    <div>
                      <label htmlFor="connectionType" className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo de Conexión *
                      </label>
                      <select
                        id="connectionType"
                        name="connectionType"
                        required
                        defaultValue={conn.connectionType}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        style={{
                          color: ['agreement', 'similarity', 'expansion', 'inspiration'].includes(conn.connectionType) ? '#22c55e' : '#ef4444'
                        }}
                      >
                        <option value="agreement">Acuerdo, similitud o expansión</option>
                        <option value="disagreement">Desacuerdo, contraste o refutación</option>
                      </select>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
                      >
                        Guardar
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm('¿Estás seguro de eliminar esta conexión?')) {
                            fetch(`${apiUrl}/api/admin/connections/${conn.id}`, {
                              method: 'DELETE',
                            })
                              .then(() => {
                                setEditingId(null);
                                fetchConnections();
                              })
                              .catch(err => console.error('Error deleting connection:', err));
                          }
                        }}
                        className="ml-auto px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium"
                      >
                        Eliminar
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredConnections.length === 0 && connections.length > 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron conexiones</h3>
            <p className="text-gray-600">Intenta con otros filtros o términos de búsqueda.</p>
          </div>
        )}

        {connections.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay conexiones</h3>
            <p className="text-gray-600">Crea tu primera conexión para empezar.</p>
          </div>
        )}
      </main>
    </div>
  );
}
