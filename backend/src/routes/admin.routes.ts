import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// ============================================
// PHILOSOPHERS
// ============================================

// Get all philosophers
router.get('/philosophers', async (_req, res) => {
  try {
    const philosophers = await prisma.philosopher.findMany({
      include: {
        school: true,
        period: true,
        _count: {
          select: { statements: true }
        }
      },
      orderBy: { birthYear: 'asc' }
    });
    res.json(philosophers);
  } catch (error) {
    console.error('Error fetching philosophers:', error);
    res.status(500).json({ error: 'Failed to fetch philosophers' });
  }
});

// Create philosopher
router.post('/philosophers', async (req, res) => {
  try {
    const philosopher = await prisma.philosopher.create({
      data: req.body,
      include: {
        school: true,
        period: true
      }
    });
    res.status(201).json(philosopher);
  } catch (error) {
    console.error('Error creating philosopher:', error);
    res.status(500).json({ error: 'Failed to create philosopher' });
  }
});

// Update philosopher
router.put('/philosophers/:id', async (req, res) => {
  try {
    const philosopher = await prisma.philosopher.update({
      where: { id: parseInt(req.params.id) },
      data: req.body,
      include: {
        school: true,
        period: true
      }
    });
    res.json(philosopher);
  } catch (error) {
    console.error('Error updating philosopher:', error);
    res.status(500).json({ error: 'Failed to update philosopher' });
  }
});

// Delete philosopher
router.delete('/philosophers/:id', async (req, res) => {
  try {
    await prisma.philosopher.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting philosopher:', error);
    res.status(500).json({ error: 'Failed to delete philosopher' });
  }
});

// ============================================
// STATEMENTS
// ============================================

// Get all statements
router.get('/statements', async (_req, res) => {
  try {
    const statements = await prisma.statement.findMany({
      include: {
        philosopher: {
          select: { id: true, name: true, slug: true }
        },
        category: {
          select: { id: true, name: true, slug: true, colorHex: true }
        },
        _count: {
          select: { 
            connectionsFrom: true,
            connectionsTo: true
          }
        }
      },
      orderBy: [
        { philosopher: { birthYear: 'asc' } },
        { orderInTimeline: 'asc' }
      ]
    });
    res.json(statements);
  } catch (error) {
    console.error('Error fetching statements:', error);
    res.status(500).json({ error: 'Failed to fetch statements' });
  }
});

// Create statement
router.post('/statements', async (req, res) => {
  try {
    const statement = await prisma.statement.create({
      data: req.body,
      include: {
        philosopher: true,
        category: true
      }
    });
    res.status(201).json(statement);
  } catch (error) {
    console.error('Error creating statement:', error);
    res.status(500).json({ error: 'Failed to create statement' });
  }
});

// Update statement
router.put('/statements/:id', async (req, res) => {
  try {
    const statement = await prisma.statement.update({
      where: { id: parseInt(req.params.id) },
      data: req.body,
      include: {
        philosopher: true,
        category: true
      }
    });
    res.json(statement);
  } catch (error) {
    console.error('Error updating statement:', error);
    res.status(500).json({ error: 'Failed to update statement' });
  }
});

// Delete statement
router.delete('/statements/:id', async (req, res) => {
  try {
    await prisma.statement.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting statement:', error);
    res.status(500).json({ error: 'Failed to delete statement' });
  }
});

// ============================================
// CONNECTIONS
// ============================================

// Get all connections
router.get('/connections', async (_req, res) => {
  try {
    const connections = await prisma.connection.findMany({
      include: {
        statementFrom: {
          include: {
            philosopher: {
              select: { id: true, name: true, slug: true }
            }
          }
        },
        statementTo: {
          include: {
            philosopher: {
              select: { id: true, name: true, slug: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(connections);
  } catch (error) {
    console.error('Error fetching connections:', error);
    res.status(500).json({ error: 'Failed to fetch connections' });
  }
});

// Create connection
router.post('/connections', async (req, res) => {
  try {
    const connection = await prisma.connection.create({
      data: req.body,
      include: {
        statementFrom: {
          include: { philosopher: true }
        },
        statementTo: {
          include: { philosopher: true }
        }
      }
    });
    res.status(201).json(connection);
  } catch (error) {
    console.error('Error creating connection:', error);
    res.status(500).json({ error: 'Failed to create connection' });
  }
});

// Update connection
router.put('/connections/:id', async (req, res) => {
  try {
    const connection = await prisma.connection.update({
      where: { id: parseInt(req.params.id) },
      data: req.body,
      include: {
        statementFrom: {
          include: { philosopher: true }
        },
        statementTo: {
          include: { philosopher: true }
        }
      }
    });
    res.json(connection);
  } catch (error) {
    console.error('Error updating connection:', error);
    res.status(500).json({ error: 'Failed to update connection' });
  }
});

// Delete connection
router.delete('/connections/:id', async (req, res) => {
  try {
    await prisma.connection.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting connection:', error);
    res.status(500).json({ error: 'Failed to delete connection' });
  }
});

// ============================================
// HELPER ENDPOINTS
// ============================================

// Get schools for dropdowns
router.get('/schools', async (_req, res) => {
  try {
    const schools = await prisma.school.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(schools);
  } catch (error) {
    console.error('Error fetching schools:', error);
    res.status(500).json({ error: 'Failed to fetch schools' });
  }
});

// Get periods for dropdowns
router.get('/periods', async (_req, res) => {
  try {
    const periods = await prisma.period.findMany({
      orderBy: { startYear: 'asc' }
    });
    res.json(periods);
  } catch (error) {
    console.error('Error fetching periods:', error);
    res.status(500).json({ error: 'Failed to fetch periods' });
  }
});

// Get categories for dropdowns
router.get('/categories', async (_req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

export default router;
