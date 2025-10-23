'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Period {
  id: number;
  name: string;
  slug: string;
  colorHex: string;
  _count: { philosophers: number };
}

interface School {
  id: number;
  name: string;
  slug: string;
  _count: { philosophers: number };
}

export function PhilosophersFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [periods, setPeriods] = useState<Period[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);

  const selectedPeriod = searchParams.get('period');
  const selectedSchool = searchParams.get('school');

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [periodsRes, schoolsRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/periods`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/schools`)
        ]);

        const periodsData = await periodsRes.json();
        const schoolsData = await schoolsRes.json();

        setPeriods(periodsData.data || []);
        setSchools(schoolsData.data || []);
      } catch (error) {
        console.error('Error fetching filters:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFilters();
  }, []);

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    
    // Reset to page 1 when filtering
    params.delete('page');
    
    router.push(`/filosofos?${params.toString()}`);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-32 bg-muted animate-pulse rounded"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 bg-muted animate-pulse rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="p-6 space-y-6">
        {/* Search */}
        <div>
          <h3 className="font-semibold mb-3">Buscar</h3>
          <input
            type="text"
            placeholder="Nombre del filósofo..."
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            defaultValue={searchParams.get('search') || ''}
            onChange={(e) => {
              const value = e.target.value;
              const timeoutId = setTimeout(() => {
                updateFilter('search', value || null);
              }, 500);
              return () => clearTimeout(timeoutId);
            }}
          />
        </div>

        {/* Periods */}
        <div>
          <h3 className="font-semibold mb-3">Período</h3>
          <div className="space-y-2">
            <Button
              variant={!selectedPeriod ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => updateFilter('period', null)}
            >
              Todos los períodos
            </Button>
            {periods.map((period) => (
              <Button
                key={period.id}
                variant={selectedPeriod === period.slug ? 'default' : 'ghost'}
                className="w-full justify-between"
                onClick={() => updateFilter('period', period.slug)}
              >
                <span className="truncate">{period.name}</span>
                <Badge variant="secondary" className="ml-2">
                  {period._count.philosophers}
                </Badge>
              </Button>
            ))}
          </div>
        </div>

        {/* Schools */}
        <div>
          <h3 className="font-semibold mb-3">Escuela</h3>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            <Button
              variant={!selectedSchool ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => updateFilter('school', null)}
            >
              Todas las escuelas
            </Button>
            {schools.map((school) => (
              <Button
                key={school.id}
                variant={selectedSchool === school.slug ? 'default' : 'ghost'}
                className="w-full justify-between text-sm"
                onClick={() => updateFilter('school', school.slug)}
              >
                <span className="truncate">{school.name}</span>
                <Badge variant="secondary" className="ml-2">
                  {school._count.philosophers}
                </Badge>
              </Button>
            ))}
          </div>
        </div>

        {/* Clear Filters */}
        {(selectedPeriod || selectedSchool || searchParams.get('search')) && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => router.push('/filosofos')}
          >
            Limpiar filtros
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
