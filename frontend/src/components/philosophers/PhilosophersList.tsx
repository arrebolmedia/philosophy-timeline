'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Calendar, GraduationCap } from 'lucide-react';

interface Philosopher {
  id: number;
  name: string;
  slug: string;
  birthYear: number;
  deathYear: number;
  nationality: string;
  bioShort: string;
  period: {
    name: string;
    colorHex: string;
  };
  school: {
    name: string;
  } | null;
  _count: {
    statements: number;
  };
}

interface ApiResponse {
  success: boolean;
  data: Philosopher[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function PhilosophersList() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const page = parseInt(searchParams.get('page') || '1');
  const period = searchParams.get('period');
  const school = searchParams.get('school');
  const search = searchParams.get('search');

  useEffect(() => {
    const fetchPhilosophers = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: '12'
        });

        if (period) params.set('period', period);
        if (school) params.set('school', school);
        if (search) params.set('search', search);

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/philosophers?${params}`
        );
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Error fetching philosophers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPhilosophers();
  }, [page, period, school, search]);

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-80 bg-muted animate-pulse rounded-lg"></div>
        ))}
      </div>
    );
  }

  if (!data?.data || data.data.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No se encontraron filósofos</h3>
          <p className="text-muted-foreground">
            Intenta ajustar los filtros de búsqueda
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Results header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Mostrando <span className="font-medium">{data.data.length}</span> de{' '}
            <span className="font-medium">{data.pagination.total}</span> filósofos
          </p>
        </div>
      </div>

      {/* Grid of philosophers */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {data.data.map((philosopher) => (
          <Link key={philosopher.id} href={`/filosofos/${philosopher.slug}`}>
            <Card className="h-full hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer group">
              <CardHeader>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Badge
                    style={{
                      backgroundColor: philosopher.period.colorHex + '20',
                      color: philosopher.period.colorHex,
                      borderColor: philosopher.period.colorHex
                    }}
                    className="border"
                  >
                    {philosopher.period.name}
                  </Badge>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {philosopher.birthYear < 0 ? `${Math.abs(philosopher.birthYear)} a.C.` : philosopher.birthYear} -{' '}
                      {philosopher.deathYear < 0 ? `${Math.abs(philosopher.deathYear)} a.C.` : philosopher.deathYear}
                    </span>
                  </div>
                </div>
                <CardTitle className="group-hover:text-primary transition-colors">
                  {philosopher.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {philosopher.bioShort}
                </p>

                <div className="flex flex-wrap gap-2 text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <GraduationCap className="h-4 w-4" />
                    <span>{philosopher.nationality}</span>
                  </div>
                  {philosopher.school && (
                    <Badge variant="outline" className="text-xs">
                      {philosopher.school.name}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-sm text-muted-foreground">
                    {philosopher._count.statements} declaraciones
                  </span>
                  <Button variant="ghost" size="sm" className="group-hover:bg-primary group-hover:text-primary-foreground">
                    Ver más →
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      {data.pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => {
              const params = new URLSearchParams(searchParams.toString());
              params.set('page', (page - 1).toString());
              window.location.href = `/filosofos?${params.toString()}`;
            }}
          >
            Anterior
          </Button>

          <div className="flex items-center gap-2">
            {Array.from({ length: Math.min(5, data.pagination.totalPages) }, (_, i) => {
              let pageNum;
              if (data.pagination.totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= data.pagination.totalPages - 2) {
                pageNum = data.pagination.totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }

              return (
                <Button
                  key={pageNum}
                  variant={pageNum === page ? 'default' : 'outline'}
                  onClick={() => {
                    const params = new URLSearchParams(searchParams.toString());
                    params.set('page', pageNum.toString());
                    window.location.href = `/filosofos?${params.toString()}`;
                  }}
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            disabled={page === data.pagination.totalPages}
            onClick={() => {
              const params = new URLSearchParams(searchParams.toString());
              params.set('page', (page + 1).toString());
              window.location.href = `/filosofos?${params.toString()}`;
            }}
          >
            Siguiente
          </Button>
        </div>
      )}
    </div>
  );
}
