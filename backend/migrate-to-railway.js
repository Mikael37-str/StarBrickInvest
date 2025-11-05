const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrate() {
  console.log('🚀 Iniciando migración a Railway...\n');

  // Conexión LOCAL (XAMPP)
  const localDB = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'lego_db',
    multipleStatements: true
  });

  // Conexión RAILWAY
  const RAILWAY_URL = 'mysql://root:ycrFKllFAzEwjJALyrbAvbkAWRFOrfkD@interchange.proxy.rlwy.net:43746/railway';
  const remoteDB = await mysql.createConnection(RAILWAY_URL);

  console.log('✅ Conectado a ambas bases de datos\n');

  try {
    // Obtener lista de tablas
    const [tables] = await localDB.query('SHOW TABLES');
    console.log(`📋 Tablas encontradas: ${tables.length}\n`);

    // ORDEN CORRECTO: tablas padre primero, luego tablas con foreign keys
    const tableOrder = [
      'users',           // Sin dependencias
      'sets',            // Sin dependencias
      'minifigures',     // Sin dependencias
      'articles',        // Sin dependencias
      'collections',     // Depende de users, sets, minifigures
      'favorites',       // Depende de users
      'transactions'     // Depende de users
    ];

    // Filtrar solo las tablas que existen
    const tablesToMigrate = tableOrder.filter(tableName => 
      tables.some(t => Object.values(t)[0] === tableName)
    );

    // Agregar tablas que no están en el orden predefinido
    tables.forEach(table => {
      const tableName = Object.values(table)[0];
      if (!tablesToMigrate.includes(tableName)) {
        tablesToMigrate.push(tableName);
      }
    });

    console.log(`📋 Orden de migración: ${tablesToMigrate.join(', ')}\n`);

    for (const tableName of tablesToMigrate) {
      console.log(`📦 Migrando tabla: ${tableName}`);

      // Obtener estructura CREATE TABLE
      const [createResult] = await localDB.query(`SHOW CREATE TABLE \`${tableName}\``);
      let createSQL = createResult[0]['Create Table'];

      // CORRECCIONES AVANZADAS
      
      // 1. Reemplazar DEFAULT curdate() y current_timestamp()
      createSQL = createSQL.replace(/DEFAULT curdate\(\)/gi, 'DEFAULT NULL');
      createSQL = createSQL.replace(/DEFAULT current_timestamp\(\)/gi, 'DEFAULT CURRENT_TIMESTAMP');
      
      // 2. Corregir PRIMARY KEY con backticks mal posicionados
      // De: PRIMARY KEY `id`),  A: PRIMARY KEY (`id`)
      createSQL = createSQL.replace(/PRIMARY KEY [`']([^`']+)[`']\)/g, 'PRIMARY KEY (`$1`)');
      
      // 3. Corregir KEY/INDEX con backticks mal posicionados
      // De: KEY `user_id` `user_id`),  A: KEY `user_id` (`user_id`)
      createSQL = createSQL.replace(/KEY [`']([^`']+)[`'] [`']([^`']+)[`']\)/g, 'KEY `$1` (`$2`)');
      
      // 4. Corregir UNIQUE KEY
      createSQL = createSQL.replace(/UNIQUE KEY [`']([^`']+)[`'] [`']([^`']+)[`']\)/g, 'UNIQUE KEY `$1` (`$2`)');
      
      // 5. Corregir FOREIGN KEY complejos
      // De: FOREIGN KEY `user_id`) REFERENCES `users` `id`)
      // A: FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
      createSQL = createSQL.replace(/FOREIGN KEY [`']([^`']+)[`']\)/g, 'FOREIGN KEY (`$1`)');
      createSQL = createSQL.replace(/REFERENCES [`']([^`']+)[`'] [`']([^`']+)[`']\)/g, 'REFERENCES `$1` (`$2`)');

      // Eliminar tabla si existe y crearla
      await remoteDB.query(`DROP TABLE IF EXISTS \`${tableName}\``);
      
      try {
        await remoteDB.query(createSQL);
        console.log(`  ✅ Estructura creada`);
      } catch (createError) {
        console.error(`  ❌ Error al crear tabla ${tableName}:`, createError.message);
        console.log('  📝 SQL generado:\n', createSQL);
        throw createError;
      }

      // Copiar datos
      const [rows] = await localDB.query(`SELECT * FROM \`${tableName}\``);
      
      if (rows.length > 0) {
        console.log(`  📊 Copiando ${rows.length} registros...`);
        
        const columns = Object.keys(rows[0]);
        const placeholders = columns.map(() => '?').join(',');
        const insertSQL = `INSERT INTO \`${tableName}\` (\`${columns.join('\`,\`')}\`) VALUES (${placeholders})`;

        let successCount = 0;
        let errorCount = 0;

        for (const row of rows) {
          const values = columns.map(col => row[col]);
          try {
            await remoteDB.query(insertSQL, values);
            successCount++;
          } catch (insertError) {
            errorCount++;
            console.error(`  ⚠️  Error insertando fila:`, insertError.message);
          }
        }
        
        console.log(`  ✅ ${successCount} registros copiados${errorCount > 0 ? ` (${errorCount} errores)` : ''}\n`);
      } else {
        console.log(`  ⚠️  Tabla vacía\n`);
      }
    }

    console.log('╔═══════════════════════════════════════╗');
    console.log('║     🎉 MIGRACIÓN COMPLETADA 🎉        ║');
    console.log('╚═══════════════════════════════════════╝\n');

    // Verificar datos migrados
    try {
      const [remoteCount] = await remoteDB.query(`
        SELECT 
          (SELECT COUNT(*) FROM users) as users,
          (SELECT COUNT(*) FROM sets) as sets,
          (SELECT COUNT(*) FROM minifigures) as minifigures,
          (SELECT COUNT(*) FROM articles) as articles
      `);
      
      console.log('📊 Datos en Railway:');
      console.log(`   Users: ${remoteCount[0].users}`);
      console.log(`   Sets: ${remoteCount[0].sets}`);
      console.log(`   Minifigures: ${remoteCount[0].minifigures}`);
      console.log(`   Articles: ${remoteCount[0].articles}\n`);
    } catch (countError) {
      console.log('⚠️  No se pudo verificar conteo (algunas tablas pueden no existir)\n');
    }

  } catch (error) {
    console.error('❌ Error durante la migración:', error.message);
    console.error(error);
  } finally {
    await localDB.end();
    await remoteDB.end();
    console.log('🔌 Desconectado de las bases de datos');
  }
}

migrate().catch(console.error);