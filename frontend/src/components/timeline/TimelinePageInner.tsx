'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { TimelineCanvas } from '@/components/timeline/TimelineCanvas';
import { FilterBar } from '@/components/timeline/FilterBar';
import { PhilosopherIndex } from '@/components/timeline/PhilosopherIndex';

export function TimelinePageInner() {
  const searchParams = useSearchParams();
  const meditationMode = searchParams?.get('meditation') === '1';

  return (
    <div
      className="flex flex-col bg-background overflow-hidden transition-[padding] duration-500 ease-in-out"
      style={{ height: '100dvh', paddingTop: meditationMode ? '0' : '64px' }}
    >
      <section className="flex-1 flex flex-col min-h-0 relative">
        <FilterBar />
        <TimelineCanvas />
      </section>
      <PhilosopherIndex />
    </div>
  );
}
