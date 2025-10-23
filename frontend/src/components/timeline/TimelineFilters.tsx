'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Filter, X } from 'lucide-react';

export function TimelineFilters() {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant={showFilters ? 'default' : 'outline'}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>

          <div className="flex gap-2">
            <Badge variant="secondary">20 Filósofos</Badge>
            <Badge variant="secondary">3 Declaraciones</Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            Vista Lista
          </Button>
          <Button variant="default" size="sm">
            Vista Gráfica
          </Button>
        </div>
      </div>

      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
          <div>
            <label className="text-sm font-medium mb-2 block">Período</label>
            <select className="w-full p-2 border rounded-md">
              <option>Todos</option>
              <option>Filosofía Antigua</option>
              <option>Medieval</option>
              <option>Moderna</option>
              <option>Contemporánea</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Categoría</label>
            <select className="w-full p-2 border rounded-md">
              <option>Todas</option>
              <option>Metafísica</option>
              <option>Epistemología</option>
              <option>Ética</option>
              <option>Lógica</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Conexiones</label>
            <select className="w-full p-2 border rounded-md">
              <option>Todas</option>
              <option>Acuerdo</option>
              <option>Desacuerdo</option>
              <option>Expansión</option>
            </select>
          </div>

          <div className="flex items-end">
            <Button variant="outline" className="w-full">
              <X className="h-4 w-4 mr-2" />
              Limpiar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
