# ARQUITECTURA TÉCNICA - Historia de la Filosofía Interactiva

## 1. ESTRUCTURA DEL PROYECTO

```
historia-filosofia/
├── 📁 frontend/                    # Next.js Application
│   ├── 📁 src/
│   │   ├── 📁 app/                # App Router (Next.js 14)
│   │   │   ├── 📁 (dashboard)/
│   │   │   │   ├── 📁 admin/
│   │   │   │   └── 📁 timeline/
│   │   │   ├── 📁 api/           # API Routes
│   │   │   ├── 📁 auth/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── 📁 components/
│   │   │   ├── 📁 ui/            # Shadcn/ui components
│   │   │   ├── 📁 timeline/      # Timeline específicos
│   │   │   ├── 📁 filters/       # Componentes de filtrado
│   │   │   └── 📁 layout/        # Layout components
│   │   ├── 📁 lib/
│   │   │   ├── 📁 stores/        # Zustand stores
│   │   │   ├── 📁 hooks/         # Custom hooks
│   │   │   ├── 📁 utils/         # Utilidades
│   │   │   └── 📁 types/         # TypeScript definitions
│   │   └── 📁 styles/
│   ├── 📄 package.json
│   ├── 📄 next.config.js
│   ├── 📄 tailwind.config.js
│   └── 📄 tsconfig.json
│
├── 📁 backend/                     # Node.js API Server
│   ├── 📁 src/
│   │   ├── 📁 controllers/       # Route controllers
│   │   ├── 📁 models/            # Database models
│   │   ├── 📁 routes/            # API routes
│   │   ├── 📁 middleware/        # Express middleware
│   │   ├── 📁 services/          # Business logic
│   │   ├── 📁 utils/             # Utilidades backend
│   │   └── 📄 app.ts             # Express app
│   ├── 📁 database/
│   │   ├── 📁 migrations/        # DB migrations
│   │   ├── 📁 seeds/             # Seed data
│   │   └── 📁 schemas/           # Database schemas
│   ├── 📄 package.json
│   ├── 📄 tsconfig.json
│   └── 📄 .env.example
│
├── 📁 shared/                      # Código compartido
│   ├── 📁 types/                 # TypeScript definitions
│   ├── 📁 constants/             # Constantes compartidas
│   └── 📁 utils/                 # Utilidades compartidas
│
├── 📁 database/                    # Database específico
│   ├── 📁 init/                  # Scripts iniciales
│   ├── 📁 backups/               # Respaldos
│   └── 📄 docker-compose.db.yml
│
├── 📁 docs/                        # Documentación
│   ├── 📄 API.md
│   ├── 📄 SETUP.md
│   └── 📄 DEPLOYMENT.md
│
├── 📁 scripts/                     # Automation scripts
│   ├── 📄 setup.sh
│   ├── 📄 seed-data.js
│   └── 📄 deploy.sh
│
├── 📄 README.md
├── 📄 package.json               # Root package.json
├── 📄 docker-compose.yml         # Full stack
└── 📄 .gitignore
```

---

## 2. STACK TECNOLÓGICO DETALLADO

### Frontend Stack
```json
{
  "core": {
    "framework": "Next.js 14",
    "language": "TypeScript",
    "styling": "Tailwind CSS",
    "ui-components": "Shadcn/ui + Headless UI"
  },
  "visualization": {
    "primary": "D3.js v7",
    "canvas": "Konva.js",
    "animations": "Framer Motion",
    "charts": "Recharts"
  },
  "state-management": {
    "global": "Zustand",
    "server-state": "TanStack Query",
    "forms": "React Hook Form + Zod"
  },
  "development": {
    "testing": "Jest + Vitest + Cypress",
    "linting": "ESLint + Prettier",
    "bundling": "Turbopack (Next.js)"
  }
}
```

### Backend Stack
```json
{
  "core": {
    "runtime": "Node.js 20+",
    "framework": "Express.js",
    "language": "TypeScript",
    "validation": "Zod"
  },
  "database": {
    "primary": "PostgreSQL 16",
    "cache": "Redis",
    "orm": "Prisma",
    "search": "ElasticSearch (opcional)"
  },
  "auth": {
    "strategy": "JWT + Refresh Tokens",
    "provider": "NextAuth.js",
    "sessions": "Redis"
  },
  "infrastructure": {
    "containerization": "Docker",
    "reverse-proxy": "Nginx",
    "file-storage": "AWS S3 / Local"
  }
}
```

