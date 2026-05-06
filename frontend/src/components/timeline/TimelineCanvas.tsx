'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { APP_VERSION } from '@/version';
import * as d3 from 'd3';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Info, ZoomIn, ZoomOut, Maximize2, ChevronDown } from 'lucide-react';
import type { TimelineData, StatementNode, ConnectionLink, PhilosopherNode } from '@/types/timeline';

export function TimelineCanvas() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const zoomRef = useRef<any>(null);
  const filterActiveRef = useRef<boolean>(false);
  const initialZoomRef = useRef<any>(null);
  const filterTimestampRef = useRef<number>(0);
  const [data, setData] = useState<TimelineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string } | null>(null);
  const [highlightId, setHighlightId] = useState<number | null>(null);
  const [hoveredPhilosopher, setHoveredPhilosopher] = useState<number | null>(null);
  const [hoveredStatement, setHoveredStatement] = useState<number | null>(null);
  const [filteredPhilosopher, setFilteredPhilosopher] = useState<number | null>(null);
  const [filteredStatement, setFilteredStatement] = useState<number | null>(null);
  const [legendCollapsed, setLegendCollapsed] = useState(false);

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
    if (!data || !svgRef.current || !containerRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    svg.attr('width', width)
       .attr('height', height)
       .style('overflow', 'visible')
       .style('user-select', 'none')
       .style('-webkit-user-select', 'none')
       .style('-moz-user-select', 'none')
       .style('-ms-user-select', 'none');

    // Create main group for zoom/pan transformations
    const g = svg.append('g').attr('class', 'main-group');

    // Setup zoom behavior: scroll to zoom, drag to pan
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4]) // Allow zoom from 10% to 400%
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
        // Track last zoom time to prevent click events during/after zoom
        (svg.node() as any).__lastZoomTime = Date.now();
      });

    // Store zoom reference for programmatic control
    zoomRef.current = zoom;

    // Apply zoom behavior to SVG
    svg.call(zoom);

    // Click on background to clear filters
    svg.on('click', (event) => {
      // Only clear if clicked directly on SVG (not on children)
      if (event.target === event.currentTarget) {
        setFilteredPhilosopher(null);
        setFilteredStatement(null);
      }
    });

    // Set initial zoom to show content nicely
    const initialTransform = d3.zoomIdentity.translate(50, 50).scale(0.8);
    initialZoomRef.current = initialTransform;
    svg.call(zoom.transform as any, initialTransform);

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
    const PHIL_STEP      = 80;  // gap before each philosopher node
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

    const axisTotalDist = dist;

