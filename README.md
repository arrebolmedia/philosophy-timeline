# Historia de la Filosofía - Proyecto Interactivo

Una visualización interactiva moderna de la historia de la filosofía occidental, inspirada en el trabajo de Deniz Cem Önduygu, pero con tecnologías actuales y funcionalidades expandidas.

## 🎯 Visión del Proyecto

Crear la herramienta más completa y accesible para explorar las conexiones entre ideas filosóficas a lo largo de la historia, desde los presocráticos hasta la filosofía contemporánea.

## 🚀 Características Principales

- **Timeline Interactivo**: Navegación fluida por 2600+ años de filosofía
- **Conexiones Visuales**: Red de relaciones entre ideas y argumentos
- **Búsqueda Inteligente**: Encuentra filósofos, conceptos y argumentos
- **Filtros Avanzados**: Por período, categoría, dificultad y más
- **Referencias Académicas**: Sistema completo de citas y fuentes
- **Responsive Design**: Optimizado para desktop, tablet y móvil
- **Accesibilidad**: Cumple con estándares WCAG 2.1 AA

## 🛠️ Stack Tecnológico

### Frontend
- **Framework**: Next.js 14 con TypeScript
- **Styling**: Tailwind CSS + Shadcn/ui
- **Visualización**: D3.js + Canvas API
- **Estado**: Zustand + TanStack Query
- **Testing**: Jest + Cypress

### Backend
- **Runtime**: Node.js 20+ con TypeScript
- **Framework**: Express.js
- **Base de Datos**: PostgreSQL 16 + Redis
- **ORM**: Prisma
- **Auth**: NextAuth.js

### DevOps
- **Containerización**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Deployment**: Vercel + Railway/Supabase
- **Monitoring**: Sentry + Vercel Analytics

## 📁 Estructura del Proyecto

```
historia-filosofia/
├── 📁 frontend/          # Aplicación Next.js
├── 📁 backend/           # API Node.js
├── 📁 database/          # Schemas y migraciones
├── 📁 shared/            # Tipos y utilidades compartidas
├── 📁 docs/              # Documentación del proyecto
└── 📄 docker-compose.yml # Orquestación completa
```

## 🏃‍♂️ Quick Start

### Prerrequisitos
- Node.js 20+
- Docker & Docker Compose
- Git

### Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/tu-usuario/historia-filosofia.git
cd historia-filosofia
```

2. **Configurar variables de entorno**
```bash
cp .env.example .env
# Editar .env con tus configuraciones
```

3. **Iniciar con Docker**
```bash
docker-compose up -d
```

4. **Instalar dependencias y ejecutar migraciones**
```bash
npm run setup
npm run db:migrate
npm run db:seed
```

5. **Abrir la aplicación**
- Frontend: http://localhost:3000
- API: http://localhost:4000
- Admin Panel: http://localhost:3000/admin

## 📚 Documentación

- [📖 Análisis del proyecto original](./01-ANALISIS_PROYECTO_ORIGINAL.md)
- [🏗️ Arquitectura técnica](./02-ARQUITECTURA_TECNICA.md) 
- [⚙️ Especificación de funcionalidades](./03-ESPECIFICACION_FUNCIONALIDADES.md)
- [🚀 Guía de desarrollo](./docs/DEVELOPMENT.md)
- [📊 API Documentation](./docs/API.md)
- [🎨 Design System](./docs/DESIGN.md)

## 🗺️ Roadmap

### ✅ Fase 1: MVP (Meses 1-3)
- [x] Análisis y planificación completa
- [x] Arquitectura y setup del proyecto
- [ ] Timeline interactivo básico
- [ ] Sistema de conexiones visual
- [ ] Base de datos inicial (50 filósofos, 500 sentencias)

### 🎯 Fase 2: Funcionalidades Core (Meses 4-6)
- [ ] Búsqueda y filtros avanzados
- [ ] Sistema de referencias completo
- [ ] Optimización de performance
- [ ] Experiencia móvil completa

### 🌟 Fase 3: Innovación (Meses 7-9)
- [ ] Sistema colaborativo
- [ ] Visualizaciones alternativas
- [ ] Integraciones académicas
- [ ] API pública

### 🚀 Fase 4: Expansión (Meses 10-12)
- [ ] Filosofías no-occidentales
- [ ] Multiidioma
- [ ] Community features
- [ ] Monetización sostenible

## 🤝 Contribuir

Este proyecto busca ser la referencia mundial en visualización de historia de filosofía. Todas las contribuciones son bienvenidas:

- 📝 **Contenido**: Correcciones, nuevas conexiones, referencias
- 💻 **Código**: Mejoras, nuevas funcionalidades, optimizaciones
- 🎨 **Diseño**: UX/UI improvements, accesibilidad
- 📚 **Documentación**: Guías, tutoriales, traducciones

Ver [CONTRIBUTING.md](./CONTRIBUTING.md) para más detalles.

## 📄 Licencia

Este proyecto está licenciado bajo MIT License - ver [LICENSE](./LICENSE) para detalles.

## 🙏 Reconocimientos

- **Deniz Cem Önduygu** - Por su trabajo pionero en [History of Philosophy](https://www.denizcemonduygu.com/philo/)
- **Stanford Encyclopedia of Philosophy** - Por ser una fuente invaluable de contenido académico
- **Comunidad filosófica** - Por mantener vivo el diálogo milenario de ideas

## 📞 Contacto

- **GitHub Issues**: Para reportar bugs o solicitar features
- **Discussions**: Para preguntas y discusiones generales
- **Email**: [tu-email@ejemplo.com] para asuntos colaborativos

---

**"La filosofía es una batalla contra el hechizamiento de nuestra inteligencia por medio del lenguaje."** - Ludwig Wittgenstein

*Construyamos juntos la mejor herramienta para navegar este fascinante universo de ideas.*