---

## 3. ARQUITECTURA DE DATOS

### Modelo de Base de Datos (PostgreSQL)

```sql
-- Filósofos
CREATE TABLE philosophers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    birth_year INTEGER,
    death_year INTEGER,
    nationality VARCHAR(100),
    school_id INTEGER REFERENCES schools(id),
    period_id INTEGER REFERENCES periods(id),
    bio_short TEXT,
    bio_long TEXT,
    image_url VARCHAR(500),
    wikipedia_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Períodos históricos
CREATE TABLE periods (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    start_year INTEGER NOT NULL,
    end_year INTEGER,
    color_hex VARCHAR(7) NOT NULL,
    description TEXT
);

-- Escuelas filosóficas
CREATE TABLE schools (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(150) UNIQUE NOT NULL,
    description TEXT,
    period_id INTEGER REFERENCES periods(id)
);

-- Categorías/Ramas de filosofía
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    color_hex VARCHAR(7) NOT NULL,
    icon VARCHAR(50),
    description TEXT,
    parent_id INTEGER REFERENCES categories(id)
);

-- Sentencias/Ideas filosóficas
CREATE TABLE statements (
    id SERIAL PRIMARY KEY,
    philosopher_id INTEGER NOT NULL REFERENCES philosophers(id),
    text TEXT NOT NULL,
    text_original TEXT, -- Texto original si es traducción
    language VARCHAR(10) DEFAULT 'es',
    category_id INTEGER NOT NULL REFERENCES categories(id),
    is_direct_quote BOOLEAN DEFAULT FALSE,
    context TEXT, -- Contexto histórico/teórico
    order_in_timeline INTEGER,
    -- Posicionamiento visual
    x_position DECIMAL(10,2),
    y_position DECIMAL(10,2),
    -- Metadatos
    difficulty_level INTEGER DEFAULT 1, -- 1=básico, 5=avanzado
    popularity_score INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Conexiones entre ideas
CREATE TABLE connections (
    id SERIAL PRIMARY KEY,
    statement_from_id INTEGER NOT NULL REFERENCES statements(id),
    statement_to_id INTEGER NOT NULL REFERENCES statements(id),
    connection_type VARCHAR(20) NOT NULL, -- 'agreement', 'disagreement', 'expansion', 'refutation'
    strength INTEGER DEFAULT 3, -- 1-5 escala
    explanation TEXT,
    is_bidirectional BOOLEAN DEFAULT TRUE,
    verified_by VARCHAR(100), -- Quién verificó la conexión
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tags/Conceptos
CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    type VARCHAR(20) NOT NULL, -- 'concept', 'argument', 'theory', 'movement'
    description TEXT,
    color_hex VARCHAR(7)
);

-- Relación statements-tags (many-to-many)
CREATE TABLE statement_tags (
    statement_id INTEGER REFERENCES statements(id),
    tag_id INTEGER REFERENCES tags(id),
    PRIMARY KEY (statement_id, tag_id)
);

-- Referencias bibliográficas
CREATE TABLE references (
    id SERIAL PRIMARY KEY,
    type VARCHAR(20) NOT NULL, -- 'book', 'article', 'primary', 'secondary'
    title TEXT NOT NULL,
    author VARCHAR(300),
    year INTEGER,
    publisher VARCHAR(200),
    isbn VARCHAR(20),
    doi VARCHAR(100),
    url VARCHAR(500),
    page_numbers VARCHAR(50),
    full_citation TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Relación statements-references (many-to-many)
CREATE TABLE statement_references (
    statement_id INTEGER REFERENCES statements(id),
    reference_id INTEGER REFERENCES references(id),
    page_specific VARCHAR(20),
    PRIMARY KEY (statement_id, reference_id)
);

-- Usuarios (para admin y futuras funcionalidades)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    role VARCHAR(20) DEFAULT 'user', -- 'admin', 'editor', 'user'
    password_hash VARCHAR(255),
    avatar_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Índices para Performance
```sql
-- Índices esenciales
CREATE INDEX idx_statements_philosopher ON statements(philosopher_id);
CREATE INDEX idx_statements_category ON statements(category_id);
CREATE INDEX idx_connections_from ON connections(statement_from_id);
CREATE INDEX idx_connections_to ON connections(statement_to_id);
CREATE INDEX idx_philosophers_period ON philosophers(period_id);
CREATE INDEX idx_statements_timeline ON statements(order_in_timeline);

