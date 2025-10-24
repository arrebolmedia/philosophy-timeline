'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Info, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import type { TimelineData, StatementNode, ConnectionLink, PhilosopherNode } from '@/types/timeline';

export function TimelineCanvas() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const zoomRef = useRef<any>(null);
  const filterActiveRef = useRef<boolean>(false);
  const initialZoomRef = useRef<any>(null);
  const [data, setData] = useState<TimelineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string } | null>(null);
  const [highlightId, setHighlightId] = useState<number | null>(null);
  const [hoveredPhilosopher, setHoveredPhilosopher] = useState<number | null>(null);
  const [hoveredStatement, setHoveredStatement] = useState<number | null>(null);
  const [filteredPhilosopher, setFilteredPhilosopher] = useState<number | null>(null);
  const [filteredStatement, setFilteredStatement] = useState<number | null>(null);

  useEffect(() => {
    const fetchTimelineData = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/timeline`);
        if (!response.ok) throw new Error('Error al cargar datos');
        const result = await response.json();
        setData(result.data as TimelineData);
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

    // DIAGONAL STAIRCASE LAYOUT: each philosopher descends diagonally (down-right)
    const startX = 80;
    const startY = 40;
    const diagonalStepX = 200; // horizontal step per philosopher (move right)
    const statementSpacing = 18; // vertical space between statements
    const basePhilosopherHeight = 70; // base space for philosopher name + padding

    // flatten statements and set positions
    const statements: StatementNode[] = [];
    let cumulativeY = startY; // Track vertical position dynamically
    
    philosophers.forEach((p, i) => {
      // Each philosopher starts at diagonal position (staircase effect)
      const philosopherX = startX + (i * diagonalStepX);
      const philosopherY = cumulativeY;
      
      p.x = philosopherX;
      p.y = philosopherY;
      
      const numStatements = (p.statements || []).length;
      
      (p.statements || []).forEach((s: StatementNode, j: number) => {
        // Statements cascade vertically below each philosopher
        const x = philosopherX + 30;
        const y = philosopherY + 30 + (j * statementSpacing);
        s.x = x;
        s.y = y;
        s.philosopherId = p.id;
        statements.push(s);
      });
      
      // Calculate space needed for this philosopher: base height + statements
      const philosopherTotalHeight = basePhilosopherHeight + (numStatements * statementSpacing);
      cumulativeY += philosopherTotalHeight;
    });

    // ===== DRAW CONNECTIONS FIRST (bottom layer) =====
    const connG = g.append('g').attr('class', 'connections');
    const conns: ConnectionLink[] = data.connections || [];
    console.log('Drawing connections:', conns.length, conns);

    const colorFor = (type: string) => {
      switch (type) {
        case 'agreement':
        case 'expansion':
        case 'inspiration':
          return '#a7f3d0'; // Light green, pastel tone (green-200)
        case 'disagreement':
        case 'refutation':
          return '#fecaca'; // Light red, pastel tone (red-200)
        default:
          return '#d1d5db'; // Light gray (gray-300)
      }
    };

    // TRUE semicircle path - literally half of a circle
    const pathFor = (c: ConnectionLink) => {
      const from = statements.find(s => s.id === c.statementFromId);
      const to = statements.find(s => s.id === c.statementToId);
      if (!from || !to) {
        console.log('Connection missing statement:', c.statementFromId, c.statementToId);
        return '';
      }
      
      const x1 = (from.x || 0) - 10;
      const y1 = from.y || 0;
      const x2 = (to.x || 0) - 10;
      const y2 = to.y || 0;
      
      // Calculate distance - this will be the diameter of the circle
      const dx = x2 - x1;
      const dy = y2 - y1;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Radius is half the distance (diameter / 2)
      const radius = distance / 2;
      
      // SVG Arc command: A rx ry x-axis-rotation large-arc-flag sweep-flag x y
      // large-arc-flag: 0 = smaller arc, 1 = larger arc
      // sweep-flag: 0 = counterclockwise, 1 = clockwise
      // For a perfect semicircle, we want: large-arc=0, sweep alternates for direction
      
      // Alternate sweep direction based on connection type
      const sweep = (c.connectionType === 'disagreement' || c.connectionType === 'refutation') ? 0 : 1;
      
      // Arc: radius-x radius-y rotation large-arc-flag sweep-flag end-x end-y
      console.log(`Semicircle: (${x1},${y1}) -> (${x2},${y2}), radius=${radius.toFixed(0)}, sweep=${sweep}`);
      return `M ${x1} ${y1} A ${radius} ${radius} 0 0 ${sweep} ${x2} ${y2}`;
    };

    connG.selectAll('path.connection').data(conns, (d: any) => d.id).enter().append('path')
      .attr('class', 'connection')
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
    stmtNodes.append('text').attr('x', 0).attr('y', 0).text((d: any) => truncate(d.text, 120))
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
          .attr('cx', -10).attr('cy', 0).attr('r', 3)
          .attr('fill', '#d1d5db').attr('opacity', 1);
      } else {
        // Count positive vs negative connections
        const positiveCount = relatedConnections.filter((c: ConnectionLink) => 
          c.connectionType === 'agreement' || c.connectionType === 'expansion' || c.connectionType === 'inspiration'
        ).length;
        const negativeCount = relatedConnections.filter((c: ConnectionLink) => 
          c.connectionType === 'disagreement' || c.connectionType === 'refutation'
        ).length;
        
        if (positiveCount > 0 && negativeCount === 0) {
          // Only positive - green dot
          d3.select(this).append('circle')
            .attr('cx', -10).attr('cy', 0).attr('r', 3)
            .attr('fill', '#a7f3d0').attr('opacity', 1);
        } else if (negativeCount > 0 && positiveCount === 0) {
          // Only negative - red dot
          d3.select(this).append('circle')
            .attr('cx', -10).attr('cy', 0).attr('r', 3)
            .attr('fill', '#fecaca').attr('opacity', 1);
        } else if (positiveCount > 0 && negativeCount > 0) {
          // Both - split half green, half red using a gradient or two half-circles
          const g = d3.select(this);
          
          // Left half - green
          g.append('path')
            .attr('d', 'M -10 -3 A 3 3 0 0 1 -10 3 Z')
            .attr('fill', '#a7f3d0').attr('opacity', 1);
          
          // Right half - red
          g.append('path')
            .attr('d', 'M -10 -3 A 3 3 0 0 0 -10 3 Z')
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
    if (svgRef.current && zoomRef.current) {
      const svg = d3.select(svgRef.current);
      svg.transition().duration(500).call(
        zoomRef.current.transform,
        d3.zoomIdentity.translate(50, 50).scale(0.8)
      );
    }
  }, []);

  // Effect to handle hover and filter opacity changes
  useEffect(() => {
    if (!svgRef.current || !data) return;

    const svg = d3.select(svgRef.current);
    
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
      // Filter mode: only show this philosopher and their statements
      activePhilosophers.add(filteredPhilosopher);
      svg.selectAll('.statement').each(function(d: any) {
        if (d.philosopherId === filteredPhilosopher) {
          activeStatements.add(d.id);
        }
      });
      
      // Don't show any connections when filtering by philosopher
      // (connections are between statements, not philosophers)
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
      // Hover mode: fade all except this philosopher
      activePhilosophers.add(hoveredPhilosopher);
      svg.selectAll('.statement').each(function(d: any) {
        if (d.philosopherId === hoveredPhilosopher) {
          activeStatements.add(d.id);
        }
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
        
        // Calculate compact staircase positions
        const compactStartX = 80;
        const compactStartY = 40;
        const compactStepX = 280;
        const compactBaseStepY = 70;
        const compactStatementSpacing = 22;
        
        const newPositions = new Map<number, {x: number, y: number}>();
        let cumulativeY = compactStartY;
        
        activePhilosList.forEach((item, index) => {
          const compactX = compactStartX + (index * compactStepX);
          const compactY = cumulativeY;
          
          // Count active statements for this philosopher
          let activeStmtCount = 0;
          svg.selectAll('.statement').each(function(s: any) {
            if (s.philosopherId === item.data.id && activeStatements.has(s.id)) {
              activeStmtCount++;
            }
          });
          
          newPositions.set(item.data.id, { x: compactX, y: compactY });
          cumulativeY += compactBaseStepY + (activeStmtCount * compactStatementSpacing);
        });
        
        // Calculate bounding box of the grouped content
        const positions = Array.from(newPositions.values());
        if (positions.length > 0) {
          const minX = Math.min(...positions.map(p => p.x)) - 100;
          const maxX = Math.max(...positions.map(p => p.x)) + 300;
          const minY = Math.min(...positions.map(p => p.y)) - 50;
          const maxY = cumulativeY + 50;
          
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
        svg.style('pointer-events', 'none');
        
        // Move philosophers to compact positions, hide others
        svg.selectAll('.philosopher-label')
          .transition()
          .duration(500)
          .style('opacity', (d: any) => activePhilosophers.has(d.id) ? 1 : 0)
          .attr('transform', function(d: any) {
            if (activePhilosophers.has(d.id)) {
              const pos = newPositions.get(d.id);
              if (pos) {
                return `translate(${pos.x}, ${pos.y})`;
              }
            }
            return `translate(${d.x}, ${d.y})`;
          })
          .on('end', function() {
            // Re-enable pointer events after last transition ends
            svg.style('pointer-events', 'auto');
          });
        
        // Move statements with their philosophers, hide others
        svg.selectAll('.statement')
          .transition()
          .duration(500)
          .style('opacity', (d: any) => activeStatements.has(d.id) ? 1 : 0)
          .attr('transform', function(d: any) {
            if (activeStatements.has(d.id)) {
              const philoPos = newPositions.get(d.philosopherId);
              if (philoPos) {
                // Find original philosopher position from SVG data
                let origPhiloX = 0, origPhiloY = 0;
                svg.selectAll('.philosopher-label').each(function(p: any) {
                  if (p.id === d.philosopherId) {
                    origPhiloX = p.x || 0;
                    origPhiloY = p.y || 0;
                  }
                });
                
                // Calculate offset from original philosopher position
                const offsetX = d.x - origPhiloX;
                const offsetY = d.y - origPhiloY;
                return `translate(${philoPos.x + offsetX}, ${philoPos.y + offsetY})`;
              }
            }
            return `translate(${d.x}, ${d.y})`;
          });
        
        // Hide original connections temporarily
        svg.selectAll('.connection')
          .transition()
          .duration(250)
          .style('opacity', 0);
        
        // Redraw connections with new positions after movement
        setTimeout(() => {
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
            
            svg.selectAll('.statement').each(function(s: any) {
              if (s.id === conn.statementFromId) {
                const philoPos = newPositions.get(s.philosopherId);
                if (philoPos) {
                  // Find original philosopher position
                  let origPhiloX = 0, origPhiloY = 0;
                  svg.selectAll('.philosopher-label').each(function(p: any) {
                    if (p.id === s.philosopherId) {
                      origPhiloX = p.x || 0;
                      origPhiloY = p.y || 0;
                    }
                  });
                  const offsetX = s.x - origPhiloX;
                  const offsetY = s.y - origPhiloY;
                  fromPos = { x: philoPos.x + offsetX - 10, y: philoPos.y + offsetY };
                }
              }
              if (s.id === conn.statementToId) {
                const philoPos = newPositions.get(s.philosopherId);
                if (philoPos) {
                  // Find original philosopher position
                  let origPhiloX = 0, origPhiloY = 0;
                  svg.selectAll('.philosopher-label').each(function(p: any) {
                    if (p.id === s.philosopherId) {
                      origPhiloX = p.x || 0;
                      origPhiloY = p.y || 0;
                    }
                  });
                  const offsetX = s.x - origPhiloX;
                  const offsetY = s.y - origPhiloY;
                  toPos = { x: philoPos.x + offsetX - 10, y: philoPos.y + offsetY };
                }
              }
            });
            
            if (fromPos !== null && toPos !== null) {
              const from: {x: number, y: number} = fromPos;
              const to: {x: number, y: number} = toPos;
              const dx = to.x - from.x;
              const dy = to.y - from.y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              const radius = distance / 2;
              const sweep = (conn.connectionType === 'disagreement' || conn.connectionType === 'refutation') ? 0 : 1;
              
              const colorFor = (type: string) => {
                if (type === 'agreement' || type === 'expansion' || type === 'inspiration') return '#a7f3d0';
                if (type === 'disagreement' || type === 'refutation') return '#fecaca';
                return '#d1d5db';
              };
              
              connG.append('path')
                .attr('class', 'connection')
                .attr('d', `M ${from.x} ${from.y} A ${radius} ${radius} 0 0 ${sweep} ${to.x} ${to.y}`)
                .attr('fill', 'none')
                .attr('stroke', colorFor(conn.connectionType))
                .attr('stroke-width', 2)
                .style('opacity', 0)
                .transition()
                .duration(250)
                .style('opacity', 1);
            }
          });
        }, 550);
        
      } else if (filteredPhilosopher) {
        // FILTER by philosopher: just hide others, don't move
        // Disable hover events during animation
        setHoveredPhilosopher(null);
        setHoveredStatement(null);
        svg.style('pointer-events', 'none');
        
        svg.selectAll('.philosopher-label')
          .transition()
          .duration(400)
          .style('opacity', (d: any) => activePhilosophers.has(d.id) ? 1 : 0)
          .on('end', function() {
            svg.style('pointer-events', 'auto');
          });

        svg.selectAll('.statement')
          .transition()
          .duration(300)
          .style('opacity', (d: any) => activeStatements.has(d.id) ? 1 : 0);
        
        // Fade connections
        svg.selectAll('.connection')
          .transition()
          .duration(300)
          .style('opacity', 0);
        
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
        
        // Fade connections in hover mode
        svg.selectAll('.connection')
          .transition()
          .duration(300)
          .style('opacity', function(d: any) {
            // Check if connection has data bound to it
            if (!d || !d.statementFromId || !d.statementToId) {
              return 1; // Default to visible if no data
            }
            
            const key = `${d.statementFromId}-${d.statementToId}`;
            
            // If we have active connections defined, show only those
            if (activeConnections.size > 0) {
              return activeConnections.has(key) ? 1 : 0.2;
            }
            
            // If we're hovering/filtering by philosopher or statement without connections,
            // show connections only if both endpoints are in active statements
            if (activeStatements.size > 0) {
              const isActive = activeStatements.has(d.statementFromId) && 
                             activeStatements.has(d.statementToId);
              return isActive ? 1 : 0.2;
            }
            
            return 1;
          });
      }
    } else {
      // Reset all to normal
      // Disable hover events during animation
      setHoveredPhilosopher(null);
      setHoveredStatement(null);
      svg.style('pointer-events', 'none');
      
      // Only restore zoom if we had a filter before (not just hover)
      if (initialZoomRef.current && filterActiveRef.current) {
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
          svg.style('pointer-events', 'auto');
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
            if (type === 'agreement' || type === 'expansion' || type === 'inspiration') return '#a7f3d0';
            if (type === 'disagreement' || type === 'refutation') return '#fecaca';
            return '#d1d5db';
          };
          
          connections.forEach((conn: any) => {
            // Find original statement positions
            let fromX = 0, fromY = 0, toX = 0, toY = 0;
            
            svg.selectAll('.statement').each(function(s: any) {
              if (s.id === conn.statementFromId) {
                fromX = s.x - 10;
                fromY = s.y;
              }
              if (s.id === conn.statementToId) {
                toX = s.x - 10;
                toY = s.y;
              }
            });
            
            const dx = toX - fromX;
            const dy = toY - fromY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const radius = distance / 2;
            const sweep = (conn.connectionType === 'disagreement' || conn.connectionType === 'refutation') ? 0 : 1;
            
            connG.append('path')
              .attr('class', 'connection')
              .attr('d', `M ${fromX} ${fromY} A ${radius} ${radius} 0 0 ${sweep} ${toX} ${toY}`)
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
      <div className="w-full h-[calc(100vh-280px)] flex items-center justify-center">
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
    <div className="w-full">
      <div className="relative">
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
          <div className="space-y-2">
            <div className="font-bold text-sm text-gray-900">HISTORIA DE LA FILOSOFÍA</div>
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
                trabajo en progreso v5.31, última actualización: {new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}
              </div>
            </div>
          </div>
        </div>

        <div ref={containerRef} className="w-full h-[calc(100vh-200px)] bg-white overflow-hidden border-t">
          <svg ref={svgRef} style={{ minWidth: '3000px', minHeight: '2500px' }} />
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
