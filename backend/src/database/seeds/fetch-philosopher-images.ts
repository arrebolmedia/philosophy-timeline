import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Mapeo manual de imágenes de Wikimedia Commons para cada filósofo presocrático
const philosopherImages: Record<string, string> = {
  'tales': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Illustrerad_Verldshistoria_band_I_Ill_107.jpg/440px-Illustrerad_Verldshistoria_band_I_Ill_107.jpg',
  'anaximandro': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/Anaximander_mosaic.jpg/440px-Anaximander_mosaic.jpg',
  'anaximenes': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Anaximenes.jpg/440px-Anaximenes.jpg',
  'pitagoras': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Kapitolinischer_Pythagoras_adjusted.jpg/440px-Kapitolinischer_Pythagoras_adjusted.jpg',
  'jenofanes': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Xenophanes_in_Thomas_Stanley_The_History_of_Philosophy.jpg/440px-Xenophanes_in_Thomas_Stanley_The_History_of_Philosophy.jpg',
  'heraclito': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Heraclitus%2C_Johannes_Moreelse.jpg/440px-Heraclitus%2C_Johannes_Moreelse.jpg',
  'parmenides': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Parmenides.jpg/440px-Parmenides.jpg',
  'empedocles': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Empedocles_in_Thomas_Stanley_The_History_of_Philosophy.jpg/440px-Empedocles_in_Thomas_Stanley_The_History_of_Philosophy.jpg',
  'anaxagoras': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Anaxagoras_Lebiedzki_Rahl.jpg/440px-Anaxagoras_Lebiedzki_Rahl.jpg',
  'democrito-leucipo': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Democritus2.jpg/440px-Democritus2.jpg',
  'protagoras': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Protagoras_by_Jakob_Schlesinger.jpg/440px-Protagoras_by_Jakob_Schlesinger.jpg',
  'zenon-elea': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Zeno_of_Elea.jpg/440px-Zeno_of_Elea.jpg'
};

async function downloadImage(url: string, filepath: string): Promise<void> {
  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream'
  });

  const writer = fs.createWriteStream(filepath);
  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

async function updatePhilosopherImages() {
  try {
    console.log('🖼️  Descargando y actualizando imágenes de filósofos...\n');

    // Crear directorio para imágenes si no existe
    const imagesDir = path.join(__dirname, '../../../../frontend/public/images/philosophers');
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
      console.log(`✅ Directorio creado: ${imagesDir}\n`);
    }

    for (const [slug, imageUrl] of Object.entries(philosopherImages)) {
      try {
        // Buscar filósofo en la base de datos
        const philosopher = await prisma.philosopher.findUnique({
          where: { slug }
        });

        if (!philosopher) {
          console.log(`⚠️  Filósofo no encontrado: ${slug}`);
          continue;
        }

        // Descargar imagen
        const filename = `${slug}.jpg`;
        const filepath = path.join(imagesDir, filename);
        
        console.log(`📥 Descargando imagen de ${philosopher.name}...`);
        await downloadImage(imageUrl, filepath);
        console.log(`   ✓ Guardada en: ${filename}`);

        // Actualizar URL en la base de datos
        const imageUrlDb = `/images/philosophers/${filename}`;
        await prisma.philosopher.update({
          where: { slug },
          data: { imageUrl: imageUrlDb }
        });
        console.log(`   ✓ URL actualizada en BD: ${imageUrlDb}\n`);

      } catch (error) {
        console.error(`❌ Error con ${slug}:`, error);
      }
    }

    console.log('🎉 Proceso completado!\n');
    
    // Mostrar resumen
    const philosophersWithImages = await prisma.philosopher.count({
      where: { imageUrl: { not: null } }
    });
    console.log(`📊 Total de filósofos con imagen: ${philosophersWithImages}`);

  } catch (error) {
    console.error('❌ Error general:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar
updatePhilosopherImages();