-- Índices de búsqueda de texto
CREATE INDEX idx_statements_text_search ON statements USING GIN(to_tsvector('spanish', text));
CREATE INDEX idx_philosophers_name_search ON philosophers USING GIN(to_tsvector('spanish', name));

-- Índices compuestos
CREATE INDEX idx_statements_difficulty_category ON statements(difficulty_level, category_id);
CREATE INDEX idx_connections_type_strength ON connections(connection_type, strength);
```

---

## 4. API ARCHITECTURE

### REST API Endpoints

```typescript
// GET /api/timeline
interface TimelineResponse {
  periods: Period[];
  philosophers: PhilosopherSummary[];
  totalStatements: number;
  filters: FilterOptions;
}

// GET /api/philosophers/:id/statements
interface PhilosopherStatementsResponse {
  philosopher: Philosopher;
  statements: Statement[];
  connections: Connection[];
}

// GET /api/statements/:id/connections  
interface StatementConnectionsResponse {
  statement: Statement;
  agreements: ConnectionDetail[];
  disagreements: ConnectionDetail[];
  related: ConnectionDetail[];
}

// GET /api/search?q=query&filters={}
interface SearchResponse {
  results: {
    philosophers: PhilosopherResult[];
    statements: StatementResult[];
    concepts: ConceptResult[];
  };
  facets: SearchFacets;
  pagination: PaginationInfo;
}

// POST /api/admin/statements
interface CreateStatementRequest {
  text: string;
  philosopherId: number;
  categoryId: number;
  tags: number[];
  references: number[];
  isDirectQuote: boolean;
  position?: {x: number, y: number};
}
```

### GraphQL Schema (Alternativa futura)
```graphql
type Philosopher {
  id: ID!
  name: String!
  slug: String!
  birthYear: Int
  deathYear: Int
  period: Period!
  school: School
  statements(filter: StatementFilter): [Statement!]!
  connectionsCount: ConnectionStats!
}

type Statement {
  id: ID!
  text: String!
  philosopher: Philosopher!
  category: Category!
  tags: [Tag!]!
  references: [Reference!]!
  connections(type: ConnectionType): [Connection!]!
  position: Position
  difficultyLevel: Int!
}

type Connection {
  id: ID!
  from: Statement!
  to: Statement!
  type: ConnectionType!
  strength: Int!
  explanation: String
}

enum ConnectionType {
  AGREEMENT
  DISAGREEMENT
  EXPANSION
  REFUTATION
}
```

---

## 5. COMPONENTES FRONTEND CLAVE

### Timeline Component Architecture
```typescript
// components/timeline/TimelineCanvas.tsx
interface TimelineCanvasProps {
  data: TimelineData;
  filters: FilterState;
  onStatementClick: (statement: Statement) => void;
  onConnectionHover: (connection: Connection | null) => void;
}

// components/timeline/StatementNode.tsx
interface StatementNodeProps {
  statement: Statement;
  position: Position;
  isSelected: boolean;
  connections: Connection[];
  onSelect: () => void;
}

// components/filters/FilterPanel.tsx
interface FilterPanelProps {
  categories: Category[];
  periods: Period[];
  currentFilters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}
```

### State Management (Zustand)
```typescript
interface TimelineStore {
  // Data state
  philosophers: Philosopher[];
  statements: Statement[];
  connections: Connection[];
  
  // UI state
  selectedStatement: Statement | null;
  activeFilters: FilterState;
  viewportPosition: ViewportPosition;
  
  // Actions
  setSelectedStatement: (statement: Statement | null) => void;
  updateFilters: (filters: Partial<FilterState>) => void;
  loadTimelineData: () => Promise<void>;
  searchStatements: (query: string) => Promise<SearchResult[]>;
}
```

---

## 6. DEPLOYMENT Y DEVOPS

### Docker Configuration
```yaml
# docker-compose.yml
version: '3.8'
services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:4000
    depends_on:
      - backend

  backend:
    build: ./backend
    ports:
      - "4000:4000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/filosofia
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis

  db:
    image: postgres:16
    environment:
      POSTGRES_DB: filosofia
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/init:/docker-entrypoint-initdb.d

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### CI/CD Pipeline (GitHub Actions)
```yaml
name: Deploy Historia Filosofia
on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run test
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Production
        run: |
          # Deploy commands
```

Esta arquitectura nos proporciona una base sólida y moderna para crear un proyecto que supere las capacidades del original mientras mantiene su esencia y funcionalidades clave.