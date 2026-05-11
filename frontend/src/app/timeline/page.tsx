import { Suspense } from 'react';
import type { Metadata } from 'next';
import { TimelineCanvas } from '@/components/timeline/TimelineCanvas';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

type SP = { philosopher?: string; statement?: string };

async function fetchTimeline(): Promise<any | null> {
  try {
    const res = await fetch(`${API_URL}/api/timeline`, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data ?? null;
  } catch {
    return null;
  }
}

function findPhilosopher(data: any, id: number): any | null {
  if (!data?.philosophers) return null;
  const wrapper = data.philosophers.find(
    (p: any) => p?.philosopher?.id === id || p?.id === id
  );
  return wrapper?.philosopher ?? wrapper ?? null;
}

function findStatement(data: any, id: number): { stmt: any; philo: any } | null {
  if (!data?.philosophers) return null;
  for (const wrapper of data.philosophers) {
    const stmts = wrapper?.statements || [];
    const stmt = stmts.find((s: any) => s.id === id);
    if (stmt) {
      const philo = wrapper?.philosopher ?? wrapper ?? null;
      return { stmt, philo };
    }
  }
  return null;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SP>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const philosopherId = sp.philosopher ? parseInt(sp.philosopher, 10) : null;
  const statementId = sp.statement ? parseInt(sp.statement, 10) : null;

  const ogParams = new URLSearchParams();
  if (philosopherId !== null) ogParams.set('philosopher', String(philosopherId));
  else if (statementId !== null) ogParams.set('statement', String(statementId));

  // Default metadata (no filter)
  let title = 'Timeline Interactivo';
  let description = 'Visualiza las conexiones entre ideas filosóficas a través del tiempo.';
  let canonicalPath = '/timeline';

  if (philosopherId !== null || statementId !== null) {
    const data = await fetchTimeline();
    if (philosopherId !== null) {
      const philo = findPhilosopher(data, philosopherId);
      if (philo) {
        title = `${philo.name} | Historia de la Filosofía`;
        description = philo.bioShort?.slice(0, 200) || `Explora las proposiciones y conexiones de ${philo.name} en el timeline filosófico.`;
        canonicalPath = `/timeline?philosopher=${philosopherId}`;
      }
    } else if (statementId !== null) {
      const found = findStatement(data, statementId);
      if (found?.stmt) {
        const author = found.philo?.name || 'filósofo';
        title = `«${found.stmt.text?.slice(0, 80) || 'Proposición'}…» — ${author}`;
        description = found.stmt.text?.slice(0, 280) || `Proposición filosófica de ${author}.`;
        canonicalPath = `/timeline?statement=${statementId}`;
      }
    }
  }

  const url = `${BASE_URL}${canonicalPath}`;
  const ogQS = ogParams.toString();
  const ogImageUrl = ogQS ? `${BASE_URL}/api/og?${ogQS}` : `${BASE_URL}/api/og`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      siteName: 'Historia de la Filosofía',
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default function TimelinePage() {
  return (
    <div className="flex flex-col bg-background overflow-hidden" style={{height: '100dvh', paddingTop: '64px'}}>
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
