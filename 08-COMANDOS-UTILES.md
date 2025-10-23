# 🛠️ GUÍA DE COMANDOS - Historia de la Filosofía

## 🚀 **INICIO RÁPIDO**

### **Levantar todo el proyecto:**
```powershell
# Terminal 1 - Servicios de Base de Datos
cd E:\WWW\Historia-de-la-filosofía
docker-compose up -d db redis

# Terminal 2 - Backend
cd E:\WWW\Historia-de-la-filosofía\backend
npm run dev

# Terminal 3 - Frontend
cd E:\WWW\Historia-de-la-filosofía\frontend
npm run dev
```

### **URLs de acceso:**
- 🌐 Frontend: http://localhost:3000
- 🔌 Backend API: http://localhost:5000
- 🏥 Health Check: http://localhost:5000/health
- 📊 Prisma Studio: `npm run db:studio` (desde backend/)

---

## 🗄️ **COMANDOS DE BASE DE DATOS**

### **Prisma - Migraciones:**
```powershell
cd backend

# Generar Prisma Client (después de cambios en schema)
npm run db:generate

# Crear una nueva migración
npm run db:migrate

# Push cambios sin crear migración (desarrollo)
npm run db:push

# Reset completo de la base de datos (⚠️ borra todo)
npm run db:reset

# Abrir Prisma Studio (GUI para ver datos)
npm run db:studio
```

### **Seeds - Poblar datos:**
```powershell
cd backend

# Ejecutar seeds (pobla la base de datos)
npm run db:seed

# Si necesitas re-sembrar:
# 1. Primero ejecuta el reset
npm run db:reset
# 2. Luego ejecuta el seed
npm run db:seed
```

### **Docker - Servicios:**
```powershell
cd E:\WWW\Historia-de-la-filosofía

# Ver servicios corriendo
docker-compose ps

# Iniciar servicios
docker-compose up -d db redis

# Detener servicios
docker-compose stop

# Detener y eliminar contenedores
docker-compose down

# Ver logs de un servicio
docker-compose logs -f db
docker-compose logs -f redis

# Reiniciar un servicio
docker-compose restart db
```

### **Acceso directo a PostgreSQL:**
```powershell
# Conectar a la base de datos
docker exec -it historia-de-la-filosofa-db-1 psql -U filosofia -d historia_filosofia

# Comandos útiles dentro de psql:
\dt                    # Listar todas las tablas
\d "Period"            # Describir estructura de tabla
SELECT * FROM "Philosopher" LIMIT 5;
\q                     # Salir
```

---

## 🔧 **COMANDOS DE DESARROLLO**

### **Backend:**
```powershell
cd backend

# Modo desarrollo (hot reload)
npm run dev

# Build para producción
npm run build

# Ejecutar build
npm start

# Linting
npm run lint

# Formato de código
npm run format

# Tests (cuando se implementen)
npm test
npm run test:watch
```

### **Frontend:**
```powershell
cd frontend

# Modo desarrollo
npm run dev

# Build para producción
npm run build

# Ejecutar build de producción
npm start

# Linting
npm run lint

# Formato de código
npm run format
```

---

## 📡 **COMANDOS DE API (Testing)**

### **Con PowerShell (Invoke-RestMethod):**

```powershell
# Health Check
Invoke-RestMethod -Uri "http://localhost:5000/health"

# Obtener todos los períodos
Invoke-RestMethod -Uri "http://localhost:5000/api/periods"

# Obtener todas las categorías
Invoke-RestMethod -Uri "http://localhost:5000/api/categories"

# Obtener filósofos (primeros 5)
Invoke-RestMethod -Uri "http://localhost:5000/api/philosophers?limit=5"

# Obtener un filósofo específico
Invoke-RestMethod -Uri "http://localhost:5000/api/philosophers/socrates"

# Buscar filósofos
Invoke-RestMethod -Uri "http://localhost:5000/api/search?q=platon"

# Obtener datos del timeline
Invoke-RestMethod -Uri "http://localhost:5000/api/timeline"
```

### **Con curl (si está instalado):**
```bash
# Health Check
curl http://localhost:5000/health

# Obtener períodos (formato JSON bonito)
curl http://localhost:5000/api/periods | jq

# Obtener filósofos filtrados por período
curl "http://localhost:5000/api/philosophers?period=antigua&limit=3"
```

---

## 🧹 **COMANDOS DE LIMPIEZA**

### **Limpiar node_modules y reinstalar:**
```powershell
# Backend
cd backend
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
npm install

# Frontend
cd ..\frontend
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
npm install
```

### **Limpiar builds:**
```powershell
# Backend
cd backend
Remove-Item -Recurse -Force dist

# Frontend
cd ..\frontend
Remove-Item -Recurse -Force .next
```

