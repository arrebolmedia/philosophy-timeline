import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { PhilosopherDetail } from '@/components/philosophers/PhilosopherDetail';
import { StatementsTimeline } from '@/components/philosophers/StatementsTimeline';

interface PageProps {
  params: {
    slug: string;
  };
}

async function getPhilosopher(slug: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/philosophers/${slug}`,
      { cache: 'no-store' }
    );

    if (!response.ok) {
      return null;
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching philosopher:', error);
    return null;
  }
}

export async function generateMetadata({ params }: PageProps) {
  const philosopher = await getPhilosopher(params.slug);

  if (!philosopher) {
    return {
      title: 'Filósofo no encontrado | Historia de la Filosofía'
    };
  }

  return {
    title: `${philosopher.name} | Historia de la Filosofía`,
    description: philosopher.bioShort
  };
}

export default async function PhilosopherPage({ params }: PageProps) {
  const philosopher = await getPhilosopher(params.slug);

  if (!philosopher) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Philosopher Info */}
      <Suspense fallback={<DetailSkeleton />}>
        <PhilosopherDetail philosopher={philosopher} />
      </Suspense>

      {/* Statements Timeline */}
      {philosopher.statements && philosopher.statements.length > 0 && (
        <section className="container py-12">
          <Suspense fallback={<TimelineSkeleton />}>
            <StatementsTimeline statements={philosopher.statements} />
          </Suspense>
        </section>
      )}
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="container py-12">
      <div className="h-64 bg-muted animate-pulse rounded-lg"></div>
    </div>
  );
}

function TimelineSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-32 bg-muted animate-pulse rounded-lg"></div>
      ))}
    </div>
  );
}
