import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';

export const runtime = 'edge';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

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

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const philosopherId = searchParams.get('philosopher') ? parseInt(searchParams.get('philosopher')!, 10) : null;
  const statementId = searchParams.get('statement') ? parseInt(searchParams.get('statement')!, 10) : null;

  let kicker: string | null = 'Historia de la Filosofía';
  let headline = 'Timeline interactivo';
  let body: string | null = 'Conexiones entre ideas filosóficas a través del tiempo.';
  const footer = 'timeline.anthonycazares.cafe';

  if (philosopherId !== null || statementId !== null) {
    const data = await fetchTimeline();
    if (philosopherId !== null) {
      const philo = findPhilosopher(data, philosopherId);
      if (philo) {
        kicker = null;
        headline = philo.name || '';
        const birth = philo.birthYear;
        const death = philo.deathYear;
        const fmt = (y: number) => (y < 0 ? `${Math.abs(y)} a.C.` : `${y}`);
        body =
          birth != null && death != null
            ? `${fmt(birth)} — ${fmt(death)}`
            : birth != null
              ? `${fmt(birth)} — presente`
              : null;
      }
    } else if (statementId !== null) {
      const found = findStatement(data, statementId);
      if (found?.stmt) {
        kicker = found.philo?.name || 'Proposición';
        const txt = found.stmt.text || '';
        const truncated = txt.length > 240 ? txt.slice(0, 237).trimEnd() + '…' : txt;
        headline = `«${truncated}»`;
        body = null;
      }
    }
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '70px 80px',
          backgroundColor: '#0f1419',
          backgroundImage:
            'radial-gradient(circle at 20% 20%, rgba(134,239,172,0.10), transparent 60%), radial-gradient(circle at 85% 80%, rgba(252,165,165,0.08), transparent 60%)',
          color: '#f5f3ef',
          fontFamily: 'serif',
        }}
      >
        {kicker ? (
          <div
            style={{
              fontSize: 28,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#86efac',
              display: 'flex',
            }}
          >
            {kicker}
          </div>
        ) : (
          <div style={{ display: 'flex' }} />
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 32, maxWidth: 1040 }}>
          <div
            style={{
              fontSize: headline.length > 120 ? 44 : headline.length > 70 ? 56 : 72,
              lineHeight: 1.15,
              fontWeight: 600,
              display: 'flex',
            }}
          >
            {headline}
          </div>
          {body && (
            <div
              style={{
                fontSize: 28,
                lineHeight: 1.45,
                color: '#d4d0c8',
                display: 'flex',
              }}
            >
              {body}
            </div>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: '#9ca3af',
            fontSize: 22,
            borderTop: '1px solid rgba(255,255,255,0.12)',
            paddingTop: 24,
          }}
        >
          <div style={{ display: 'flex' }}>Historia de la Filosofía</div>
          <div style={{ display: 'flex' }}>{footer}</div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
