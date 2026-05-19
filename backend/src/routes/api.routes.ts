import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

/**
 * GET /api/periods
 * Obtiene todos los períodos históricos
 */
router.get('/periods', async (_req: Request, res: Response) => {
  try {
    const periods = await prisma.period.findMany({
      orderBy: { startYear: 'asc' },
      include: {
        _count: {
          select: { philosophers: true }
        }
      }
    });
    
    res.json({
      success: true,
      data: periods
    });
  } catch (error) {
    console.error('Error fetching periods:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener períodos'
    });
  }
});

/**
 * GET /api/categories
 * Obtiene todas las categorías filosóficas
 */
router.get('/categories', async (_req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { statements: true }
        }
      }
    });
    
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener categorías'
    });
  }
});

/**
 * GET /api/schools
 * Obtiene todas las escuelas filosóficas
 */
router.get('/schools', async (_req: Request, res: Response) => {
  try {
    const schools = await prisma.school.findMany({
      orderBy: { name: 'asc' },
      include: {
        period: true,
        _count: {
          select: { philosophers: true }
        }
      }
    });
    
    res.json({
      success: true,
      data: schools
    });
  } catch (error) {
    console.error('Error fetching schools:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener escuelas'
    });
  }
});

/**
 * GET /api/philosophers
 * Obtiene filósofos con paginación y filtros
 */
router.get('/philosophers', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const periodSlug = req.query.period as string;
    const schoolSlug = req.query.school as string;
    const search = req.query.search as string;

    const skip = (page - 1) * limit;

    // Construir filtros
    const where: any = {};
    
    if (periodSlug) {
      where.period = { slug: periodSlug };
    }
    
    if (schoolSlug) {
      where.school = { slug: schoolSlug };
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { bioShort: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [philosophers, total] = await Promise.all([
      prisma.philosopher.findMany({
        where,
        skip,
        take: limit,
        orderBy: { birthYear: 'asc' },
        include: {
          period: true,
          school: true,
          _count: {
            select: { statements: true }
          }
        }
      }),
      prisma.philosopher.count({ where })
    ]);

    res.json({
      success: true,
      data: philosophers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching philosophers:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener filósofos'
    });
  }
});

/**
 * GET /api/philosophers/:slug
 * Obtiene un filósofo por su slug con todas sus declaraciones
 */
router.get('/philosophers/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const philosopher = await prisma.philosopher.findUnique({
      where: { slug },
      include: {
        period: true,
        school: true,
        statements: {
          include: {
            category: true,
            tags: {
              include: {
                tag: true
              }
            },
            connectionsFrom: {
              include: {
                statementTo: {
                  include: {
                    philosopher: true,
                    category: true
                  }
                }
              }
            },
            connectionsTo: {
              include: {
                statementFrom: {
                  include: {
                    philosopher: true,
                    category: true
                  }
                }
              }
            }
          },
          orderBy: { orderInTimeline: 'asc' }
        }
      }
    });

    if (!philosopher) {
      return res.status(404).json({
        success: false,
        error: 'Filósofo no encontrado'
      });
    }

    return res.json({
      success: true,
      data: philosopher
    });
  } catch (error) {
    console.error('Error fetching philosopher:', error);
    return res.status(500).json({
      success: false,
      error: 'Error al obtener filósofo'
    });
  }
});

/**
 * GET /api/statements
 * Obtiene declaraciones con filtros y paginación
 */
router.get('/statements', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const categorySlug = req.query.category as string;
    const philosopherSlug = req.query.philosopher as string;
    const periodSlug = req.query.period as string;

    const skip = (page - 1) * limit;

    // Construir filtros
    const where: any = {};
    
    if (categorySlug) {
      where.category = { slug: categorySlug };
    }
    
    if (philosopherSlug) {
      where.philosopher = { slug: philosopherSlug };
    }
    
    if (periodSlug) {
      where.philosopher = {
        ...where.philosopher,
        period: { slug: periodSlug }
      };
    }

    const [statements, total] = await Promise.all([
      prisma.statement.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { popularityScore: 'desc' },
          { orderInTimeline: 'asc' }
        ],
        include: {
          philosopher: {
            include: {
              period: true
            }
          },
          category: true,
          tags: {
            include: {
              tag: true
            }
          }
        }
      }),
      prisma.statement.count({ where })
    ]);

    res.json({
      success: true,
      data: statements,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching statements:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener declaraciones'
    });
  }
});

