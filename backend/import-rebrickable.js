const mysql = require('mysql2/promise');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// ============================================
// CONFIGURACIÓN
// ============================================
const REBRICKABLE_API_KEY = '30cdea815ea9174628784b4287d3ce1e'; 
const STAR_WARS_THEME_ID = 158;
const BATCH_SIZE = 50; // Importar de a 50 para no saturar

// ============================================
// CONEXIÓN A LA BASE DE DATOS
// ============================================
async function createConnection() {
  return await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });
}

// ============================================
// ADAPTADOR DE DATOS
// ============================================
function adaptSetToYourSchema(rebrickableSet) {
  return {
    set_id: rebrickableSet.set_num,
    name: rebrickableSet.name,
    year: rebrickableSet.year,
    pieces: rebrickableSet.num_parts,
    image: rebrickableSet.set_img_url,
    retired: rebrickableSet.year < 2020 ? 1 : 0, // Sets antes de 2020 = retirados
    price_usd: null // Rebrickable no tiene precios, puedes usar otra API después
  };
}

function adaptMinifigToYourSchema(rebrickableMinifig) {
  return {
    minifig_id: rebrickableMinifig.set_num,
    name: rebrickableMinifig.name,
    year: rebrickableMinifig.year || null,
    appearances: rebrickableMinifig.num_parts || 0,
    image: rebrickableMinifig.set_img_url,
    avg_price_usd: null
  };
}

// ============================================
// IMPORTAR SETS DE STAR WARS
// ============================================
async function importStarWarsSets(connection) {
  console.log('\n🚀 Importando Sets de Star Wars...\n');
  
  let page = 1;
  let totalImported = 0;
  let hasMore = true;

  while (hasMore) {
    try {
      const url = `https://rebrickable.com/api/v3/lego/sets/?key=${REBRICKABLE_API_KEY}&theme_id=${STAR_WARS_THEME_ID}&page=${page}&page_size=${BATCH_SIZE}`;
      
      console.log(`📦 Descargando página ${page}...`);
      const response = await axios.get(url);
      const sets = response.data.results;

      if (!sets || sets.length === 0) {
        hasMore = false;
        break;
      }

      // Insertar en batch
      for (const set of sets) {
        const adaptedSet = adaptSetToYourSchema(set);
        
        try {
          await connection.execute(
            `INSERT INTO sets (set_id, name, year, pieces, image, retired, price_usd)
             VALUES (?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE 
               name = VALUES(name),
               year = VALUES(year),
               pieces = VALUES(pieces),
               image = VALUES(image),
               retired = VALUES(retired)`,
            [
              adaptedSet.set_id,
              adaptedSet.name,
              adaptedSet.year,
              adaptedSet.pieces,
              adaptedSet.image,
              adaptedSet.retired,
              adaptedSet.price_usd
            ]
          );
          
          totalImported++;
          console.log(`  ✅ ${totalImported}. ${adaptedSet.name} (${adaptedSet.set_id})`);
        } catch (error) {
          console.error(`  ❌ Error en ${adaptedSet.set_id}:`, error.message);
        }
      }

      hasMore = response.data.next !== null;
      page++;

      // Delay para no saturar la API
      await new Promise(resolve => setTimeout(resolve, 500));

    } catch (error) {
      console.error(`❌ Error en página ${page}:`, error.message);
      hasMore = false;
    }
  }

  console.log(`\n✅ Total sets importados: ${totalImported}\n`);
  return totalImported;
}

