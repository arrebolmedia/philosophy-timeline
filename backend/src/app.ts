import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import 'express-async-errors';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Crear aplicación Express
const app: Application = express();
const PORT = process.env.PORT || 4000;

// Middleware de seguridad
app.use(helmet());

// CORS
app.use(cors({
  origin: (process.env.CORS_ORIGIN || 'http://localhost:3000').split(',').map(s => s.trim()),
  credentials: true
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger
app.use(morgan('dev'));

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Import API routes
import apiRoutes from './routes/api.routes';
import adminRoutes from './routes/admin.routes';

// API Routes
app.use('/api', apiRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api', (_req: Request, res: Response) => {
  res.json({
    message: 'Historia de la Filosofía API',
    version: '0.1.0',
    endpoints: {
      health: '/health',
      periods: '/api/periods',
      categories: '/api/categories',
      schools: '/api/schools',
      philosophers: '/api/philosophers',
      statements: '/api/statements',
      connections: '/api/connections/:statementId',
      timeline: '/api/timeline',
      search: '/api/search?q='
    }
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
    timestamp: new Date().toISOString()
  });
});

// Error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err);
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    timestamp: new Date().toISOString()
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════════════════════════╗
  ║                                                           ║
  ║   📚 Historia de la Filosofía API                         ║
  ║                                                           ║
  ║   🚀 Server running on port ${PORT}                          ║
  ║   🌍 Environment: ${process.env.NODE_ENV || 'development'}                      ║
  ║   📡 API URL: http://localhost:${PORT}                       ║
  ║   🏥 Health: http://localhost:${PORT}/health                 ║
  ║                                                           ║
  ╚═══════════════════════════════════════════════════════════╝
  `);
});

export default app;