// ===== DRAW CONNECTIONS FIRST (bottom layer) =====
    const connG = g.append('g').attr('class', 'connections');
    const conns: ConnectionLink[] = data.connections || [];
    console.log('Drawing connections:', conns.length, conns);

    const colorFor = (type: string) => {
      switch (type) {
        case 'agreement':
        case 'expansion':
        case 'inspiration':
        case 'influence':
        case 'resonate':
          return '#a7f3d0'; // green
        case 'disagreement':
        case 'refutation':
        case 'oppose':
          return '#fecaca'; // red
        default:
          return '#d1d5db'; // gray
      }
    };

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
      .attr('opacity', 1); // Solid color, no transparency

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

    // Years on same line, positioned after each name using actual text width
    philoItems.each(function(d: any) {
      const group = d3.select(this);
      const nameText = group.select('.philo-name').node() as SVGTextElement;
      const nameWidth = nameText?.getBBox().width || (d.name.length * 10);
      
      group.append('text')
        .attr('x', nameWidth + 10) // 10px spacing after name
        .attr('y', 5)
        .text(() => {
          const birth = d.birthYear < 0 ? `${Math.abs(d.birthYear)} BCE` : `${d.birthYear}`;
          const death = d.deathYear < 0 ? `${Math.abs(d.deathYear)} BCE` : `${d.deathYear}`;
          return `${birth} – ${death}`;
        })
        .style('font-size', '11px')
        .style('fill', '#888');
    });

    // statements
    const statementsG = g.append('g').attr('class', 'statements');
    const stmtNodes = statementsG.selectAll('.statement').data(statements, (d: any) => d.id).enter().append('g')
      .attr('class', 'statement')
      .attr('transform', (d: any) => `translate(${d.x}, ${d.y})`)
      .style('cursor', 'pointer')
      .on('mouseenter', (event, d: any) => {
        if (!filterActiveRef.current) {
          setHoveredStatement(d.id);
        }
      })
      .on('mouseleave', () => {
        if (!filterActiveRef.current) {
          setHoveredStatement(null);
        }
      })
      .on('click', (event, d: any) => {
        event.stopPropagation();
        setFilteredStatement(prev => prev === d.id ? null : d.id);
        setFilteredPhilosopher(null);
      });

    // Statement text (longer, single line)
    stmtNodes.append('text').attr('x', 0).attr('y', 0).text((d: any) => truncate(d.text, 200))
      .style('font-size', '11px').style('fill', '#222');

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
          .attr('fill', '#d1d5db').attr('opacity', 1);
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
            .attr('fill', '#a7f3d0').attr('opacity', 1);
        } else if (negativeCount > 0 && positiveCount === 0) {
          // Only negative - red dot
          d3.select(this).append('circle')
            .attr('cx', -10).attr('cy', -4).attr('r', 3)
            .attr('fill', '#fecaca').attr('opacity', 1);
        } else if (positiveCount > 0 && negativeCount > 0) {
          // Both - split half green, half red using a gradient or two half-circles
          const g = d3.select(this);
          
          // Left half - green
          g.append('path')
            .attr('d', 'M -10 -7 A 3 3 0 0 1 -10 -1 Z')
            .attr('fill', '#a7f3d0').attr('opacity', 1);

          // Right half - red
          g.append('path')
            .attr('d', 'M -10 -7 A 3 3 0 0 0 -10 -1 Z')
            .attr('fill', '#fecaca').attr('opacity', 1);
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
  }, [data, highlightId]);

  // Zoom control functions
  const handleZoomIn = useCallback(() => {
    if (svgRef.current && zoomRef.current) {
      const svg = d3.select(svgRef.current);
      svg.transition().duration(300).call(zoomRef.current.scaleBy, 1.3);
    }
  }, []);

  const handleZoomOut = useCallback(() => {
    if (svgRef.current && zoomRef.current) {
      const svg = d3.select(svgRef.current);
      svg.transition().duration(300).call(zoomRef.current.scaleBy, 0.7);
    }
  }, []);

  const handleResetZoom = useCallback(() => {
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
      (svgH - padding * 2) / bbox.height,
      1
    );
    const tx = svgW / 2 - (bbox.x + bbox.width / 2) * scale;
    const ty = svgH / 2 - (bbox.y + bbox.height / 2) * scale;
    svg.transition().duration(600).call(
      zoomRef.current.transform,
      d3.zoomIdentity.translate(tx, ty).scale(scale)
    );
  }, []);

  // Effect to handle hover and filter opacity changes
  useEffect(() => {
    if (!svgRef.current || !data) return;

    const svg = d3.select(svgRef.current);
    
    // Save previous filter state before updating
    const wasFilterActive = filterActiveRef.current;
    
    // Update ref to indicate if filter is active
    filterActiveRef.current = !!(filteredPhilosopher || filteredStatement);
    
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
      
      // Add connections between active statements
      connections.forEach((conn: ConnectionLink) => {
        if (activeStatements.has(conn.statementFromId) && activeStatements.has(conn.statementToId)) {
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

    // Apply opacity changes
    const hasFilter = filteredPhilosopher || filteredStatement;
    const hasHover = hoveredPhilosopher || hoveredStatement;
    const isActive = hasFilter || hasHover;
    
    // Only restore zoom if we're clearing a FILTER, not just hover
    const shouldRestoreZoom = !hasFilter && !hasHover;
    
    if (isActive) {
      // On FILTER by statement (click), reorganize in compact staircase layout
      if (filteredStatement) {
        // Get active philosophers sorted by birth year
        const activePhilosList: any[] = [];
        svg.selectAll('.philosopher-label').each(function(d: any) {
          if (activePhilosophers.has(d.id)) {
            activePhilosList.push({ node: this, data: d });
          }
        });
        activePhilosList.sort((a, b) => (a.data.birthYear || 0) - (b.data.birthYear || 0));
        
        // Calculate compact diagonal positions (same axis, only active nodes)
        const COMPACT_PHIL_STEP = 80;
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
          const centerX = minX + width / 2;
          const centerY = minY + height / 2;
          
          // Calculate scale to fit content (with some padding)
          const svgWidth = containerRef.current?.clientWidth || 1200;
          const svgHeight = containerRef.current?.clientHeight || 800;
          const scaleX = svgWidth / width;
          const scaleY = svgHeight / height;
          const scale = Math.min(scaleX, scaleY, 1.2); // Max zoom 1.2x
          
          // Calculate translation to center the content
          const translateX = svgWidth / 2 - centerX * scale;
          const translateY = svgHeight / 2 - centerY * scale;
          
          // Apply zoom transition
          svg.transition()
            .duration(500)
            .call(
              zoomRef.current.transform,
              d3.zoomIdentity.translate(translateX, translateY).scale(scale)
            );
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
        
        // Hide original connections temporarily
        svg.selectAll('.connection')
          .transition()
          .duration(250)
          .style('opacity', 0);

        const filterTs = Date.now();
        filterTimestampRef.current = filterTs;

        // Redraw connections with new positions after movement
        setTimeout(() => {
          if (filterTimestampRef.current !== filterTs) return;
          svg.selectAll('.connection').remove();

          const connG = svg.select('g').insert('g', ':first-child').attr('class', 'connections');
          
          connections.forEach((conn: any) => {
            const key = `${conn.statementFromId}-${conn.statementToId}`;
            if (!activeConnections.has(key) && activeConnections.size > 0) return;
            
            if (activeStatements.size > 0) {
              const isActive = activeStatements.has(conn.statementFromId) && 
                             activeStatements.has(conn.statementToId);
              if (!isActive) return;
            }
            
            // Find statement positions after transformation
            let fromPos: {x: number, y: number} | null = null;
            let toPos: {x: number, y: number} | null = null;
            
            const fromStmtPos = newStatementPositions.get(conn.statementFromId);
            const toStmtPos = newStatementPositions.get(conn.statementToId);
            if (!fromStmtPos || !toStmtPos) return;

            fromPos = { x: fromStmtPos.x - 10, y: fromStmtPos.y - 4 };
            toPos   = { x: toStmtPos.x - 10,   y: toStmtPos.y - 4 };

            if (fromPos !== null && toPos !== null) {
              const from: {x: number, y: number} = fromPos;
              const to: {x: number, y: number} = toPos;
              const isRed1 = ['disagreement','refutation','oppose'].includes(conn.connectionType as string);
              const colorFor = (type: string) => {
                if (['agreement','expansion','inspiration','influence','resonate'].includes(type)) return '#a7f3d0';
                if (['disagreement','refutation','oppose'].includes(type)) return '#fecaca';
                return '#d1d5db';
              };
              const ddx1 = to.x - from.x, ddy1 = to.y - from.y;
              const r1 = Math.sqrt(ddx1 * ddx1 + ddy1 * ddy1) / 2;
              const aboveSweep1 = ddx1 >= 0 ? 1 : 0;
              const sweep1 = isRed1 ? 1 - aboveSweep1 : aboveSweep1;
              connG.append('path')
                .attr('class', 'connection')
                .attr('data-from', conn.statementFromId)
                .attr('data-to', conn.statementToId)
                .attr('d', `M ${from.x} ${from.y} A ${r1} ${r1} 0 0 ${sweep1} ${to.x} ${to.y}`)
                .attr('fill', 'none')
                .attr('stroke', colorFor(conn.connectionType))
                .attr('stroke-width', 2)
                .style('opacity', 0)
                .transition().duration(250).style('opacity', 1);
            }
          });
        }, 550);
        
      } else if (filteredPhilosopher) {
        // Compact staircase: clicked philosopher (all statements) + connected philosophers (only related statements)
        setHoveredPhilosopher(null);
        setHoveredStatement(null);

        const activePhilosList: any[] = [];
        svg.selectAll('.philosopher-label').each(function(d: any) {
          if (activePhilosophers.has(d.id)) {
            activePhilosList.push({ node: this, data: d });
          }
        });
        activePhilosList.sort((a, b) => (a.data.birthYear || 0) - (b.data.birthYear || 0));

        const COMPACT_PHIL_STEP2 = 80;
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
          const centerX = minX + width / 2;
          const centerY = minY + height / 2;
          const svgWidth = containerRef.current?.clientWidth || 1200;
          const svgHeight = containerRef.current?.clientHeight || 800;
          const scale = Math.min(svgWidth / width, svgHeight / height, 1.2);
          const translateX = svgWidth / 2 - centerX * scale;
          const translateY = svgHeight / 2 - centerY * scale;
          svg.transition().duration(500).call(
            zoomRef.current.transform,
            d3.zoomIdentity.translate(translateX, translateY).scale(scale)
          );
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
          .transition().duration(500)
          .style('opacity', (d: any) => activeStatements.has(d.id) ? 1 : 0)
          .attr('transform', function(d: any) {
            if (activeStatements.has(d.id)) {
              const pos = newStatementPositions.get(d.id);
              if (pos) return `translate(${pos.x}, ${pos.y})`;
            }
            return `translate(${d.x}, ${d.y})`;
          });

        // Hide connections, redraw after movement with packed positions
        svg.selectAll('.connection').transition().duration(250).style('opacity', 0);

        const filterTs2 = Date.now();
        filterTimestampRef.current = filterTs2;

        setTimeout(() => {
          if (filterTimestampRef.current !== filterTs2) return;
          svg.selectAll('.connection').remove();
          const connG = svg.select('g').insert('g', ':first-child').attr('class', 'connections');

          const colorFor = (type: string) => {
            if (['agreement','expansion','inspiration','influence','resonate'].includes(type)) return '#a7f3d0';
            if (['disagreement','refutation','oppose'].includes(type)) return '#fecaca';
            return '#d1d5db';
          };

          connections.forEach((conn: any) => {
            if (!activeConnections.has(`${conn.statementFromId}-${conn.statementToId}`)) return;
            const fromStmtPos = newStatementPositions.get(conn.statementFromId);
            const toStmtPos = newStatementPositions.get(conn.statementToId);
            if (!fromStmtPos || !toStmtPos) return;

            const from = { x: fromStmtPos.x - 10, y: fromStmtPos.y - 4 };
            const to   = { x: toStmtPos.x - 10,   y: toStmtPos.y - 4 };
            const isRed = ['disagreement','refutation','oppose'].includes(conn.connectionType);
            const ddx = to.x - from.x, ddy = to.y - from.y;
            const r = Math.sqrt(ddx * ddx + ddy * ddy) / 2;
            const aboveSweep = ddx >= 0 ? 1 : 0;
            const sweep = isRed ? 1 - aboveSweep : aboveSweep;
            connG.append('path')
              .attr('class', 'connection')
              .attr('data-from', conn.statementFromId)
              .attr('data-to', conn.statementToId)
              .attr('d', `M ${from.x} ${from.y} A ${r} ${r} 0 0 ${sweep} ${to.x} ${to.y}`)
              .attr('fill', 'none')
              .attr('stroke', colorFor(conn.connectionType))
              .attr('stroke-width', 2)
              .style('opacity', 0)
              .transition().duration(250).style('opacity', 1);
          });
        }, 550);

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
      // Disable hover events during animation
      setHoveredPhilosopher(null);
      setHoveredStatement(null);
      
      // Only restore zoom if we had a filter before (not just hover)
      if (initialZoomRef.current && wasFilterActive) {
        svg.transition()
          .duration(400)
          .call(
            zoomRef.current.transform,
            initialZoomRef.current
          );
      }
      
      svg.selectAll('.philosopher-label')
        .transition()
        .duration(400)
        .style('opacity', 1)
        .attr('transform', (d: any) => `translate(${d.x}, ${d.y})`)
        .on('end', function() {
        });

      svg.selectAll('.statement')
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
          
          const colorFor = (type: string) => {
            if (type === 'agreement' || type === 'expansion' || type === 'inspiration' || type === 'influence' || type === 'resonate') return '#a7f3d0';
            if (type === 'disagreement' || type === 'refutation' || type === 'oppose') return '#fecaca';
            return '#d1d5db';
          };
          
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
        // Just restore opacity of existing connections
        svg.selectAll('.connection')
          .transition()
          .duration(300)
          .style('opacity', 1);
      }
    }

  }, [hoveredPhilosopher, hoveredStatement, filteredPhilosopher, filteredStatement, data]);

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
        {/* Info badge */}
        <div className="absolute top-4 left-4 z-10 bg-white/80 backdrop-blur px-3 py-1 rounded shadow-sm">
          <div className="text-xs text-gray-600 font-medium">
            {data.philosophers?.length || 0} filósofos · {(data?.statements || []).length || 0} declaraciones
          </div>
        </div>

        {/* Zoom controls */}
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <Button
            size="icon"
            variant="secondary"
            onClick={handleZoomIn}
            title="Acercar (Zoom In)"
            className="h-9 w-9"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            onClick={handleZoomOut}
            title="Alejar (Zoom Out)"
            className="h-9 w-9"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            onClick={handleResetZoom}
            title="Restablecer Vista"
            className="h-9 w-9"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Legend and info */}
        <div className="absolute bottom-4 left-4 z-10 bg-white/95 backdrop-blur px-4 py-3 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-2 flex-1">
              <div className="font-bold text-sm text-gray-900">HISTORIA DE LA FILOSOFÍA</div>
              {!legendCollapsed && (
                <>
                  <div className="text-xs text-gray-600">resumida y visualizada</div>

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
                      v{APP_VERSION} · {new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}
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
          <svg ref={svgRef} style={{ width: "100%", height: "100%" }} />
        </div>

        {tooltip && (
          <div className="fixed z-50 p-3 bg-white border rounded shadow pointer-events-none" style={{ left: tooltip.x + 8, top: tooltip.y + 8 }}>
            <div className="text-sm">{tooltip.content}</div>
          </div>
        )}
      </div>
    </div>
  );
}
