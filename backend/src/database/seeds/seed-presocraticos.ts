import { PrismaClient } from '@prisma/client';
import { 
  presocraticoPhilosophers, 
  presocraticoStatements,
  presocraticoConnections 
} from './presocraticos';
import { periods, categories, schools } from './data';

const prisma = new PrismaClient();

async function seedPresocraticos() {
  try {
    console.log('🧹 Limpiando base de datos...');
    
    // Eliminar en orden correcto (respetando foreign keys)
    await prisma.connection.deleteMany();
    await prisma.statement.deleteMany();
    await prisma.philosopher.deleteMany();
    await prisma.school.deleteMany();
    await prisma.category.deleteMany();
    await prisma.period.deleteMany();

    console.log('✅ Base de datos limpiada\n');

    console.log('📅 Creando períodos...');
    for (const period of periods) {
      await prisma.period.create({ data: period });
    }
    console.log(`✅ ${periods.length} períodos creados\n`);

    console.log('📚 Creando categorías...');
    for (const category of categories) {
      await prisma.category.create({ data: category });
    }
    console.log(`✅ ${categories.length} categorías creadas\n`);

    console.log('🏛️ Creando escuelas filosóficas...');
    for (const school of schools) {
      await prisma.school.create({
        data: {
          name: school.name,
          slug: school.slug,
          period: {
            connect: { slug: school.periodSlug }
          }
        }
      });
    }
    console.log(`✅ ${schools.length} escuelas creadas\n`);

    console.log('👤 Creando filósofos presocráticos...');
    for (const philosopher of presocraticoPhilosophers) {
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
          school: {
            connect: { slug: philosopher.schoolSlug }
          },
          period: {
            connect: { slug: philosopher.periodSlug }
          }
        }
      });
      console.log(`  ✓ ${philosopher.name} (${philosopher.birthYear} - ${philosopher.deathYear})`);
    }
    console.log(`✅ ${presocraticoPhilosophers.length} filósofos presocráticos creados\n`);

    console.log('💭 Creando statements filosóficos...');
    let statementCount = 0;
    for (const statement of presocraticoStatements) {
      await prisma.statement.create({
        data: {
          text: statement.content,
          context: statement.context,
          philosopher: {
            connect: { slug: statement.philosopherSlug }
          },
          category: {
            connect: { slug: statement.categorySlug }
          },
          popularityScore: statement.importance
        }
      });
      statementCount++;
    }
    console.log(`✅ ${statementCount} statements creados\n`);

    console.log('🔗 Creando conexiones entre statements...');
    
    // Obtener todos los statements con sus filósofos
    const allStatements = await prisma.statement.findMany({
      include: {
        philosopher: true
      }
    });

    let connectionCount = 0;
    for (const conn of presocraticoConnections) {
      // Encontrar statements del filósofo origen y destino
      const fromStatements = allStatements.filter((s: any) => s.philosopher.slug === conn.fromSlug);
      const toStatements = allStatements.filter((s: any) => s.philosopher.slug === conn.toSlug);

      if (fromStatements.length === 0) {
        console.log(`  ⚠️  No se encontraron statements para ${conn.fromSlug}`);
        continue;
      }
      if (toStatements.length === 0) {
        console.log(`  ⚠️  No se encontraron statements para ${conn.toSlug}`);
        continue;
      }

      // Tomar el statement más importante de cada filósofo
      const fromStatement = fromStatements.sort((a: any, b: any) => b.popularityScore - a.popularityScore)[0];
      const toStatement = toStatements.sort((a: any, b: any) => b.popularityScore - a.popularityScore)[0];

      await prisma.connection.create({
        data: {
          statementFromId: fromStatement.id,
          statementToId: toStatement.id,
          connectionType: conn.type
        }
      });

      console.log(`  ✓ ${conn.fromSlug} → ${conn.toSlug} (${conn.type})`);
      connectionCount++;
    }
    console.log(`✅ ${connectionCount} conexiones creadas\n`);

    console.log('🎉 Seed de presocráticos completado exitosamente!');
    
    // Estadísticas finales
    const stats = {
      filósofos: await prisma.philosopher.count(),
      statements: await prisma.statement.count(),
      conexiones: await prisma.connection.count()
    };
    
    console.log('\n📊 Estadísticas finales:');
    console.log(`  - Filósofos: ${stats.filósofos}`);
    console.log(`  - Statements: ${stats.statements}`);
    console.log(`  - Conexiones: ${stats.conexiones}`);

  } catch (error) {
    console.error('❌ Error durante el seed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar seed
seedPresocraticos()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
