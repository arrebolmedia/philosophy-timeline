import { Suspense } from 'react';
import { TimelineCanvas } from '@/components/timeline/TimelineCanvas';
import { TimelineFilters } from '@/components/timeline/TimelineFilters';

export const metadata = {
  title: 'Timeline Interactivo | Historia de la Filosofía',
  description: 'Visualiza las conexiones entre ideas filosóficas a través del tiempo'
};

export default function TimelinePage() {
  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      {/* <section className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container py-8">
          <div className="flex flex-col gap-4">
            <h1 className="text-3xl md:text-4xl font-bold font-serif">
              Timeline Filosófico Interactivo
            </h1>
            <p className="text-muted-foreground max-w-3xl">
              Explora las conexiones entre ideas, filósofos y escuelas de pensamiento 
              a través de una visualización interactiva.
            </p>
          </div>
        </div>
      </section> */}

      {/* Timeline Controls */}
      {/* <section className="border-b bg-muted/20">
        <div className="container py-4">
          <Suspense fallback={<div className="h-16 animate-pulse bg-muted rounded" />}>
            <TimelineFilters />
          </Suspense>
        </div>
      </section> */}

      {/* Timeline Canvas */}
      <section className="flex-1 flex flex-col">
        <Suspense fallback={<CanvasSkeleton />}>
          <TimelineCanvas />
        </Suspense>
      </section>
    </div>
  );
}

function CanvasSkeleton() {
  return (
    <div className="w-full h-[calc(100vh-280px)] flex items-center justify-center bg-muted/10">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground">Cargando timeline...</p>
      </div>
    </div>
  );
}
