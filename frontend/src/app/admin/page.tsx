'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
              <p className="mt-1 text-sm text-gray-600">
                Gestiona filósofos, statements y conexiones
              </p>
            </div>
            <Link
              href="/"
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            >
              ← Volver al Timeline
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link href="/admin/philosophers" className="block">
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Filósofos</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">12</p>
                </div>
                <div className="bg-blue-100 rounded-full p-3">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-4">Click para gestionar →</p>
            </div>
          </Link>

          <Link href="/admin/statements" className="block">
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Statements</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">32</p>
                </div>
                <div className="bg-green-100 rounded-full p-3">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-4">Click para gestionar →</p>
            </div>
          </Link>

          <Link href="/admin/connections" className="block">
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Conexiones</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">15</p>
                </div>
                <div className="bg-purple-100 rounded-full p-3">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-4">Click para gestionar →</p>
            </div>
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/admin/philosophers?action=new"
              className="flex items-center justify-center px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nuevo Filósofo
            </Link>
            <Link
              href="/admin/statements?action=new"
              className="flex items-center justify-center px-4 py-3 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nuevo Statement
            </Link>
            <Link
              href="/admin/connections?action=new"
              className="flex items-center justify-center px-4 py-3 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nueva Conexión
            </Link>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start">
            <svg className="w-6 h-6 text-blue-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-lg font-medium text-blue-900">Sobre las fuentes académicas</h3>
              <p className="mt-2 text-sm text-blue-800">
                Al crear o editar conexiones, puedes agregar información sobre fuentes académicas:
              </p>
              <ul className="mt-2 text-sm text-blue-800 list-disc list-inside space-y-1">
                <li><strong>Tipo de fuente:</strong> libro, artículo, enciclopedia, fuente primaria</li>
                <li><strong>Título y autor:</strong> para referenciar correctamente</li>
                <li><strong>Año y páginas:</strong> para citas precisas</li>
                <li><strong>Nivel de confianza:</strong> 1-5 (especulativa a bien documentada)</li>
              </ul>
              <p className="mt-3 text-sm text-blue-700 font-medium">
                📚 Fuentes recomendadas: Stanford Encyclopedia of Philosophy (SEP), Kirk-Raven-Schofield, Barnes
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
