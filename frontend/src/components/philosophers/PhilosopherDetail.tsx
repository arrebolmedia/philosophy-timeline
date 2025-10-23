'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, GraduationCap, ExternalLink, BookOpen, School } from 'lucide-react';

interface Philosopher {
  id: number;
  name: string;
  birthYear: number;
  deathYear: number;
  nationality: string;
  bioShort: string;
  bioLong: string;
  wikipediaUrl: string | null;
  period: {
    name: string;
    colorHex: string;
  };
  school: {
    name: string;
  } | null;
  statements: any[];
}

interface Props {
  philosopher: Philosopher;
}

export function PhilosopherDetail({ philosopher }: Props) {
  return (
    <section className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container py-12 md:py-16">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <Badge
                  style={{
                    backgroundColor: philosopher.period.colorHex + '20',
                    color: philosopher.period.colorHex,
                    borderColor: philosopher.period.colorHex
                  }}
                  className="border text-sm"
                >
                  {philosopher.period.name}
                </Badge>
                {philosopher.school && (
                  <Badge variant="outline" className="text-sm">
                    <School className="h-3 w-3 mr-1" />
                    {philosopher.school.name}
                  </Badge>
                )}
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-serif">
                {philosopher.name}
              </h1>

              <div className="flex flex-wrap gap-4 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {philosopher.birthYear < 0 
                      ? `${Math.abs(philosopher.birthYear)} a.C.` 
                      : philosopher.birthYear} 
                    {' - '}
                    {philosopher.deathYear < 0 
                      ? `${Math.abs(philosopher.deathYear)} a.C.` 
                      : philosopher.deathYear}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  <span>{philosopher.nationality}</span>
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <p className="text-xl text-muted-foreground leading-relaxed">
                {philosopher.bioShort}
              </p>
              <p className="text-lg leading-relaxed mt-4">
                {philosopher.bioLong}
              </p>
            </div>

            {/* Links */}
            {philosopher.wikipediaUrl && (
              <div>
                <Button variant="outline" asChild>
                  <a 
                    href={philosopher.wikipediaUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Ver en Wikipedia
                  </a>
                </Button>
              </div>
            )}
          </div>

          {/* Stats Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardContent className="p-6 space-y-6">
                <div>
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Estadísticas
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Declaraciones</span>
                      <span className="text-2xl font-bold">{philosopher.statements.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Período</span>
                      <span className="text-sm font-medium">{philosopher.period.name}</span>
                    </div>
                    {philosopher.school && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Escuela</span>
                        <span className="text-sm font-medium">{philosopher.school.name}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Vivió</span>
                      <span className="text-sm font-medium">
                        {philosopher.deathYear - philosopher.birthYear} años
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="text-sm font-semibold mb-2">Período Histórico</h4>
                  <div 
                    className="h-2 rounded-full"
                    style={{ backgroundColor: philosopher.period.colorHex }}
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    {philosopher.period.name}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