// ============================================
// IMPORTAR MINIFIGURAS DE STAR WARS
// ============================================
async function importStarWarsMinifigs(connection) {
  console.log('\n🚀 Importando Minifiguras de Star Wars...\n');
  
  let page = 1;
  let totalImported = 0;
  let hasMore = true;

  while (hasMore) {
    try {
      const url = `https://rebrickable.com/api/v3/lego/minifigs/?key=${REBRICKABLE_API_KEY}&in_theme_id=${STAR_WARS_THEME_ID}&page=${page}&page_size=${BATCH_SIZE}`;
      
      console.log(`🧑 Descargando página ${page}...`);
      const response = await axios.get(url);
      const minifigs = response.data.results;

      if (!minifigs || minifigs.length === 0) {
        hasMore = false;
        break;
      }

      for (const minifig of minifigs) {
        const adaptedMinifig = adaptMinifigToYourSchema(minifig);
        
        try {
          await connection.execute(
            `INSERT INTO minifigures (minifig_id, name, year, appearances, image, avg_price_usd)
             VALUES (?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE 
               name = VALUES(name),
               year = VALUES(year),
               appearances = VALUES(appearances),
               image = VALUES(image)`,
            [
              adaptedMinifig.minifig_id,
              adaptedMinifig.name,
              adaptedMinifig.year,
              adaptedMinifig.appearances,
              adaptedMinifig.image,
              adaptedMinifig.avg_price_usd
            ]
          );
          
          totalImported++;
          console.log(`  ✅ ${totalImported}. ${adaptedMinifig.name} (${adaptedMinifig.minifig_id})`);
        } catch (error) {
          console.error(`  ❌ Error en ${adaptedMinifig.minifig_id}:`, error.message);
        }
      }

      hasMore = response.data.next !== null;
      page++;

      await new Promise(resolve => setTimeout(resolve, 500));

    } catch (error) {
      console.error(`❌ Error en página ${page}:`, error.message);
      hasMore = false;
    }
  }

  console.log(`\n✅ Total minifiguras importadas: ${totalImported}\n`);
  return totalImported;
}

// ============================================
// AÑADIR ÍNDICES PARA MEJORAR BÚSQUEDAS
// ============================================
async function addIndexes(connection) {
  console.log('\n🔧 Añadiendo índices para optimización...\n');
  
  const indexes = [
    'CREATE INDEX IF NOT EXISTS idx_sets_name ON sets(name)',
    'CREATE INDEX IF NOT EXISTS idx_sets_year ON sets(year)',
    'CREATE INDEX IF NOT EXISTS idx_sets_set_id ON sets(set_id)',
    'CREATE INDEX IF NOT EXISTS idx_minifigs_name ON minifigures(name)',
    'CREATE INDEX IF NOT EXISTS idx_minifigs_year ON minifigures(year)',
    'CREATE INDEX IF NOT EXISTS idx_minifigs_minifig_id ON minifigures(minifig_id)'
  ];

  for (const indexQuery of indexes) {
    try {
      await connection.execute(indexQuery);
      console.log(`  ✅ Índice creado`);
    } catch (error) {
      console.log(`  ⚠️  Índice ya existe o error: ${error.message}`);
    }
  }
}

// ============================================
// FUNCIÓN PRINCIPAL
// ============================================
async function main() {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║  IMPORTADOR DE DATOS REBRICKABLE → TU BD  ║');
  console.log('╚════════════════════════════════════════════╝');

  if (REBRICKABLE_API_KEY === 'TU_API_KEY_AQUI') {
    console.error('\n❌ ERROR: Debes configurar tu API Key de Rebrickable');
    console.log('\n📝 Pasos:');
    console.log('   1. Ve a https://rebrickable.com/api/');
    console.log('   2. Regístrate gratis');
    console.log('   3. Obtén tu API Key');
    console.log('   4. Reemplaza "TU_API_KEY_AQUI" en este script\n');
    process.exit(1);
  }

  let connection;
  
  try {
    // Conectar a la base de datos
    console.log('\n🔌 Conectando a la base de datos...');
    connection = await createConnection();
    console.log('✅ Conectado exitosamente\n');

    // Importar sets
    const totalSets = await importStarWarsSets(connection);

    // Importar minifiguras
    const totalMinifigs = await importStarWarsMinifigs(connection);

    // Añadir índices
    await addIndexes(connection);

    // Resumen final
    console.log('\n╔════════════════════════════════════════════╗');
    console.log('║           IMPORTACIÓN COMPLETADA           ║');
    console.log('╚════════════════════════════════════════════╝');
    console.log(`\n📦 Sets importados: ${totalSets}`);
    console.log(`🧑 Minifiguras importadas: ${totalMinifigs}`);
    console.log(`📊 Total items: ${totalSets + totalMinifigs}\n`);
    console.log('✅ Tu base de datos ahora tiene todo el catálogo de Star Wars!\n');

  } catch (error) {
    console.error('\n❌ ERROR FATAL:', error.message);
    console.error(error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Desconectado de la base de datos\n');
    }
  }
}

// ============================================
// EJECUTAR
// ============================================
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { importStarWarsSets, importStarWarsMinifigs };