// Types for D3 Timeline Visualization

export interface PhilosopherNode {
  id: number;
  name: string;
  slug: string;
  birthYear: number;
  deathYear: number;
  nationality: string;
  bioShort: string;
  period: {
    id: number;
    name: string;
    colorHex: string;
  };
  school: {
    name: string;
  } | null;
  statements: StatementNode[];
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface StatementNode {
  id: number;
  text: string;
  philosopherId: number;
  categoryId: number;
  isDirectQuote: boolean;
  xPosition: number;
  yPosition: number;
  difficultyLevel: number;
  popularityScore: number;
  orderInTimeline: number;
  category: {
    id: number;
    name: string;
    colorHex: string;
  };
  tags: Array<{
    tag: {
      name: string;
      type: string;
    };
  }>;
  connectionsFrom: ConnectionLink[];
  connectionsTo: ConnectionLink[];
  x?: number;
  y?: number;
}

export interface ConnectionLink {
  id: number;
  statementFromId: number;
  statementToId: number;
  connectionType: ConnectionType;
  strength: number;
  isBidirectional: boolean;
  statementFrom?: StatementNode;
  statementTo?: StatementNode;
  source?: any;
  target?: any;
}

export type ConnectionType = 
  | 'agreement' 
  | 'disagreement' 
  | 'expansion' 
  | 'refutation' 
  | 'inspiration'
  | 'oppose'
  | 'influence'
  | 'resonate';

export interface TimelineFilter {
  periodId?: number;
  categoryId?: number;
  schoolId?: number;
  startYear?: number;
  endYear?: number;
  connectionType?: ConnectionType;
  minPopularity?: number;
}

export interface TimelineData {
  philosophers: PhilosopherNode[];
  statements: StatementNode[];
  connections: ConnectionLink[];
  periods: Period[];
  categories: Category[];
}

export interface Period {
  id: number;
  name: string;
  slug: string;
  startYear: number;
  endYear: number | null;
  colorHex: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  colorHex: string;
  icon: string;
}

export interface ViewportTransform {
  x: number;
  y: number;
  k: number;
}

export interface TooltipData {
  type: 'philosopher' | 'statement' | 'connection';
  data: PhilosopherNode | StatementNode | ConnectionLink;
  x: number;
  y: number;
}
