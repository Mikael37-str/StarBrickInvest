const mysql = require('mysql2/promise');
require('dotenv').config();

// Configuración flexible: usa DATABASE_URL o variables separadas
const config = process.env.DATABASE_URL 
  ? process.env.DATABASE_URL  // Railway o cualquier host con URL completa
  : {                          // Variables individuales (local o legacy)
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    };

const db = mysql.createPool(config);

// Test de conexión al iniciar
db.query('SELECT 1')
  .then(() => {
    const dbName = process.env.DATABASE_URL ? 'Railway' : process.env.DB_NAME;
    console.log(`✅ Conectado a MySQL (${dbName})`);
  })
  .catch(err => {
    console.error('❌ Error conectando a MySQL:', err.message);
  });

module.exports = db;