### **Limpiar Docker volumes (⚠️ borra datos):**
```powershell
cd E:\WWW\Historia-de-la-filosofía

# Detener y eliminar todo
docker-compose down -v

# Ver volumes
docker volume ls

# Eliminar volumes específicos
docker volume rm historia-de-la-filosofa_postgres_data
docker volume rm historia-de-la-filosofa_redis_data
```

---

## 🔍 **COMANDOS DE DEBUGGING**

### **Ver logs del backend:**
```powershell
cd backend
npm run dev
# Los logs aparecerán en la terminal
```

### **Ver logs de Docker:**
```powershell
# Ver logs en tiempo real
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f db
docker-compose logs -f redis

# Ver últimas 50 líneas
docker-compose logs --tail=50 db
```

### **Verificar conectividad:**
```powershell
# Verificar que PostgreSQL acepta conexiones
Test-NetConnection -ComputerName localhost -Port 5435

# Verificar que Redis acepta conexiones
Test-NetConnection -ComputerName localhost -Port 6380

# Verificar que el backend está corriendo
Test-NetConnection -ComputerName localhost -Port 5000

# Verificar que el frontend está corriendo
Test-NetConnection -ComputerName localhost -Port 3000
```

### **Verificar datos en la base de datos:**
```powershell
cd backend

# Abrir Prisma Studio (GUI)
npm run db:studio

# O con query directo
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.philosopher.count().then(count => {
  console.log('Total filósofos:', count);
  prisma.\$disconnect();
});
"
```

---

## 📦 **COMANDOS DE INSTALACIÓN DE DEPENDENCIAS**

### **Backend:**
```powershell
cd backend

# Instalar una nueva dependencia
npm install <package-name>

# Instalar dependencia de desarrollo
npm install -D <package-name>

# Ejemplos:
npm install express-validator
npm install -D @types/express-validator
```

### **Frontend:**
```powershell
cd frontend

# Instalar componente de Shadcn/ui
npx shadcn-ui@latest add <component-name>

# Ejemplos:
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu

# Instalar otras dependencias
npm install <package-name>
```

---

## 🚢 **COMANDOS DE PRODUCCIÓN (Futuro)**

### **Build completo:**
```powershell
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
npm start
```

### **Docker Compose para producción:**
```powershell
# Usar el perfil de producción
docker-compose --profile production up -d

# O construir imágenes custom
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

---

## 🆘 **TROUBLESHOOTING**

### **Puerto ya en uso:**
```powershell
# Ver qué proceso usa el puerto 5000
Get-NetTCPConnection -LocalPort 5000 | Select-Object -Property LocalPort, OwningProcess
Get-Process -Id <PID>

# Matar proceso
Stop-Process -Id <PID> -Force
```

### **Error de Prisma Client:**
```powershell
cd backend

# Re-generar el cliente
npm run db:generate

# Si persiste, reinstalar
Remove-Item -Recurse -Force node_modules/@prisma
npm install
npm run db:generate
```

### **Error de permisos en Docker:**
```powershell
# Reiniciar Docker Desktop
# O desde PowerShell como admin:
Restart-Service docker
```

### **Frontend no se actualiza:**
```powershell
cd frontend

# Limpiar .next y reinstalar
Remove-Item -Recurse -Force .next
npm run dev
```

---

## 📝 **SHORTCUTS Y ALIASES ÚTILES**

### **Crear aliases en PowerShell Profile:**
```powershell
# Abrir tu perfil de PowerShell
notepad $PROFILE

# Agregar estos aliases:
function StartPhilosophy {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd E:\WWW\Historia-de-la-filosofía; docker-compose up -d db redis"
    Start-Sleep 2
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd E:\WWW\Historia-de-la-filosofía\backend; npm run dev"
    Start-Sleep 2
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd E:\WWW\Historia-de-la-filosofía\frontend; npm run dev"
}

function StopPhilosophy {
    cd E:\WWW\Historia-de-la-filosofía
    docker-compose stop
}

# Usar: StartPhilosophy o StopPhilosophy
```

---

## ✅ **CHECKLIST DE INICIO DE SESIÓN**

```markdown
1. [ ] Docker Desktop está corriendo
2. [ ] Servicios levantados: docker-compose up -d db redis
3. [ ] Backend corriendo: cd backend && npm run dev
4. [ ] Frontend corriendo: cd frontend && npm run dev
5. [ ] Verificar: http://localhost:3000
6. [ ] Verificar: http://localhost:5000/health
```

---

## 🔗 **LINKS ÚTILES**

- 📖 Documentación Next.js: https://nextjs.org/docs
- 🔷 Documentación Prisma: https://www.prisma.io/docs
- 🎨 Shadcn/ui Components: https://ui.shadcn.com
- 🐘 Documentación PostgreSQL: https://www.postgresql.org/docs
- 🐳 Docker Compose: https://docs.docker.com/compose

---

**💡 TIP:** Guarda este archivo como referencia rápida durante el desarrollo.