/**
 * GET /api/connections/:statementId
 * Obtiene todas las conexiones de una declaración específica
 */
router.get('/connections/:statementId', async (req: Request, res: Response) => {
  try {
    const statementId = parseInt(req.params.statementId);

    const [connectionsFrom, connectionsTo] = await Promise.all([
      prisma.connection.findMany({
        where: { statementFromId: statementId },
        include: {
          statementTo: {
            include: {
              philosopher: true,
              category: true
            }
          }
        }
      }),
      prisma.connection.findMany({
        where: { statementToId: statementId },
        include: {
          statementFrom: {
            include: {
              philosopher: true,
              category: true
            }
          }
        }
      })
    ]);

    res.json({
      success: true,
      data: {
        outgoing: connectionsFrom,
        incoming: connectionsTo
      }
    });
  } catch (error) {
    console.error('Error fetching connections:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener conexiones'
    });
  }
});

/**
 * GET /api/timeline
 * Obtiene datos optimizados para el canvas de timeline
 */
router.get('/timeline', async (req: Request, res: Response) => {
  try {
    const periodSlug = req.query.period as string;
    const categorySlug = req.query.category as string;

    const where: any = {};
    
    if (periodSlug) {
      where.philosopher = { period: { slug: periodSlug } };
    }
    
    if (categorySlug) {
      where.category = { slug: categorySlug };
    }

    const statements = await prisma.statement.findMany({
      where,
      include: {
        philosopher: {
          include: {
            period: true
          }
        },
        category: true,
        references: {
          include: {
            reference: true
          }
        },
        connectionsFrom: {
          include: {
            statementTo: true
          }
        },
        connectionsTo: {
          include: {
            statementFrom: true
          }
        }
      },
      orderBy: [
        { philosopher: { birthYear: 'asc' } },
        { orderInTimeline: 'asc' }
      ]
    });

    // Agrupar por filósofo para optimizar visualización
    const groupedByPhilosopher = statements.reduce((acc: any, statement: any) => {
      const philoId = statement.philosopher.id;
      if (!acc[philoId]) {
        acc[philoId] = {
          philosopher: statement.philosopher,
          statements: []
        };
      }
      acc[philoId].statements.push(statement);
      return acc;
    }, {});

    // Extraer todas las conexiones únicas
    const connectionsMap = new Map();
    statements.forEach((statement: any) => {
      statement.connectionsFrom?.forEach((conn: any) => {
        const key = `${conn.statementFromId}-${conn.statementToId}`;
        if (!connectionsMap.has(key)) {
          connectionsMap.set(key, conn);
        }
      });
    });

    const connections = Array.from(connectionsMap.values());

    res.json({
      success: true,
      data: {
        philosophers: Object.values(groupedByPhilosopher),
        connections: connections,
        totalStatements: statements.length
      }
    });
  } catch (error) {
    console.error('Error fetching timeline data:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener datos del timeline'
    });
  }
});

/**
 * GET /api/search
 * Búsqueda global en filósofos y declaraciones
 */
router.get('/search', async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;
    
    if (!query || query.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Query debe tener al menos 2 caracteres'
      });
    }

    const [philosophers, statements] = await Promise.all([
      prisma.philosopher.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { bioShort: { contains: query, mode: 'insensitive' } }
          ]
        },
        take: 5,
        include: {
          period: true,
          school: true
        }
      }),
      prisma.statement.findMany({
        where: {
          text: { contains: query, mode: 'insensitive' }
        },
        take: 10,
        include: {
          philosopher: true,
          category: true
        },
        orderBy: { popularityScore: 'desc' }
      })
    ]);

    return res.json({
      success: true,
      data: {
        philosophers,
        statements
      }
    });
  } catch (error) {
    console.error('Error in search:', error);
    return res.status(500).json({
      success: false,
      error: 'Error en la búsqueda'
    });
  }
});

router.get('/changelog', async (_req: Request, res: Response) => {
  try {
    const [dev, proposiciones] = await Promise.all([
      prisma.changelog.findMany({
        where: { category: 'desarrollo' },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.changelog.findMany({
        where: { category: { in: ['proposiciones', 'statements'] } },
        orderBy: { createdAt: 'desc' },
      }),
    ]);
    res.json({ success: true, data: { desarrollo: dev, proposiciones } });
  } catch (error) {
    console.error('Error fetching changelog:', error);
    res.status(500).json({ success: false, error: 'Error al obtener changelog' });
  }
});

export default router;