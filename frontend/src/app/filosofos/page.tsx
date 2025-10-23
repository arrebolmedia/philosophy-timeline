import { Suspense } from 'react';
import { PhilosophersList } from '@/components/philosophers/PhilosophersList';
import { PhilosophersFilters } from '@/components/philosophers/PhilosophersFilters';

export const metadata = {
  title: 'Filósofos | Historia de la Filosofía',
  description: 'Explora los grandes pensadores de la historia de la filosofía'
};

export default function PhilosophersPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <section className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container py-12 md:py-16">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="h-1 w-12 bg-primary"></div>
              <span className="text-sm font-medium text-muted-foreground">
                Pensadores
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-serif">
              Filósofos
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl">
              Descubre las vidas y pensamientos de los grandes filósofos que han moldeado 
              nuestra comprensión del mundo, desde la Antigua Grecia hasta nuestros días.
            </p>
          </div>
        </div>
      </section>

      {/* Filters and List */}
      <section className="container py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:w-80 flex-shrink-0">
            <div className="sticky top-8">
              <Suspense fallback={<FiltersSkeleton />}>
                <PhilosophersFilters />
              </Suspense>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <Suspense fallback={<ListSkeleton />}>
              <PhilosophersList />
            </Suspense>
          </main>
        </div>
      </section>
    </div>
  );
}

function FiltersSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-32 bg-muted animate-pulse rounded"></div>
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-10 bg-muted animate-pulse rounded"></div>
        ))}
      </div>
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="h-64 bg-muted animate-pulse rounded-lg"></div>
      ))}
    </div>
  );
}
