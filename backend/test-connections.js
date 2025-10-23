const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.connection.count();
  console.log('Total connections in DB:', count);
  
  if (count > 0) {
    const first = await prisma.connection.findFirst({
      include: {
        statementFrom: { include: { philosopher: true } },
        statementTo: { include: { philosopher: true } }
      }
    });
    console.log('\nFirst connection:', JSON.stringify(first, null, 2));
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
