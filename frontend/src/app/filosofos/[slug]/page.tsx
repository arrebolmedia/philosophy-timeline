import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { PhilosopherDetail } from '@/components/philosophers/PhilosopherDetail';
import { StatementsTimeline } from '@/components/philosophers/StatementsTimeline';

// En Next 15+ params es una Promesa: leer params.slug sin await daba undefined, la API
// respondía 404 y la ficha caía en notFound() para cualquier filósofo.
interface PageProps {
  params: Promise<{
    slug: string;
  }>;
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
  const { slug } = await params;
  const philosopher = await getPhilosopher(slug);

  if (!philosopher) {
    return {
      title: 'Filósofo no encontrado'
    };
  }

  return {
    title: philosopher.name, // el layout añade "| Historia de la Filosofía" (template)
    description: philosopher.bioShort
  };
}

export default async function PhilosopherPage({ params }: PageProps) {
  const { slug } = await params;
  const philosopher = await getPhilosopher(slug);

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
