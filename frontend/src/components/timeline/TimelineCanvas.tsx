'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import * as d3 from 'd3';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Info, Maximize2, ChevronDown, Download, Share2, Eye, EyeOff, Search } from 'lucide-react';
import type { TimelineData, StatementNode, ConnectionLink, PhilosopherNode } from '@/types/timeline';

const CONNECTION_COLORS = {
  resonate: '#86efac',
  oppose:   '#fca5a5',
  default:  '#d1d5db',
} as const;

function colorFor(type: string): string {
  if (['agreement','expansion','inspiration','influence','resonate'].includes(type)) return CONNECTION_COLORS.resonate;
  if (['disagreement','refutation','oppose'].includes(type)) return CONNECTION_COLORS.oppose;
  return CONNECTION_COLORS.default;
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}

export function TimelineCanvas() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const zoomRef = useRef<any>(null);
  const filterActiveRef = useRef<boolean>(false);
  const initialZoomRef = useRef<any>(null);
  const pendingResetRef = useRef<boolean>(false);
  const skipZoomOnClearRef = useRef<boolean>(false);
  const prevTransformRef = useRef<d3.ZoomTransform>(d3.zoomIdentity.translate(50, 50).scale(0.8));
  const preFilterTransformRef = useRef<d3.ZoomTransform | null>(null);
  const filterTimestampRef = useRef<number>(0);
  const [data, setData] = useState<TimelineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string } | null>(null);
  const [refTooltip, setRefTooltip] = useState<{ x: number; y: number; title: string; author: string; pageSpecific: string; url: string | null } | null>(null);
  const refTooltipTimerRef = useRef<NodeJS.Timeout | null>(null);
  const scheduleRefTooltipClose = useCallback(() => {
    if (refTooltipTimerRef.current) clearTimeout(refTooltipTimerRef.current);
    refTooltipTimerRef.current = setTimeout(() => setRefTooltip(null), 250);
  }, []);
  const cancelRefTooltipClose = useCallback(() => {
    if (refTooltipTimerRef.current) {
      clearTimeout(refTooltipTimerRef.current);
      refTooltipTimerRef.current = null;
    }
  }, []);
  const [highlightId, setHighlightId] = useState<number | null>(null);
  const [hoveredPhilosopher, setHoveredPhilosopher] = useState<number | null>(null);
  const [hoveredStatement, setHoveredStatement] = useState<number | null>(null);
  const [filteredPhilosopher, setFilteredPhilosopher] = useState<number | null>(() => {
    const p = searchParams.get('philosopher');
    return p ? parseInt(p, 10) : null;
  });
  const [filteredStatement, setFilteredStatement] = useState<number | null>(() => {
    const s = searchParams.get('statement');
    return s ? parseInt(s, 10) : null;
  });

  // Declarative filters (chips): periods, schools, categories, years
  const parseIdList = (raw: string | null): number[] =>
    raw ? raw.split(',').map(s => parseInt(s, 10)).filter(n => Number.isFinite(n)) : [];
  const parseYearRange = (raw: string | null): [number, number] | null => {
    if (!raw) return null;
    const m = raw.match(/^(-?\d+)-(-?\d+)$/);
    if (!m) return null;
    const a = parseInt(m[1], 10), b = parseInt(m[2], 10);
    if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
    return [Math.min(a, b), Math.max(a, b)];
  };
  const chipPeriods    = parseIdList(searchParams.get('periods'));
  const chipSchools    = parseIdList(searchParams.get('schools'));
  const chipCategories = parseIdList(searchParams.get('categories'));
  const chipYears      = parseYearRange(searchParams.get('years'));
  const hasChipFilters = chipPeriods.length > 0 || chipSchools.length > 0 || chipCategories.length > 0 || !!chipYears;
  // Stable signature so the render effect re-runs when chips change
  const chipSignature = `${chipPeriods.join(',')}|${chipSchools.join(',')}|${chipCategories.join(',')}|${chipYears ? `${chipYears[0]}-${chipYears[1]}` : ''}`;
  const [legendCollapsed, setLegendCollapsed] = useState(false);
  const [catalogs, setCatalogs] = useState<{ periods: Record<number,string>; schools: Record<number,string>; categories: Record<number,string> }>({ periods: {}, schools: {}, categories: {} });
  const meditationMode = searchParams.get('meditation') === '1';
  const setMeditationMode = useCallback((next: boolean | ((prev: boolean) => boolean)) => {
    const value = typeof next === 'function' ? next(meditationMode) : next;
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set('meditation', '1');
    else params.delete('meditation');
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [meditationMode, searchParams, pathname, router]);
  const [canvasKey, setCanvasKey] = useState(0);
  const [appVersion, setAppVersion] = useState<string | null>(null);

  // Sync filter state to URL query params (preserve other params like meditation, chips)
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('philosopher');
    params.delete('statement');
    if (filteredPhilosopher !== null) params.set('philosopher', String(filteredPhilosopher));
    else if (filteredStatement !== null) params.set('statement', String(filteredStatement));
    const queryString = params.toString();
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
    router.replace(newUrl, { scroll: false });
  }, [filteredPhilosopher, filteredStatement, pathname, router]);

  // Sync URL → state when params change externally (e.g. PhilosopherIndex selection)
  useEffect(() => {
    const p = searchParams.get('philosopher');
    const s = searchParams.get('statement');
    const urlPhil = p ? parseInt(p, 10) : null;
    const urlStmt = s ? parseInt(s, 10) : null;
    if (urlPhil !== filteredPhilosopher) setFilteredPhilosopher(urlPhil);
    if (urlStmt !== filteredStatement) setFilteredStatement(urlStmt);
  }, [searchParams]);

  const copyShareLink = useCallback(() => {
    if (typeof window === 'undefined') return;
    const url = window.location.href;
    if (!navigator.clipboard?.writeText) {
      toast.error('Tu navegador no permite copiar al portapapeles.');
      return;
    }
    navigator.clipboard.writeText(url)
      .then(() => {
        toast.success('Enlace copiado al portapapeles', {
          description: 'Compártelo para mostrar esta vista del timeline.',
        });
      })
      .catch(() => {
        toast.error('No se pudo copiar el enlace.');
      });
  }, []);

  useEffect(() => {
    const fetchTimelineData = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/timeline`);
        if (!response.ok) throw new Error('Error al cargar datos');
        const result = await response.json();
        const raw = result.data;
        const flatStatements = (raw.philosophers || []).flatMap((p: any) => p.statements || []);
        setData({ ...raw, statements: flatStatements } as TimelineData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchTimelineData();
  }, []);

  useEffect(() => {
    Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/periods`).then(r => r.json()).catch(() => null),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/schools`).then(r => r.json()).catch(() => null),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`).then(r => r.json()).catch(() => null),
    ]).then(([p, s, c]) => {
      const toMap = (arr: any[]): Record<number,string> =>
        Object.fromEntries((arr || []).map(x => [x.id, x.slug || x.name]));
      setCatalogs({
        periods:    toMap(p?.data || []),
        schools:    toMap(s?.data || []),
        categories: toMap(c?.data || []),
      });
    });
  }, []);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/changelog`)
      .then(r => r.json())
      .then(r => {
        const latest = r.data?.desarrollo?.[0];
        if (latest) {
          const match = latest.description.match(/v(\d+\.\d+\.\d+)/);
          if (match) setAppVersion(match[1]);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(() => {
      if ((containerRef.current?.clientWidth ?? 0) > 50) {
        setCanvasKey(k => k + 1);
      }
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!data || !svgRef.current || !containerRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    if (width < 50 || height < 50) return;

    svg.attr('width', width)
       .attr('height', height)
       .style('overflow', 'visible')
       .style('user-select', 'none')
       .style('-webkit-user-select', 'none')
       .style('-moz-user-select', 'none')
       .style('-ms-user-select', 'none');

    // Create main group for zoom/pan transformations (no GPU hints — test).
    const g = svg.append('g')
      .attr('class', 'main-group');

    // Diagonal axis direction (matches layout ANGLE = 40°)
    const _diagCos = Math.cos(40 * Math.PI / 180);
    const _diagSin = Math.sin(40 * Math.PI / 180);

    // Wheel zoom — instant, no momentum (precision tool, not surface emulation)
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .filter(() => false)  // disable all D3 zoom input — handled manually below
      .on('zoom', () => {});

    svg.node()!.addEventListener('wheel', (e: WheelEvent) => {
      e.preventDefault();

      const cx = e.offsetX;
      const cy = e.offsetY;

      // Normalize delta across trackpad / mouse wheel
      const px = -e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 100 : 1);
      const clamped = Math.max(-120, Math.min(120, px));
      const factor = Math.pow(1.0015, clamped);

      const cur = prevTransformRef.current;
      const targetK = Math.max(0.1, Math.min(4, cur.k * factor));
      const mTx = cx - (cx - cur.x) * (targetK / cur.k);
      const mTy = cy - (cy - cur.y) * (targetK / cur.k);
      const mdx = mTx - cur.x;
      const mdy = mTy - cur.y;
      const mScalar = mdx * _diagCos + mdy * _diagSin;
      const next = d3.zoomIdentity
        .translate(cur.x + mScalar * _diagCos, cur.y + mScalar * _diagSin)
        .scale(targetK);
      prevTransformRef.current = next;
      g.attr('transform', next.toString());
      // Sync D3 internal __zoom directly (no event dispatch, no traversal)
      (svg.node() as any).__zoom = next;
    }, { passive: false });

    // Store zoom reference for programmatic control
    zoomRef.current = zoom;

    // Apply zoom behavior to SVG
    svg.call(zoom);

    // Diagonal drag — instant, no momentum (precision tool)
    let _dragStartX = 0;
    let _dragStartY = 0;
    let _dragStartTransform = prevTransformRef.current;

    const drag = d3.drag<SVGSVGElement, unknown>()
      .on('start', (event) => {
        _dragStartX = event.x;
        _dragStartY = event.y;
        _dragStartTransform = prevTransformRef.current;
        (svg.node() as any).__lastZoomTime = Date.now();
      })
      .on('drag', (event) => {
        const dx = event.x - _dragStartX;
        const dy = event.y - _dragStartY;
        const scalar = dx * _diagCos + dy * _diagSin;
        const t = _dragStartTransform;
        const newTransform = d3.zoomIdentity
          .translate(t.x + scalar * _diagCos, t.y + scalar * _diagSin)
          .scale(t.k);
        prevTransformRef.current = newTransform;
        g.attr('transform', newTransform.toString());
        (svg.node() as any).__zoom = newTransform;
        (svg.node() as any).__lastZoomTime = Date.now();
      });

    svg.call(drag);

    // Click on background to clear filters (no zoom change)
    svg.on('click', (event) => {
      const target = event.target as Element;
      const isInteractive = !!target.closest?.('.statement, .philosopher-label, .connection');
      if (!isInteractive) {
        skipZoomOnClearRef.current = true;
        setFilteredPhilosopher(null);
        setFilteredStatement(null);
      }
    });

    // Initial transform calculated after layout (see below, after philosophers loop)

    // Handle API response format which may have nested structure
    const philosophers: PhilosopherNode[] = [...(data.philosophers || [])].map((p: any) => {
      // If API returns { philosopher, statements }, flatten it
      if (p.philosopher) {
        return { ...p.philosopher, statements: p.statements };
      }
      // Otherwise it's already a PhilosopherNode
      return p;
    }).sort((a, b) => (a.birthYear || -1000) - (b.birthYear || -1000));

    // SINGLE DIAGONAL AXIS: philosophers and statements all share one diagonal line
    const ANGLE    = 40 * Math.PI / 180;
    const PHIL_STEP      = 52;  // gap before each philosopher node
    const PHIL_AFTER_GAP = 42;  // extra gap after philosopher node before first statement
    const STAT_STEP      = 26;  // spacing between statement nodes
    const ORIGIN_X  = 100;
    const ORIGIN_Y  = 60;
    const cosA = Math.cos(ANGLE);
    const sinA = Math.sin(ANGLE);

    const statements: StatementNode[] = [];
    let dist = 0; // accumulated distance along the axis

    philosophers.forEach((p) => {
      dist += PHIL_STEP;
      p.x = ORIGIN_X + dist * cosA;
      p.y = ORIGIN_Y + dist * sinA;

      const stmts = p.statements || [];
      stmts.forEach((s: StatementNode, j: number) => {
        dist += j === 0 ? PHIL_AFTER_GAP : STAT_STEP;
        s.x = ORIGIN_X + dist * cosA;
        s.y = ORIGIN_Y + dist * sinA;
        s.philosopherId = p.id;
        statements.push(s);
      });
    });

    // Dynamic initial transform — fit-to-content scale, axis anchored to upper-left
    const axisEndX = ORIGIN_X + dist * cosA;
    const axisEndY = ORIGIN_Y + dist * sinA;
    const fitPad = 60;
    const rawFitK = Math.min(
      (width  - fitPad * 2) / (axisEndX + 200),
      (height - fitPad * 2) / (axisEndY + 100)
    );
    const fitK = Math.max(0.03, Math.min(4, rawFitK));
    // Center the axis content on screen
    const midX = (ORIGIN_X + axisEndX) / 2;
    const midY = (ORIGIN_Y + axisEndY) / 2;
    const initialTransform = d3.zoomIdentity.translate(width / 2 - midX * fitK, height / 2 - midY * fitK).scale(fitK);
    initialZoomRef.current = initialTransform;
    prevTransformRef.current = initialTransform;
    // Set directly on DOM — bypasses the diagonal-projection zoom handler
    g.attr('transform', initialTransform.toString());
    (svg.node() as any).__zoom = initialTransform;

// ===== DRAW CONNECTIONS FIRST (bottom layer) =====
    const connG = g.append('g').attr('class', 'connections');
    const conns: ConnectionLink[] = data.connections || [];
    console.log('Drawing connections:', conns.length, conns);


    // Perfect 180° semicircle arcs using SVG arc command.
    // Green (positive): sweeps above the chord (sweep-flag=0, upward arc).
    // Red (negative): sweeps below the chord (sweep-flag=1, downward arc).
    const pathFor = (c: ConnectionLink) => {
      const from = statements.find(s => s.id === c.statementFromId);
      const to   = statements.find(s => s.id === c.statementToId);
      if (!from || !to) return '';
      const isRed = ['disagreement','refutation','oppose'].includes(c.connectionType as string);
      const x1 = (from.x || 0) - 10;
      const y1 = (from.y || 0) - 4;
      const x2 = (to.x || 0) - 10;
      const y2 = (to.y || 0) - 4;
      const dx = x2 - x1, dy = y2 - y1;
      const r = Math.sqrt(dx * dx + dy * dy) / 2;
      // Direction-aware sweep: going right (dx>=0) sweep=1→above, sweep=0→below
      //                        going left  (dx<0)  sweep=0→above, sweep=1→below
      const aboveSweep = dx >= 0 ? 1 : 0;
      const sweep = isRed ? 1 - aboveSweep : aboveSweep;
      return `M ${x1} ${y1} A ${r} ${r} 0 0 ${sweep} ${x2} ${y2}`;
    };

    connG.selectAll('path.connection').data(conns, (d: any) => d.id).enter().append('path')
      .attr('class', 'connection')
      .attr('data-from', (d: any) => d.statementFromId)
      .attr('data-to', (d: any) => d.statementToId)
      .attr('d', (d: any) => pathFor(d))
      .attr('fill', 'none')
      .attr('stroke', (d: any) => colorFor(d.connectionType))
      .attr('stroke-width', 2)
      .attr('opacity', 1)
      .style('pointer-events', 'none');  // connections never receive events — skip hit-testing

    // ===== THEN DRAW PHILOSOPHERS (middle layer) =====
    const philoG = g.append('g').attr('class', 'philosophers');
    const philoItems = philoG.selectAll('.philosopher-label').data(philosophers).enter().append('g')
      .attr('class', 'philosopher-label')
      .attr('transform', (d: any) => `translate(${d.x}, ${d.y})`)
      .style('cursor', 'pointer')
      .on('mouseenter', (event, d: any) => {
        if (!filterActiveRef.current) {
          setHoveredPhilosopher(d.id);
        }
      })
      .on('mouseleave', () => {
        if (!filterActiveRef.current) {
          setHoveredPhilosopher(null);
        }
      })
      .on('click', (event, d: any) => {
        event.stopPropagation();
        if (!filterActiveRef.current) preFilterTransformRef.current = prevTransformRef.current;
        setFilteredPhilosopher(prev => prev === d.id ? null : d.id);
        setFilteredStatement(null);
      });

    // Add invisible hit area FIRST (so it's behind visual elements but captures events)
    philoItems.append('rect')
      .attr('x', -50)
      .attr('y', -25)
      .attr('width', 400)
      .attr('height', 35)
      .attr('fill', 'transparent');

    // Circle for philosopher image/avatar (left side)
    philoItems.append('clipPath')
      .attr('id', (d: any) => `clip-${d.slug}`)
      .append('circle')
      .attr('cx', -30)
      .attr('cy', 0)
      .attr('r', 18);

    // Image position adjustments per philosopher (to center faces properly)
    const imageAdjustments: Record<string, { x: number, y: number }> = {
      // Add adjustments as needed, e.g.: 'pitagoras': { x: -50, y: -20 }
    };

    // Philosopher image (if available) with grayscale filter
    philoItems.append('image')
      .attr('xlink:href', (d: any) => d.imageUrl || '')
      .attr('x', (d: any) => imageAdjustments[d.slug]?.x ?? -48)
      .attr('y', (d: any) => imageAdjustments[d.slug]?.y ?? -18)
      .attr('width', 36)
      .attr('height', 36)
      .attr('clip-path', (d: any) => `url(#clip-${d.slug})`)
      .attr('preserveAspectRatio', 'xMidYMid slice') // Cover effect: crop to fill circle
      .style('filter', 'grayscale(100%)') // Black and white filter
      .style('display', (d: any) => d.imageUrl ? 'block' : 'none');

    // Fallback: Circle background for those without image
    philoItems.append('circle')
      .attr('cx', -30)
      .attr('cy', 0)
      .attr('r', 18)
      .attr('fill', '#f0f0f0')
      .attr('stroke', '#ccc')
      .attr('stroke-width', 2)
      .style('display', (d: any) => d.imageUrl ? 'none' : 'block');

    // Philosopher initials inside circle (fallback for missing images)
    philoItems.append('text')
      .attr('x', -30)
      .attr('y', 5)
      .attr('text-anchor', 'middle')
      .text(d => {
        const names = d.name.split(' ');
        return names.length > 1 
          ? names[0][0] + names[names.length - 1][0]
          : names[0].substring(0, 2);
      })
      .style('font-weight', '700')
      .style('font-size', '12px')
      .style('fill', '#666')
      .style('display', (d: any) => d.imageUrl ? 'none' : 'block');

    // Philosopher name (right of circle, on same line as dates)
    philoItems.append('text')
      .attr('class', 'philo-name')
      .attr('x', 0)
      .attr('y', 5)
      .text(d => d.name.toUpperCase())
      .style('font-weight', '700')
      .style('font-size', '15px')
      .style('fill', '#111');

    // Years on same line — añadir primero con x=0, luego reposicionar con getBBox real
    philoItems.each(function(d: any) {
      const group = d3.select(this);
      const birth = d.birthYear < 0 ? `${Math.abs(d.birthYear)} BCE` : `${d.birthYear}`;
      const death = d.deathYear == null ? 'presente' : (d.deathYear < 0 ? `${Math.abs(d.deathYear)} BCE` : `${d.deathYear}`);
      group.append('text')
        .attr('class', 'philo-years')
        .attr('x', 0)
        .attr('y', 5)
        .text(`${birth} – ${death}`)
        .style('font-size', '11px')
        .style('fill', '#888');
    });

    // Reposicionar fechas usando el ancho real del nombre (ya renderizado)
    philoItems.each(function() {
      const group = d3.select(this);
      const nameEl = group.select<SVGTextElement>('.philo-name').node();
      const yearsEl = group.select<SVGTextElement>('.philo-years').node();
      if (!nameEl || !yearsEl) return;
      try {
        const nameWidth = nameEl.getBBox().width;
        yearsEl.setAttribute('x', String(nameWidth + 10));
      } catch { /* getBBox puede fallar fuera del DOM */ }
    });

    // statements
    const statementsG = g.append('g').attr('class', 'statements');
    const stmtNodes = statementsG.selectAll('.statement').data(statements, (d: any) => d.id).enter().append('g')
      .attr('class', 'statement')
      .attr('transform', (d: any) => `translate(${d.x}, ${d.y})`)
      .style('cursor', 'pointer')
      .on('mouseenter', function(event, d: any) {
        if (!filterActiveRef.current) {
          setHoveredStatement(d.id);
        }
        const node = d3.select(this);
        const iconG = node.select<SVGGElement>('.stmt-ref-icon');
        if (!iconG.empty()) {
          const textEl = node.select<SVGTextElement>('text.stmt-text').node();
          let textWidth = 200;
          try { if (textEl) textWidth = textEl.getBBox().width; } catch { /* skip */ }
          iconG.attr('transform', `translate(${textWidth + 4}, -12)`);
        }
        iconG.transition().duration(150).style('opacity', 1);
      })
      .on('mouseleave', function() {
        if (!filterActiveRef.current) {
          setHoveredStatement(null);
        }
        d3.select(this).select('.stmt-ref-icon').transition().duration(150).style('opacity', 0);
      })
      .on('click', (event, d: any) => {
        event.stopPropagation();
        if (!filterActiveRef.current) preFilterTransformRef.current = prevTransformRef.current;
        setFilteredStatement(prev => prev === d.id ? null : d.id);
        setFilteredPhilosopher(null);
      });

    // Statement text (longer, single line)
    stmtNodes.append('text').attr('class', 'stmt-text').attr('x', 0).attr('y', 0).text((d: any) => truncate(d.text, 250))
      .style('font-size', '11px').style('fill', '#222');

    // Reference icon (book) — only for statements with a reference
    stmtNodes.filter((d: any) => Array.isArray(d.references) && d.references.length > 0)
      .each(function(d: any) {
        const node = d3.select(this);
        const textEl = node.select<SVGTextElement>('text.stmt-text').node();
        const textWidth = textEl ? textEl.getBBox().width : 200;
        const iconG = node.append('g')
          .attr('class', 'stmt-ref-icon')
          .attr('transform', `translate(${textWidth + 4}, -12)`)
          .style('opacity', 0)
          .style('cursor', 'pointer')
          .style('pointer-events', 'all');
        // Lucide BookOpen icon, scaled to 12px (viewBox 24x24 → scale 0.5)
        const iconSvg = iconG.append('g').attr('transform', 'scale(0.5)');
        iconSvg.append('path')
          .attr('d', 'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z')
          .attr('fill', 'none')
          .attr('stroke', '#666')
          .attr('stroke-width', 2)
          .attr('stroke-linecap', 'round')
          .attr('stroke-linejoin', 'round');
        iconSvg.append('path')
          .attr('d', 'M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z')
          .attr('fill', 'none')
          .attr('stroke', '#666')
          .attr('stroke-width', 2)
          .attr('stroke-linecap', 'round')
          .attr('stroke-linejoin', 'round');
        // Larger invisible hit area
        iconG.append('rect')
          .attr('x', -2).attr('y', -2).attr('width', 16).attr('height', 16)
          .attr('fill', 'transparent');
        // Hover state — darken the icon
        iconG
          .on('mouseover.style', () => iconSvg.selectAll('path').attr('stroke', '#222'))
          .on('mouseout.style', () => iconSvg.selectAll('path').attr('stroke', '#666'));
        iconG
          .on('mouseenter', (event) => {
            cancelRefTooltipClose();
            const ref = d.references[0]?.reference;
            if (!ref) return;
            const url = d.references[0]?.urlSpecific || ref.url || null;
            setRefTooltip({
              x: event.clientX,
              y: event.clientY,
              title: ref.title || '',
              author: ref.author || '',
              pageSpecific: d.references[0]?.pageSpecific || '',
              url,
            });
          })
          .on('mouseleave', () => scheduleRefTooltipClose())
          .on('click', (event) => {
            event.stopPropagation();
            const url = d.references[0]?.urlSpecific || d.references[0]?.reference?.url;
            if (url) window.open(url, '_blank', 'noopener,noreferrer');
          });
      });

    // Tags inline, smaller
    stmtNodes.append('text').attr('x', 0).attr('y', -14).text((d: any) => ((d.tags || []).slice(0,2).map((t:any)=>t.tag?.name||t).join(', ')))
      .style('font-size', '9px').style('fill', '#999').style('font-style', 'italic');

    // Connection anchor dots with smart coloring based on connection types
    stmtNodes.each(function(d: any) {
      const statement = d as StatementNode;
      
      // Find all connections involving this statement
      const relatedConnections = conns.filter((c: ConnectionLink) => 
        c.statementFromId === statement.id || c.statementToId === statement.id
      );
      
      if (relatedConnections.length === 0) {
        // No connections - gray dot
        d3.select(this).append('circle')
          .attr('cx', -10).attr('cy', -4).attr('r', 3)
          .attr('fill', CONNECTION_COLORS.default).attr('opacity', 1);
      } else {
        // Count positive vs negative connections
        const positiveCount = relatedConnections.filter((c: ConnectionLink) => 
          ['agreement','expansion','inspiration','influence','resonate'].includes(c.connectionType as string)
        ).length;
        const negativeCount = relatedConnections.filter((c: ConnectionLink) => 
          ['disagreement','refutation','oppose'].includes(c.connectionType as string) || c.connectionType === 'oppose'
        ).length;
        
        if (positiveCount > 0 && negativeCount === 0) {
          // Only positive - green dot
          d3.select(this).append('circle')
            .attr('cx', -10).attr('cy', -4).attr('r', 3)
            .attr('fill', CONNECTION_COLORS.resonate).attr('opacity', 1);
        } else if (negativeCount > 0 && positiveCount === 0) {
          // Only negative - red dot
          d3.select(this).append('circle')
            .attr('cx', -10).attr('cy', -4).attr('r', 3)
            .attr('fill', CONNECTION_COLORS.oppose).attr('opacity', 1);
        } else if (positiveCount > 0 && negativeCount > 0) {
          // Both - split half green, half red using a gradient or two half-circles
          const g = d3.select(this);
          
          // Left half - green
          g.append('path')
            .attr('d', 'M -10 -7 A 3 3 0 0 1 -10 -1 Z')
            .attr('fill', CONNECTION_COLORS.resonate).attr('opacity', 1);

          // Right half - red
          g.append('path')
            .attr('d', 'M -10 -7 A 3 3 0 0 0 -10 -1 Z')
            .attr('fill', CONNECTION_COLORS.oppose).attr('opacity', 1);
        }
      }
    });

    // Apply highlight styling
    if (highlightId) {
      connG.selectAll('path.connection').attr('opacity', (d: any) => (d.statementFromId === highlightId || d.statementToId === highlightId) ? 0.9 : 0.1);
      stmtNodes.selectAll('rect').attr('opacity', (d: any) => (d.id === highlightId ? 0.15 : 0.04));
    }

    function truncate(text: string, max = 80) {
      if (!text) return '';
      return text.length > max ? text.substring(0, max - 1) + '…' : text;
    }

    // no explicit cleanup necessary beyond clearing svg at start of effect
  }, [data, highlightId, canvasKey, chipSignature]);

  const doResetZoom = useCallback(() => {
    if (!svgRef.current || !zoomRef.current || !containerRef.current) return;
    const svg = d3.select(svgRef.current);
    const g = svg.select('g');
    const bbox = (g.node() as SVGGElement)?.getBBox();
    if (!bbox || bbox.width === 0) return;
    const svgW = containerRef.current.clientWidth;
    const svgH = containerRef.current.clientHeight;
    const padding = 80;
    const scale = Math.min(
      (svgW - padding * 2) / bbox.width,
      (svgH - padding * 2) / bbox.height
    );
    const tx = svgW / 2 - (bbox.x + bbox.width / 2) * scale;
    const ty = svgH / 2 - (bbox.y + bbox.height / 2) * scale;
    const targetTransform = d3.zoomIdentity.translate(tx, ty).scale(scale);
    prevTransformRef.current = targetTransform;
    svg.select<SVGGElement>('g.main-group')
      .transition().duration(600).ease(d3.easeCubicInOut)
      .attr('transform', targetTransform.toString())
      .on('end', () => { svg.call(zoomRef.current.transform as any, targetTransform); });
  }, []);

  const handleResetZoom = useCallback(() => {
    if (!filteredPhilosopher && !filteredStatement) {
      requestAnimationFrame(() => requestAnimationFrame(() => doResetZoom()));
    } else {
      pendingResetRef.current = true;
      setFilteredPhilosopher(null);
      setFilteredStatement(null);
    }
  }, [filteredPhilosopher, filteredStatement, doResetZoom]);

  // Execute zoom reset after filters have been cleared and DOM has updated
  useEffect(() => {
    if (pendingResetRef.current && !filteredPhilosopher && !filteredStatement) {
      pendingResetRef.current = false;
      // Two rAF frames: first lets React paint, second lets D3 opacity effects settle
      requestAnimationFrame(() => requestAnimationFrame(() => doResetZoom()));
    }
  }, [filteredPhilosopher, filteredStatement, doResetZoom]);

  const handleExportPng = useCallback(async () => {
    if (!svgRef.current) return;

    const SCALE     = 3;
    const PADDING   = 60;
    const BG_COLOR  = '#ffffff';
    const MAX_SIDE  = 8192;

    const svgEl = svgRef.current;
    const svg   = d3.select(svgEl);
    const gNode = svg.select<SVGGElement>('g.main-group').node();
    if (!gNode) return;

    let bbox: { x: number; y: number; width: number; height: number };

    if (filterActiveRef.current) {
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      let found = false;

      svg.selectAll<SVGGElement, unknown>('.philosopher-label, .statement, .connection').each(function () {
        const el = this as SVGGElement;
        if (parseFloat(el.style.opacity ?? '1') < 0.05) return;
        try {
          const b    = el.getBBox();
          const ctm  = el.getCTM();
          const gCTM = gNode.getCTM();
          if (!ctm || !gCTM) return;
          const m = gCTM.inverse().multiply(ctm);
          [
            { x: b.x,           y: b.y            },
            { x: b.x + b.width, y: b.y            },
            { x: b.x,           y: b.y + b.height },
            { x: b.x + b.width, y: b.y + b.height },
          ].forEach(({ x, y }) => {
            const tx = m.a * x + m.c * y + m.e;
            const ty = m.b * x + m.d * y + m.f;
            if (tx < minX) minX = tx;
            if (ty < minY) minY = ty;
            if (tx > maxX) maxX = tx;
            if (ty > maxY) maxY = ty;
            found = true;
          });
        } catch { /* getBBox puede fallar en nodos ocultos */ }
      });

      if (!found) {
        toast.error('No hay elementos visibles para exportar.');
        return;
      }
      bbox = { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
    } else {
      // Full timeline — iterate all nodes (same method, no opacity filter)
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      let found = false;
      svg.selectAll<SVGGElement, unknown>('.philosopher-label, .statement, .connection').each(function () {
        const el = this as SVGGElement;
        try {
          const b    = el.getBBox();
          const ctm  = el.getCTM();
          const gCTM = gNode.getCTM();
          if (!ctm || !gCTM) return;
          const m = gCTM.inverse().multiply(ctm);
          [
            { x: b.x,           y: b.y            },
            { x: b.x + b.width, y: b.y            },
            { x: b.x,           y: b.y + b.height },
            { x: b.x + b.width, y: b.y + b.height },
          ].forEach(({ x, y }) => {
            const tx = m.a * x + m.c * y + m.e;
            const ty = m.b * x + m.d * y + m.f;
            if (tx < minX) minX = tx;
            if (ty < minY) minY = ty;
            if (tx > maxX) maxX = tx;
            if (ty > maxY) maxY = ty;
            found = true;
          });
        } catch { /* skip */ }
      });
      if (!found) return;
      bbox = { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
    }

    const vx = bbox.x - PADDING;
    const vy = bbox.y - PADDING;
    const vw = bbox.width  + PADDING * 2;
    const vh = bbox.height + PADDING * 2;

    const rawScale = Math.min(SCALE, MAX_SIDE / Math.max(vw, vh));
    const outW = Math.round(vw * rawScale);
    const outH = Math.round(vh * rawScale);

    const clone = svgEl.cloneNode(true) as SVGSVGElement;
    clone.setAttribute('width',    String(outW));
    clone.setAttribute('height',   String(outH));
    clone.setAttribute('viewBox',  `${vx} ${vy} ${vw} ${vh}`);
    clone.setAttribute('xmlns',    'http://www.w3.org/2000/svg');
    clone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
    clone.querySelector('g.main-group')?.removeAttribute('transform');

    const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bgRect.setAttribute('x',      String(vx));
    bgRect.setAttribute('y',      String(vy));
    bgRect.setAttribute('width',  String(vw));
    bgRect.setAttribute('height', String(vh));
    bgRect.setAttribute('fill',   BG_COLOR);
    clone.insertBefore(bgRect, clone.firstChild);

    clone.querySelectorAll('text').forEach((t) => {
      if (!t.style.fontFamily) t.style.fontFamily = 'system-ui, sans-serif';
    });

    // Copyright watermark — esquina inferior derecha
    const year = new Date().getFullYear();
    const copyrightEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    copyrightEl.textContent = `© ${year} Anthony Cazares`;
    copyrightEl.setAttribute('x', String(vx + vw - PADDING / 2));
    copyrightEl.setAttribute('y', String(vy + vh - PADDING / 4));
    copyrightEl.setAttribute('text-anchor', 'end');
    copyrightEl.setAttribute('dominant-baseline', 'auto');
    copyrightEl.style.fontSize = '11px';
    copyrightEl.style.fill = '#9ca3af';
    copyrightEl.style.fontFamily = 'system-ui, sans-serif';
    clone.appendChild(copyrightEl);

    // URL — esquina inferior izquierda
    const urlEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    urlEl.textContent = 'timeline.anthonycazares.cafe';
    urlEl.setAttribute('x', String(vx + PADDING / 2));
    urlEl.setAttribute('y', String(vy + vh - PADDING / 4));
    urlEl.setAttribute('text-anchor', 'start');
    urlEl.setAttribute('dominant-baseline', 'auto');
    urlEl.style.fontSize = '11px';
    urlEl.style.fill = '#9ca3af';
    urlEl.style.fontFamily = 'system-ui, sans-serif';
    clone.appendChild(urlEl);

    await Promise.all(
      Array.from(clone.querySelectorAll('image')).map(async (imgEl) => {
        const href = imgEl.getAttribute('href') || imgEl.getAttribute('xlink:href') || '';
        if (!href || href.startsWith('data:')) return;
        try {
          const resp = await fetch(href, { mode: 'cors' });
          if (!resp.ok) throw new Error('fetch failed');
          const blob = await resp.blob();
          const dataUrl = await new Promise<string>((res, rej) => {
            const r = new FileReader();
            r.onload = () => res(r.result as string);
            r.onerror = rej;
            r.readAsDataURL(blob);
          });
          imgEl.setAttribute('href', dataUrl);
          imgEl.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', dataUrl);
        } catch {
          imgEl.remove();
        }
      })
    );

    const svgString = new XMLSerializer().serializeToString(clone);
    const svgUrl    = URL.createObjectURL(new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' }));

    // Build a meaningful filename based on the active filter.
    // Note: API shape is philosophers[i].philosopher = { id, name, ... }
    const getPhilosopherById = (id: number): { name?: string } | null => {
      const wrapper = (data?.philosophers as any[] | undefined)?.find(
        (p: any) => p?.philosopher?.id === id || p?.id === id
      );
      return wrapper?.philosopher ?? wrapper ?? null;
    };

    let filename = 'timeline-filosofia';
    if (filteredPhilosopher !== null && data) {
      const philo = getPhilosopherById(filteredPhilosopher);
      if (philo?.name) filename = `filosofo-${slugify(philo.name)}`;
    } else if (filteredStatement !== null && data) {
      const stmt = (data.statements as StatementNode[] | undefined)?.find(s => s.id === filteredStatement);
      const philo = stmt ? getPhilosopherById(stmt.philosopherId) : null;
      if (philo?.name) {
        filename = `proposicion-${slugify(philo.name)}-${filteredStatement}`;
      } else {
        filename = `proposicion-${filteredStatement}`;
      }
    } else if (hasChipFilters) {
      // Build filename from active chips: timeline-{periods}-{categories}-{schools}-{years}
      const parts: string[] = ['timeline'];
      if (chipPeriods.length > 0) {
        parts.push(chipPeriods.map(id => catalogs.periods[id]).filter(Boolean).map(slugify).join('-'));
      }
      if (chipCategories.length > 0) {
        parts.push(chipCategories.map(id => catalogs.categories[id]).filter(Boolean).map(slugify).join('-'));
      }
      if (chipSchools.length > 0) {
        parts.push(chipSchools.map(id => catalogs.schools[id]).filter(Boolean).map(slugify).join('-'));
      }
      if (chipYears) {
        const fmt = (y: number) => y < 0 ? `${Math.abs(y)}ac` : `${y}`;
        parts.push(`${fmt(chipYears[0])}-${fmt(chipYears[1])}`);
      }
      const joined = parts.filter(p => p.length > 0).join('-').slice(0, 100);
      if (joined.length > 'timeline'.length) filename = joined;
    }

    try {
      await new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width  = outW;
          canvas.height = outH;
          const ctx = canvas.getContext('2d');
          if (!ctx) { reject(new Error('No canvas context')); return; }
          ctx.fillStyle = BG_COLOR;
          ctx.fillRect(0, 0, outW, outH);
          ctx.drawImage(img, 0, 0, outW, outH);
          try {
            const link = document.createElement('a');
            link.download = `${filename}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            resolve();
          } catch (e) { reject(e); }
        };
        img.onerror = reject;
        img.src = svgUrl;
      });
      toast.success('Imagen exportada', {
        description: `${filename}.png se descargó a tu equipo.`,
      });
    } catch (err) {
      console.error('Export PNG failed:', err);
      toast.error('No se pudo exportar la imagen.');
    } finally {
      URL.revokeObjectURL(svgUrl);
    }
  }, [filteredPhilosopher, filteredStatement, data, hasChipFilters, chipSignature, catalogs]);


  // Effect to handle hover and filter opacity changes
  useEffect(() => {
    if (!svgRef.current || !data) return;

    const svg = d3.select(svgRef.current);
    
    // Save previous filter state before updating
    const wasFilterActive = filterActiveRef.current;

    // Update ref to indicate if filter is active (reactive or chip-based)
    filterActiveRef.current = !!(filteredPhilosopher || filteredStatement || hasChipFilters);
    
    // Get all connections, statements, and philosophers for relationship logic
    const connections = data?.connections || [];
    const statements = data?.statements || [];
    const philosophers = data?.philosophers || [];
    
    // Helper: get related statement IDs
    const getRelatedStatements = (statementId: number) => {
      const related = new Set<number>();
      connections.forEach((conn: ConnectionLink) => {
        if (conn.statementFromId === statementId) {
          related.add(conn.statementToId);
        }
        if (conn.statementToId === statementId) {
          related.add(conn.statementFromId);
        }
      });
      return related;
    };

    // Determine which elements should be highlighted
    let activePhilosophers = new Set<number>();
    let activeStatements = new Set<number>();
    let activeConnections = new Set<string>();

    // Compute chip-based active sets (used by the chip branch below)
    const philoMatchesChips = (p: any): boolean => {
      if (chipYears) {
        const [yMin, yMax] = chipYears;
        const by = p.birthYear ?? -10000;
        const dy = p.deathYear ?? 9999;
        if (dy < yMin || by > yMax) return false;
      }
      if (chipPeriods.length > 0 && !chipPeriods.includes(p.periodId)) return false;
      if (chipSchools.length > 0 && (p.schoolId == null || !chipSchools.includes(p.schoolId))) return false;
      return true;
    };
    const stmtMatchesChips = (s: any): boolean => {
      if (chipCategories.length > 0 && !chipCategories.includes(s.categoryId)) return false;
      return true;
    };

    if (filteredPhilosopher) {
      // Show clicked philosopher + all philosophers connected to its statements
      activePhilosophers.add(filteredPhilosopher);
      const myStatements = new Set<number>();
      svg.selectAll('.statement').each(function(d: any) {
        if (d.philosopherId === filteredPhilosopher) {
          myStatements.add(d.id);
          activeStatements.add(d.id);
        }
      });
      // Include connected statements + their philosophers + the connections
      connections.forEach((conn: ConnectionLink) => {
        if (myStatements.has(conn.statementFromId) || myStatements.has(conn.statementToId)) {
          activeStatements.add(conn.statementFromId);
          activeStatements.add(conn.statementToId);
          activeConnections.add(`${conn.statementFromId}-${conn.statementToId}`);
        }
      });
      svg.selectAll('.statement').each(function(d: any) {
        if (activeStatements.has(d.id)) activePhilosophers.add(d.philosopherId);
      });
    } else if (filteredStatement) {
      // Filter mode: only show this statement, related statements, and their connections
      activeStatements.add(filteredStatement);
      const related = getRelatedStatements(filteredStatement);
      related.forEach(id => activeStatements.add(id));
      
      // Add philosophers of active statements
      svg.selectAll('.statement').each(function(d: any) {
        if (activeStatements.has(d.id)) {
          activePhilosophers.add(d.philosopherId);
        }
      });
      
      // Add only connections that directly involve the selected statement
      connections.forEach((conn: ConnectionLink) => {
        if (conn.statementFromId === filteredStatement || conn.statementToId === filteredStatement) {
          activeConnections.add(`${conn.statementFromId}-${conn.statementToId}`);
        }
      });
    } else if (hasChipFilters) {
      // Chip filters mode: compute matching philosophers/statements and re-flow them
      const matchingPhilos = new Set<number>();
      svg.selectAll('.philosopher-label').each(function(d: any) {
        if (philoMatchesChips(d)) matchingPhilos.add(d.id);
      });
      const matchingStmts = new Set<number>();
      svg.selectAll('.statement').each(function(d: any) {
        if (matchingPhilos.has(d.philosopherId) && stmtMatchesChips(d)) {
          matchingStmts.add(d.id);
        }
      });
      // Drop philosophers without any visible statement
      const philosWithStmts = new Set<number>();
      svg.selectAll('.statement').each(function(d: any) {
        if (matchingStmts.has(d.id)) philosWithStmts.add(d.philosopherId);
      });
      activePhilosophers = philosWithStmts;
      activeStatements  = matchingStmts;
      // Active connections: both endpoints in matchingStmts
      connections.forEach((conn: ConnectionLink) => {
        if (matchingStmts.has(conn.statementFromId) && matchingStmts.has(conn.statementToId)) {
          activeConnections.add(`${conn.statementFromId}-${conn.statementToId}`);
        }
      });
    } else if (hoveredPhilosopher) {
      // Hover mode: fade all except this philosopher + show its connections
      activePhilosophers.add(hoveredPhilosopher);
      const myStatements = new Set<number>();
      svg.selectAll('.statement').each(function(d: any) {
        if (d.philosopherId === hoveredPhilosopher) {
          myStatements.add(d.id);
          activeStatements.add(d.id);
        }
      });
      // Include connected statements + their philosophers + connections
      connections.forEach((conn: ConnectionLink) => {
        if (myStatements.has(conn.statementFromId) || myStatements.has(conn.statementToId)) {
          activeStatements.add(conn.statementFromId);
          activeStatements.add(conn.statementToId);
          activeConnections.add(`${conn.statementFromId}-${conn.statementToId}`);
        }
      });
      svg.selectAll('.statement').each(function(d: any) {
        if (activeStatements.has(d.id)) activePhilosophers.add(d.philosopherId);
      });
    } else if (hoveredStatement) {
      // Hover mode: show this statement and related ones
      activeStatements.add(hoveredStatement);
      const related = getRelatedStatements(hoveredStatement);
      related.forEach(id => activeStatements.add(id));
      
      // Add philosophers of active statements
      svg.selectAll('.statement').each(function(d: any) {
        if (activeStatements.has(d.id)) {
          activePhilosophers.add(d.philosopherId);
        }
      });
      
      // Add connections between active statements
      connections.forEach((conn: ConnectionLink) => {
        if (activeStatements.has(conn.statementFromId) && activeStatements.has(conn.statementToId)) {
          activeConnections.add(`${conn.statementFromId}-${conn.statementToId}`);
        }
      });
    }

    // Capture click-outside flag BEFORE clearing it — used below to suppress initial-zoom restore
    const isClickOutside = wasFilterActive && skipZoomOnClearRef.current && !!preFilterTransformRef.current;

    // Click-outside restore: smooth transition back to pre-filter position
    if (isClickOutside) {
      const restoreT = preFilterTransformRef.current!;
      skipZoomOnClearRef.current = false;
      prevTransformRef.current = restoreT;
      d3.select(svgRef.current).select<SVGGElement>('g.main-group')
        .transition().duration(500).ease(d3.easeCubicInOut)
        .attr('transform', restoreT.toString())
        .on('end', () => { d3.select(svgRef.current).call(zoomRef.current.transform as any, restoreT); });
    }

    // Apply opacity changes
    const hasFilter = filteredPhilosopher || filteredStatement || hasChipFilters;
    const hasHover = hoveredPhilosopher || hoveredStatement;
    const isActive = hasFilter || hasHover;

    if (isActive) {
      // On FILTER by statement (click), reorganize in compact staircase layout
      // Treat chip filters as equivalent to filteredPhilosopher for compaction layout
      if (filteredStatement && !hasChipFilters) {
        // Get active philosophers sorted by birth year
        const activePhilosList: any[] = [];
        svg.selectAll('.philosopher-label').each(function(d: any) {
          if (activePhilosophers.has(d.id)) {
            activePhilosList.push({ node: this, data: d });
          }
        });
        activePhilosList.sort((a, b) => (a.data.birthYear || 0) - (b.data.birthYear || 0));
        
        // Calculate compact diagonal positions (same axis, only active nodes)
        const COMPACT_PHIL_STEP = 52;
        const COMPACT_PHIL_AFTER_GAP = 42;
        const COMPACT_STAT_STEP = 26;
        const COMPACT_ANGLE = 40 * Math.PI / 180;
        const COMPACT_COS = Math.cos(COMPACT_ANGLE);
        const COMPACT_SIN = Math.sin(COMPACT_ANGLE);
        const COMPACT_ORIGIN_X = 100;
        const COMPACT_ORIGIN_Y = 60;

        const newPositions = new Map<number, {x: number, y: number}>();
        let compactDist = 0;

        activePhilosList.forEach((item) => {
          compactDist += COMPACT_PHIL_STEP;
          newPositions.set(item.data.id, {
            x: COMPACT_ORIGIN_X + compactDist * COMPACT_COS,
            y: COMPACT_ORIGIN_Y + compactDist * COMPACT_SIN,
          });

          let firstActiveStmt = true;
          svg.selectAll('.statement').each(function(s: any) {
            if (s.philosopherId === item.data.id && activeStatements.has(s.id)) {
              compactDist += firstActiveStmt ? COMPACT_PHIL_AFTER_GAP : COMPACT_STAT_STEP;
              firstActiveStmt = false;
            }
          });
        });

        // Calculate bounding box from diagonal node positions
        const allCompactPositions = Array.from(newPositions.values());
        if (allCompactPositions.length > 0) {
          const endX = COMPACT_ORIGIN_X + compactDist * COMPACT_COS;
          const endY = COMPACT_ORIGIN_Y + compactDist * COMPACT_SIN;
          const minX = COMPACT_ORIGIN_X - 80;
          const maxX = endX + 200;
          const minY = COMPACT_ORIGIN_Y - 50;
          const maxY = endY + 100;
          
          const width = maxX - minX;
          const height = maxY - minY;
          const svgWidth = containerRef.current?.clientWidth || 1200;
          const svgHeight = containerRef.current?.clientHeight || 800;
          const scale = Math.min(svgWidth / width, svgHeight / height, 1.2);
          
          // Apply zoom transition — sync D3 state silently after animation ends
          const targetTransform = d3.zoomIdentity.translate(40, 40).scale(scale);
          prevTransformRef.current = targetTransform;
          svg.select<SVGGElement>('g.main-group')
            .transition().duration(500).ease(d3.easeCubicInOut)
            .attr('transform', targetTransform.toString())
            .on('end', () => { svg.call(zoomRef.current.transform as any, targetTransform); });
        }

        // Disable hover events during animation
        setHoveredPhilosopher(null);
        setHoveredStatement(null);

        // Pre-compute packed statement positions along diagonal (no gaps from hidden statements)
        const newStatementPositions = new Map<number, {x: number, y: number}>();
        let stmtDist2 = 0;
        activePhilosList.forEach((item) => {
          stmtDist2 += COMPACT_PHIL_STEP;
          const activeStmts: any[] = [];
          svg.selectAll('.statement').each(function(s: any) {
            if (s.philosopherId === item.data.id && activeStatements.has(s.id)) {
              activeStmts.push(s);
            }
          });
          activeStmts.sort((a, b) => (a.y || 0) - (b.y || 0));
          activeStmts.forEach((s, idx) => {
            stmtDist2 += idx === 0 ? COMPACT_PHIL_AFTER_GAP : COMPACT_STAT_STEP;
            newStatementPositions.set(s.id, {
              x: COMPACT_ORIGIN_X + stmtDist2 * COMPACT_COS,
              y: COMPACT_ORIGIN_Y + stmtDist2 * COMPACT_SIN,
            });
          });
        });

        // Move philosophers to compact diagonal positions, hide others
        svg.selectAll('.philosopher-label')
          .style('pointer-events', (d: any) => activePhilosophers.has(d.id) ? 'all' : 'none')
          .transition()
          .duration(500)
          .style('opacity', (d: any) => activePhilosophers.has(d.id) ? 1 : 0)
          .attr('transform', function(d: any) {
            if (activePhilosophers.has(d.id)) {
              const pos = newPositions.get(d.id);
              if (pos) return `translate(${pos.x}, ${pos.y})`;
            }
            return `translate(${d.x}, ${d.y})`;
          });

        // Move statements to packed diagonal positions, hide others
        svg.selectAll('.statement')
          .style('pointer-events', (d: any) => activeStatements.has(d.id) ? 'all' : 'none')
          .transition()
          .duration(500)
          .style('opacity', (d: any) => activeStatements.has(d.id) ? 1 : 0)
          .attr('transform', function(d: any) {
            if (activeStatements.has(d.id)) {
              const pos = newStatementPositions.get(d.id);
              if (pos) return `translate(${pos.x}, ${pos.y})`;
            }
            return `translate(${d.x}, ${d.y})`;
          });
        
        // Negrita en el statement clickeado (reset previo para limpiar selección anterior)
        svg.selectAll('.stmt-text').style('font-weight', null);
        svg.selectAll<SVGGElement, any>('.statement')
          .filter((d: any) => d.id === filteredStatement)
          .select('.stmt-text')
          .style('font-weight', '900');

        // Animate connections: fade out irrelevant, morph active ones to new positions
        const arcPath = (fx: number, fy: number, tx: number, ty: number, isRed: boolean) => {
          const ddx = tx - fx, ddy = ty - fy;
          const r = Math.sqrt(ddx * ddx + ddy * ddy) / 2;
          const sweep = isRed ? (ddx >= 0 ? 0 : 1) : (ddx >= 0 ? 1 : 0);
          return `M ${fx} ${fy} A ${r} ${r} 0 0 ${sweep} ${tx} ${ty}`;
        };

        const filterTs = Date.now();
        filterTimestampRef.current = filterTs;

        // Get current statement screen positions before transition
        const oldStmtPos = new Map<number, {x: number, y: number}>();
        svg.selectAll<SVGGElement, any>('.statement').each(function(d: any) {
          const t = d3.select(this).attr('transform') || '';
          const m = t.match(/translate\(([^,]+),([^)]+)\)/);
          if (m) oldStmtPos.set(d.id, { x: +m[1], y: +m[2] });
        });

        // Hide connections not in activeConnections (don't remove — must survive for next compaction)
        svg.selectAll<SVGPathElement, any>('.connection').each(function() {
          const el = d3.select(this);
          const fromId = +(el.attr('data-from') || 0);
          const toId   = +(el.attr('data-to')   || 0);
          const key = `${fromId}-${toId}`;
          if (!activeConnections.has(key)) {
            el.transition().duration(200).style('opacity', 0).style('pointer-events', 'none');
            return;
          }
          const toStmtPos = newStatementPositions.get(toId);
          const frStmtPos = newStatementPositions.get(fromId);
          if (!toStmtPos || !frStmtPos) {
            el.transition().duration(200).style('opacity', 0).style('pointer-events', 'none');
            return;
          }
          const conn = connections.find((c: any) => c.statementFromId === fromId && c.statementToId === toId);
          const isRed = conn ? ['disagreement','refutation','oppose'].includes(conn.connectionType) : false;
          const endPath = arcPath(frStmtPos.x - 10, frStmtPos.y - 4, toStmtPos.x - 10, toStmtPos.y - 4, isRed);
          const wasHidden = +(el.style('opacity') || '1') < 0.05;
          if (wasHidden) {
            // Re-activating from hidden state: snap to new position, fade in opacity only
            el.interrupt().attr('d', endPath).style('pointer-events', 'all')
              .transition().duration(400).style('opacity', 1);
          } else {
            const oldFrom = oldStmtPos.get(fromId);
            const oldTo   = oldStmtPos.get(toId);
            const startPath = oldFrom && oldTo
              ? arcPath(oldFrom.x - 10, oldFrom.y - 4, oldTo.x - 10, oldTo.y - 4, isRed)
              : el.attr('d');
            el.style('pointer-events', 'all')
              .attr('d', startPath)
              .transition().duration(500).ease(d3.easeCubicInOut)
              .style('opacity', 1)
              .attrTween('d', () => d3.interpolateString(startPath, endPath));
          }
        });
        
      } else if (filteredPhilosopher || hasChipFilters) {
        // Compact staircase: clicked philosopher (all statements) + connected philosophers (only related statements)
        // OR: chip-filter mode (activePhilosophers/activeStatements from chip branch above)
        setHoveredPhilosopher(null);
        setHoveredStatement(null);

        const activePhilosList: any[] = [];
        svg.selectAll('.philosopher-label').each(function(d: any) {
          if (activePhilosophers.has(d.id)) {
            activePhilosList.push({ node: this, data: d });
          }
        });
        activePhilosList.sort((a, b) => (a.data.birthYear || 0) - (b.data.birthYear || 0));

        const COMPACT_PHIL_STEP2 = 52;
        const COMPACT_PHIL_AFTER_GAP2 = 42;
        const COMPACT_STAT_STEP2 = 26;
        const COMPACT_ANGLE2 = 40 * Math.PI / 180;
        const COMPACT_COS2 = Math.cos(COMPACT_ANGLE2);
        const COMPACT_SIN2 = Math.sin(COMPACT_ANGLE2);
        const COMPACT_ORIGIN_X2 = 100;
        const COMPACT_ORIGIN_Y2 = 60;

        const newPositions = new Map<number, {x: number, y: number}>();
        let compactDist2 = 0;

        activePhilosList.forEach((item) => {
          compactDist2 += COMPACT_PHIL_STEP2;
          newPositions.set(item.data.id, {
            x: COMPACT_ORIGIN_X2 + compactDist2 * COMPACT_COS2,
            y: COMPACT_ORIGIN_Y2 + compactDist2 * COMPACT_SIN2,
          });

          let firstActiveStmt2 = true;
          svg.selectAll('.statement').each(function(s: any) {
            if (s.philosopherId === item.data.id && activeStatements.has(s.id)) {
              compactDist2 += firstActiveStmt2 ? COMPACT_PHIL_AFTER_GAP2 : COMPACT_STAT_STEP2;
              firstActiveStmt2 = false;
            }
          });
        });

        // Auto-zoom to fit compacted diagonal
        if (newPositions.size > 0) {
          const endX2 = COMPACT_ORIGIN_X2 + compactDist2 * COMPACT_COS2;
          const endY2 = COMPACT_ORIGIN_Y2 + compactDist2 * COMPACT_SIN2;
          const minX = COMPACT_ORIGIN_X2 - 80;
          const maxX = endX2 + 200;
          const minY = COMPACT_ORIGIN_Y2 - 50;
          const maxY = endY2 + 100;
          const width = maxX - minX;
          const height = maxY - minY;
          const svgWidth = containerRef.current?.clientWidth || 1200;
          const svgHeight = containerRef.current?.clientHeight || 800;
          const scale = Math.min(svgWidth / width, svgHeight / height, 1.2);
          const targetTransform2 = d3.zoomIdentity.translate(40, 40).scale(scale);
          prevTransformRef.current = targetTransform2;
          svg.select<SVGGElement>('g.main-group')
            .transition().duration(500).ease(d3.easeCubicInOut)
            .attr('transform', targetTransform2.toString())
            .on('end', () => { svg.call(zoomRef.current.transform as any, targetTransform2); });
        }

        // Pre-compute packed statement positions along diagonal (no gaps)
        const newStatementPositions = new Map<number, {x: number, y: number}>();
        let stmtDist3 = 0;
        activePhilosList.forEach((item) => {
          stmtDist3 += COMPACT_PHIL_STEP2;
          const activeStmts: any[] = [];
          svg.selectAll('.statement').each(function(s: any) {
            if (s.philosopherId === item.data.id && activeStatements.has(s.id)) {
              activeStmts.push(s);
            }
          });
          activeStmts.sort((a, b) => (a.y || 0) - (b.y || 0));
          activeStmts.forEach((s, idx) => {
            stmtDist3 += idx === 0 ? COMPACT_PHIL_AFTER_GAP2 : COMPACT_STAT_STEP2;
            newStatementPositions.set(s.id, {
              x: COMPACT_ORIGIN_X2 + stmtDist3 * COMPACT_COS2,
              y: COMPACT_ORIGIN_Y2 + stmtDist3 * COMPACT_SIN2,
            });
          });
        });

        // Move philosophers to compact positions, hide others
        svg.selectAll('.philosopher-label')
          .style('pointer-events', (d: any) => activePhilosophers.has(d.id) ? 'all' : 'none')
          .transition().duration(500)
          .style('opacity', (d: any) => activePhilosophers.has(d.id) ? 1 : 0)
          .attr('transform', function(d: any) {
            if (activePhilosophers.has(d.id)) {
              const pos = newPositions.get(d.id);
              if (pos) return `translate(${pos.x}, ${pos.y})`;
            }
            return `translate(${d.x}, ${d.y})`;
          });

        // Move statements to packed positions, hide others
        svg.selectAll('.statement')
          .style('pointer-events', (d: any) => activeStatements.has(d.id) ? 'all' : 'none')
          .transition().duration(500)
          .style('opacity', (d: any) => activeStatements.has(d.id) ? 1 : 0)
          .attr('transform', function(d: any) {
            if (activeStatements.has(d.id)) {
              const pos = newStatementPositions.get(d.id);
              if (pos) return `translate(${pos.x}, ${pos.y})`;
            }
            return `translate(${d.x}, ${d.y})`;
          });

        // Negrita + tamaño en el filósofo clickeado, recalculando posición de fechas
        svg.selectAll('.philo-name').style('font-weight', '700').style('font-size', '15px');
        svg.selectAll<SVGGElement, any>('.philosopher-label').each(function(d: any) {
          const group = d3.select(this);
          const isActive = d.id === filteredPhilosopher;
          group.select('.philo-name')
            .style('font-weight', isActive ? '900' : '700')
            .style('font-size', isActive ? '17px' : '15px');
          // Recalcular posición de fechas con el ancho real del nombre
          const nameEl = group.select<SVGTextElement>('.philo-name').node();
          const yearsEl = group.select<SVGTextElement>('.philo-years').node();
          if (nameEl && yearsEl) {
            try { yearsEl.setAttribute('x', String(nameEl.getBBox().width + 10)); } catch { /* skip */ }
          }
        });

        // Animate connections in sync with node movement
        const arcPath2 = (fx: number, fy: number, tx: number, ty: number, isRed: boolean) => {
          const ddx = tx - fx, ddy = ty - fy;
          const r = Math.sqrt(ddx * ddx + ddy * ddy) / 2;
          const sweep = isRed ? (ddx >= 0 ? 0 : 1) : (ddx >= 0 ? 1 : 0);
          return `M ${fx} ${fy} A ${r} ${r} 0 0 ${sweep} ${tx} ${ty}`;
        };

        // Snapshot current statement positions before transition
        const oldStmtPos2 = new Map<number, {x: number, y: number}>();
        svg.selectAll<SVGGElement, any>('.statement').each(function(d: any) {
          const t = d3.select(this).attr('transform') || '';
          const m = t.match(/translate\(([^,]+),([^)]+)\)/);
          if (m) oldStmtPos2.set(d.id, { x: +m[1], y: +m[2] });
        });

        svg.selectAll<SVGPathElement, any>('.connection').each(function() {
          const el = d3.select(this);
          const fromId = +(el.attr('data-from') || 0);
          const toId   = +(el.attr('data-to')   || 0);
          const key = `${fromId}-${toId}`;
          if (!activeConnections.has(key)) {
            el.transition().duration(200).style('opacity', 0).style('pointer-events', 'none');
            return;
          }
          const frStmtPos = newStatementPositions.get(fromId);
          const toStmtPos = newStatementPositions.get(toId);
          if (!frStmtPos || !toStmtPos) {
            el.transition().duration(200).style('opacity', 0).style('pointer-events', 'none');
            return;
          }
          const conn = connections.find((c: any) => c.statementFromId === fromId && c.statementToId === toId);
          const isRed = conn ? ['disagreement','refutation','oppose'].includes(conn.connectionType) : false;
          const endPath = arcPath2(frStmtPos.x - 10, frStmtPos.y - 4, toStmtPos.x - 10, toStmtPos.y - 4, isRed);
          const wasHidden = +(el.style('opacity') || '1') < 0.05;
          if (wasHidden) {
            el.interrupt().attr('d', endPath).style('pointer-events', 'all')
              .transition().duration(400).style('opacity', 1);
          } else {
            const oldFrom = oldStmtPos2.get(fromId);
            const oldTo   = oldStmtPos2.get(toId);
            const startPath = oldFrom && oldTo
              ? arcPath2(oldFrom.x - 10, oldFrom.y - 4, oldTo.x - 10, oldTo.y - 4, isRed)
              : el.attr('d');
            el.style('pointer-events', 'all')
              .attr('d', startPath)
              .transition().duration(500).ease(d3.easeCubicInOut)
              .style('opacity', 1)
              .attrTween('d', () => d3.interpolateString(startPath, endPath));
          }
        });

      } else if (hasHover && !hasFilter) {
        // HOVER mode: just fade, don't move (only when NOT filtered)
        svg.selectAll('.philosopher-label')
          .transition()
          .duration(400)
          .style('opacity', (d: any) => activePhilosophers.has(d.id) ? 1 : 0.15);

        svg.selectAll('.statement')
          .transition()
          .duration(300)
          .style('opacity', (d: any) => activeStatements.has(d.id) ? 1 : 0);
        
        // Fade connections in hover mode using data-* attributes (survive redraw)
        svg.selectAll('.connection')
          .transition()
          .duration(300)
          .style('opacity', function() {
            const el = d3.select(this);
            const fromId = +(el.attr('data-from') || 0);
            const toId   = +(el.attr('data-to')   || 0);
            if (!fromId || !toId) return 0.2;

            if (activeConnections.size > 0) {
              const key = `${fromId}-${toId}`;
              return activeConnections.has(key) ? 1 : 0.2;
            }
            if (activeStatements.size > 0) {
              return activeStatements.has(fromId) && activeStatements.has(toId) ? 1 : 0.2;
            }
            return 1;
          });
      }
    } else {
      // Reset all to normal
      setHoveredPhilosopher(null);
      setHoveredStatement(null);

      // Restore zoom to initial on explicit filter clear (not click-outside — handled above)
      if (initialZoomRef.current && wasFilterActive && !isClickOutside) {
        svg.transition()
          .duration(400)
          .call(zoomRef.current.transform, initialZoomRef.current);
      }
      skipZoomOnClearRef.current = false;

      svg.selectAll<SVGGElement, any>('.philosopher-label').each(function() {
        const group = d3.select(this);
        group.select('.philo-name').style('font-weight', '700').style('font-size', '15px');
        const nameEl = group.select<SVGTextElement>('.philo-name').node();
        const yearsEl = group.select<SVGTextElement>('.philo-years').node();
        if (nameEl && yearsEl) {
          try { yearsEl.setAttribute('x', String(nameEl.getBBox().width + 10)); } catch { /* skip */ }
        }
      });
      svg.selectAll('.stmt-text').style('font-weight', null);

      svg.selectAll('.philosopher-label')
        .style('pointer-events', 'all')
        .transition()
        .duration(400)
        .style('opacity', 1)
        .attr('transform', (d: any) => `translate(${d.x}, ${d.y})`);

      svg.selectAll('.statement')
        .style('pointer-events', 'all')
        .transition()
        .duration(300)
        .style('opacity', 1)
        .attr('transform', (d: any) => `translate(${d.x}, ${d.y})`);

      // Check if we need to redraw connections (if they were removed during filter)
      const currentConnectionCount = svg.selectAll('.connection').size();
      
      if (currentConnectionCount === 0 || currentConnectionCount < connections.length) {
        // Remove all connections
        svg.selectAll('.connection').remove();
        
        // Redraw original connections after reset animation
        setTimeout(() => {
          const connG = svg.select('g').insert('g', ':first-child').attr('class', 'connections');
          
          
          connections.forEach((conn: any) => {
            // Find original statement positions
            let fromX = 0, fromY = 0, toX = 0, toY = 0;
            
            svg.selectAll('.statement').each(function(s: any) {
              if (s.id === conn.statementFromId) {
                fromX = s.x - 10;
                fromY = s.y - 4;
              }
              if (s.id === conn.statementToId) {
                toX = s.x - 10;
                toY = s.y - 4;
              }
            });
            
            const isRed2 = ['disagreement','refutation','oppose'].includes(conn.connectionType as string);
            const ddx2 = toX - fromX, ddy2 = toY - fromY;
            const r2 = Math.sqrt(ddx2 * ddx2 + ddy2 * ddy2) / 2;
            const aboveSweep2 = ddx2 >= 0 ? 1 : 0;
            const sweep2 = isRed2 ? 1 - aboveSweep2 : aboveSweep2;
            connG.append('path')
              .attr('class', 'connection')
              .attr('data-from', conn.statementFromId)
              .attr('data-to', conn.statementToId)
              .attr('d', `M ${fromX} ${fromY} A ${r2} ${r2} 0 0 ${sweep2} ${toX} ${toY}`)
              .attr('fill', 'none')
              .attr('stroke', colorFor(conn.connectionType))
              .attr('stroke-width', 2)
              .style('opacity', 0)
              .transition()
              .duration(250)
              .style('opacity', 1);
          });
        }, 350);
      } else {
        // Restore opacity AND re-animate path back to original coords
        // (compact mode morphed d to compact positions; we need to put them back)
        const stmtPos = new Map<number, {x: number, y: number}>();
        svg.selectAll('.statement').each(function(s: any) {
          stmtPos.set(s.id, { x: s.x, y: s.y });
        });
        svg.selectAll<SVGPathElement, any>('.connection').each(function() {
          const el = d3.select(this);
          const fromId = +(el.attr('data-from') || 0);
          const toId   = +(el.attr('data-to')   || 0);
          const from = stmtPos.get(fromId);
          const to   = stmtPos.get(toId);
          if (!from || !to) return;
          const conn = connections.find((c: any) => c.statementFromId === fromId && c.statementToId === toId);
          const isRed = conn ? ['disagreement','refutation','oppose'].includes(conn.connectionType) : false;
          const fx = from.x - 10, fy = from.y - 4;
          const tx = to.x - 10,   ty = to.y - 4;
          const ddx = tx - fx, ddy = ty - fy;
          const r = Math.sqrt(ddx * ddx + ddy * ddy) / 2;
          const sweep = isRed ? (ddx >= 0 ? 0 : 1) : (ddx >= 0 ? 1 : 0);
          const endPath = `M ${fx} ${fy} A ${r} ${r} 0 0 ${sweep} ${tx} ${ty}`;
          const startPath = el.attr('d');
          el.style('pointer-events', 'all')
            .transition().duration(400).ease(d3.easeCubicInOut)
            .style('opacity', 1)
            .attrTween('d', () => d3.interpolateString(startPath || endPath, endPath));
        });
      }
    }

  }, [hoveredPhilosopher, hoveredStatement, filteredPhilosopher, filteredStatement, data, chipSignature]);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Cargando datos del timeline...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8">
        <Alert variant="destructive">
          <Info className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!data || (data.philosophers || []).length === 0) {
    return (
      <div className="container py-8">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            No hay datos disponibles para mostrar en el timeline.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div className="relative flex-1 flex flex-col min-h-0">
        {/* Zoom controls */}
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <Button
            size="icon"
            variant="secondary"
            onClick={() => window.dispatchEvent(new CustomEvent('open-philosopher-index'))}
            title="Buscar filósofo (Cmd/Ctrl+K)"
            className={`h-9 w-9 transition-opacity duration-500 ${meditationMode ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
          >
            <Search className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            onClick={handleResetZoom}
            title="Restablecer Vista"
            className={`h-9 w-9 transition-opacity duration-500 ${meditationMode ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            onClick={handleExportPng}
            title="Exportar como PNG"
            className={`h-9 w-9 transition-opacity duration-500 ${meditationMode ? 'opacity-0 pointer-events-none' : (filteredPhilosopher || filteredStatement || hasChipFilters ? 'opacity-100' : 'opacity-30 pointer-events-none')}`}
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            onClick={copyShareLink}
            title="Compartir vista actual"
            className={`h-9 w-9 transition-opacity duration-500 ${meditationMode ? 'opacity-0 pointer-events-none' : (filteredPhilosopher || filteredStatement || hasChipFilters ? 'opacity-100' : 'opacity-30 pointer-events-none')}`}
          >
            <Share2 className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            onClick={() => setMeditationMode(m => !m)}
            title={meditationMode ? 'Salir del modo Meditación' : 'Modo Meditación'}
            className={`h-9 w-9 transition-opacity ${meditationMode ? 'opacity-30 hover:opacity-100' : 'opacity-100'}`}
          >
            {meditationMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>

        {/* Legend and info */}
        <div className={`absolute bottom-4 left-4 z-10 bg-white/95 backdrop-blur px-4 py-3 rounded-lg shadow-md border border-gray-200 transition-opacity duration-500 ${meditationMode ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-2 flex-1">
              <div className="font-bold text-sm text-gray-900">HISTORIA DE LA FILOSOFÍA</div>
              {!legendCollapsed && (
                <>
                  <div className="text-xs text-gray-600">resumida y visualizada</div>

                  <div className="text-[11px] text-gray-500">
                    {data.philosophers?.length || 0} filósofos · {(data?.statements || []).length || 0} proposiciones · {(data?.connections || []).length || 0} conexiones
                  </div>

                  {/* Color legend */}
                  <div className="pt-2 space-y-1.5 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-6 h-0.5 bg-red-300 rounded"></div>
                      <span className="text-gray-600">desacuerdo, contraste, refutación</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-6 h-0.5 bg-green-300 rounded"></div>
                      <span className="text-gray-600">acuerdo, similaridad, expansión</span>
                    </div>
                  </div>

                  {/* Instructions and date */}
                  <div className="pt-2 text-xs text-gray-500 border-t border-gray-100 space-y-1">
                    <div className="flex items-center gap-2">
                      <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
                      </svg>
                      <span>arrastra para mover</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle cx="11" cy="11" r="8" strokeWidth={2}/>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35"/>
                      </svg>
                      <span>scroll para zoom, mejor en Chrome desktop</span>
                    </div>
                    <div className="text-[10px] text-gray-400 pt-1">
                      {appVersion ? `v${appVersion}` : ''} · {new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </div>
                  </div>
                </>
              )}
            </div>
            <button
              onClick={() => setLegendCollapsed(c => !c)}
              className="text-gray-400 hover:text-gray-600 transition-colors mt-0.5 flex-shrink-0"
            >
              <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${legendCollapsed ? '-rotate-90' : ''}`} />
            </button>
          </div>
        </div>

        <div ref={containerRef} className="w-full flex-1 bg-white overflow-hidden border-t">
          <svg ref={svgRef} style={{ width: '100%', height: '100%' }} />
        </div>

        {tooltip && (
          <div className="fixed z-50 p-3 bg-white border rounded shadow pointer-events-none" style={{ left: tooltip.x + 8, top: tooltip.y + 8 }}>
            <div className="text-sm">{tooltip.content}</div>
          </div>
        )}

        {refTooltip && (
          <div
            className={`fixed z-50 p-3 bg-white border border-gray-300 rounded shadow-lg max-w-xs ${refTooltip.url ? 'cursor-pointer hover:border-blue-400' : ''}`}
            style={{
              left: refTooltip.x,
              top: refTooltip.y - 12,
              transform: 'translate(-50%, -100%)',
            }}
            onMouseEnter={cancelRefTooltipClose}
            onMouseLeave={scheduleRefTooltipClose}
            onClick={() => {
              if (refTooltip.url) {
                window.open(refTooltip.url, '_blank', 'noopener,noreferrer');
                setRefTooltip(null);
              }
            }}
          >
            <div className="text-xs font-semibold text-gray-900">{refTooltip.title}</div>
            <div className="text-xs text-gray-700 mt-0.5">{refTooltip.author}</div>
            {refTooltip.pageSpecific && (
              <div className="text-xs text-gray-500 mt-0.5 font-mono">{refTooltip.pageSpecific}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
