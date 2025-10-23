import { PrismaClient } from '@prisma/client';
import { periods, categories, schools, philosophers } from './data';
import { statements as extendedStatements, connections as extendedConnections } from './statements';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando proceso de sembrado...\n');

  try {
    // Limpiar datos existentes (en orden para evitar problemas de claves foráneas)
    console.log('🧹 Limpiando base de datos...');
    await prisma.statementTag.deleteMany({});
    await prisma.statementReference.deleteMany({});
    await prisma.connection.deleteMany({});
    await prisma.statement.deleteMany({});
    await prisma.reference.deleteMany({});
    await prisma.tag.deleteMany({});
    await prisma.philosopher.deleteMany({});
    await prisma.school.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.period.deleteMany({});
    console.log('✅ Base de datos limpia\n');

    // Sembrar períodos
    console.log('📅 Sembrando períodos históricos...');
    const createdPeriods = await Promise.all(
      periods.map(period =>
        prisma.period.create({
          data: period
        })
      )
    );
    console.log(`✅ ${createdPeriods.length} períodos creados\n`);

    // Sembrar categorías
    console.log('📚 Sembrando categorías filosóficas...');
    const createdCategories = await Promise.all(
      categories.map(category =>
        prisma.category.create({
          data: category
        })
      )
    );
    console.log(`✅ ${createdCategories.length} categorías creadas\n`);

    // Crear mapas para búsqueda rápida
    const periodMap = new Map(
      createdPeriods.map(p => [p.slug, p.id])
    );
    const schoolMap = new Map<string, number>();

    // Sembrar escuelas
    console.log('🏛️ Sembrando escuelas filosóficas...');
    for (const school of schools) {
      const periodId = periodMap.get(school.periodSlug);
      if (!periodId) {
        console.warn(`⚠️ Período no encontrado para escuela: ${school.name}`);
        continue;
      }
      
      const created = await prisma.school.create({
        data: {
          name: school.name,
          slug: school.slug,
          periodId
        }
      });
      schoolMap.set(school.slug, created.id);
    }
    console.log(`✅ ${schoolMap.size} escuelas creadas\n`);

    // Sembrar filósofos
    console.log('👤 Sembrando filósofos...');
    let philosopherCount = 0;
    for (const philosopher of philosophers) {
      const periodId = periodMap.get(philosopher.periodSlug);
      if (!periodId) {
        console.warn(`⚠️ Período no encontrado para filósofo: ${philosopher.name}`);
        continue;
      }

      const schoolId = philosopher.schoolSlug 
        ? schoolMap.get(philosopher.schoolSlug)
        : null;

      await prisma.philosopher.create({
        data: {
          name: philosopher.name,
          slug: philosopher.slug,
          birthYear: philosopher.birthYear,
          deathYear: philosopher.deathYear,
          nationality: philosopher.nationality,
          bioShort: philosopher.bioShort,
          bioLong: philosopher.bioLong,
          wikipediaUrl: philosopher.wikipediaUrl,
          periodId,
          schoolId
        }
      });
      philosopherCount++;
      console.log(`  ✓ ${philosopher.name} (${philosopher.birthYear} - ${philosopher.deathYear})`);
    }
    console.log(`✅ ${philosopherCount} filósofos creados\n`);

    // Agregar declaraciones extendidas para múltiples filósofos
    console.log('💬 Sembrando declaraciones extendidas...');
    const statementMap = new Map<string, number>();
    let statementCount = 0;

    for (const stmtData of extendedStatements) {
      const philosopher = await prisma.philosopher.findUnique({
        where: { slug: stmtData.philosopherSlug }
      });
      const category = await prisma.category.findUnique({
        where: { slug: stmtData.categorySlug }
      });

      if (philosopher && category) {
        const statement = await prisma.statement.create({
          data: {
            text: stmtData.text,
            philosopherId: philosopher.id,
            categoryId: category.id,
            isDirectQuote: stmtData.isDirectQuote,
            xPosition: Math.random() * 800 + 100,
            yPosition: Math.random() * 600 + 100,
            difficultyLevel: stmtData.difficultyLevel,
            popularityScore: stmtData.popularityScore,
            orderInTimeline: statementCount + 1
          }
        });

        // Guardar en map para crear conexiones después
        const key = `${stmtData.philosopherSlug}:${stmtData.text.substring(0, 30)}`;
        statementMap.set(key, statement.id);
        statementCount++;
      }
    }
    console.log(`✅ ${statementCount} declaraciones extendidas creadas\n`);

    // Crear conexiones entre declaraciones
    console.log('� Creando conexiones filosóficas...');
    let connectionCount = 0;

    for (const connData of extendedConnections) {
      const fromKey = `${connData.from.philosopher}:${connData.from.text.substring(0, 30)}`;
      const toKey = `${connData.to.philosopher}:${connData.to.text.substring(0, 30)}`;

      const fromId = statementMap.get(fromKey);
      const toId = statementMap.get(toKey);

      if (fromId && toId) {
        await prisma.connection.create({
          data: {
            statementFromId: fromId,
            statementToId: toId,
            connectionType: connData.type,
            strength: connData.strength
          }
        });
        connectionCount++;
      }
    }
    console.log(`✅ ${connectionCount} conexiones creadas\n`);

    // Agregar algunas declaraciones de ejemplo para Sócrates
    console.log('💬 Sembrando declaraciones adicionales para Sócrates...');
    const socrates = await prisma.philosopher.findUnique({
      where: { slug: 'socrates' }
    });
    const epistemologia = await prisma.category.findUnique({
      where: { slug: 'epistemologia' }
    });
    const etica = await prisma.category.findUnique({
      where: { slug: 'etica' }
    });

    if (socrates && epistemologia && etica) {
      const statement1 = await prisma.statement.create({
        data: {
          text: 'Sólo sé que no sé nada',
          philosopherId: socrates.id,
          categoryId: epistemologia.id,
          isDirectQuote: true,
          xPosition: 100,
          yPosition: 100,
          difficultyLevel: 2,
          popularityScore: 100,
          orderInTimeline: 1
        }
      });

      await prisma.statement.create({
        data: {
          text: 'Una vida sin examen no merece ser vivida',
          philosopherId: socrates.id,
          categoryId: etica.id,
          isDirectQuote: true,
          xPosition: 150,
          yPosition: 120,
          difficultyLevel: 2,
          popularityScore: 95,
          orderInTimeline: 2
        }
      });

      const statement3 = await prisma.statement.create({
        data: {
          text: 'El conocimiento verdadero viene del interior, no de la enseñanza externa',
          philosopherId: socrates.id,
          categoryId: epistemologia.id,
          isDirectQuote: false,
          xPosition: 125,
          yPosition: 140,
          difficultyLevel: 3,
          popularityScore: 85,
          orderInTimeline: 3
        }
      });

      // Crear conexión entre declaraciones
      await prisma.connection.create({
        data: {
          statementFromId: statement1.id,
          statementToId: statement3.id,
          connectionType: 'expansion',
          strength: 4
        }
      });

      console.log('✅ 3 declaraciones de ejemplo creadas para Sócrates\n');
    }

    // Agregar tags de ejemplo
    console.log('🏷️ Sembrando tags...');
    const tagNames = [
      { name: 'Epistemología', type: 'tema' },
      { name: 'Ética', type: 'tema' },
      { name: 'Método Socrático', type: 'concepto' },
      { name: 'Virtud', type: 'concepto' },
      { name: 'Conocimiento', type: 'concepto' },
      { name: 'Diálogo', type: 'método' },
      { name: 'Mayéutica', type: 'método' }
    ];

    const createdTags = await Promise.all(
      tagNames.map(tag =>
        prisma.tag.create({
          data: {
            name: tag.name,
            slug: tag.name.toLowerCase().replace(/\s+/g, '-'),
            type: tag.type
          }
        })
      )
    );
    console.log(`✅ ${createdTags.length} tags creados\n`);

    console.log('✨ Proceso de sembrado completado con éxito!\n');
    console.log('📊 Resumen:');
    console.log(`   - ${createdPeriods.length} períodos`);
    console.log(`   - ${createdCategories.length} categorías`);
    console.log(`   - ${schoolMap.size} escuelas`);
    console.log(`   - ${philosopherCount} filósofos`);
    console.log(`   - ${statementCount + 3} declaraciones totales`);
    console.log(`   - ${connectionCount + 1} conexiones filosóficas`);
    console.log(`   - ${createdTags.length} tags\n`);

  } catch (error) {
    console.error('❌ Error durante el sembrado:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
