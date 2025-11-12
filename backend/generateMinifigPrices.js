/* 
 * Script para generar precios realistas de minifiguras basado en:
 * - Cantidad de apariciones en sets (más apariciones = menor precio)
 * - Año de salida (más antiguo = más caro)
 * - Extrae año del minifig_id cuando es posible
 * 
 * Compatible con Railway y bases de datos externas
 */

require("dotenv").config();
const db = require("./db.js");

console.log("🧩 Iniciando actualización de precios de minifiguras...");

// 🔍 Función para extraer año del minifig_id (formato: FIG-YYYYXX)
function extraerAnioDeId(minifigId) {
  if (!minifigId) return null;
  
  // Busca patrón de 4 dígitos que parezcan un año (1999-2025)
  const match = minifigId.match(/(\d{4})/);
  if (match) {
    const year = parseInt(match[1]);
    if (year >= 1999 && year <= 2025) {
      return year;
    }
  }
  return null;
}

// 🧮 Función para calcular precio de minifigura
function calcularPrecioMinifigura(minifig) {
  // Precio base entre $8 y $35
  let precioBase = 15;
  
  // 📊 Factor por apariciones (entre más aparece, más barato)
  const apariciones = minifig.appearances || 1;
  let factorApariciones = 1.0;
  
  if (apariciones === 1) {
    factorApariciones = 1.8; // Muy rara, solo en 1 set
  } else if (apariciones === 2) {
    factorApariciones = 1.5;
  } else if (apariciones <= 5) {
    factorApariciones = 1.2;
  } else if (apariciones <= 10) {
    factorApariciones = 1.0;
  } else if (apariciones <= 20) {
    factorApariciones = 0.7;
  } else {
    factorApariciones = 0.5; // Muy común
  }
  
  // 📅 Factor por antigüedad
  let factorAnio = 1.0;
  const anioActual = new Date().getFullYear();
  
  if (minifig.year) {
    const antiguedad = anioActual - minifig.year;
    
    if (antiguedad >= 20) {
      factorAnio = 2.5; // Vintage (antes de 2005)
    } else if (antiguedad >= 15) {
      factorAnio = 2.0;
    } else if (antiguedad >= 10) {
      factorAnio = 1.6;
    } else if (antiguedad >= 5) {
      factorAnio = 1.3;
    } else {
      factorAnio = 1.0; // Reciente
    }
  } else {
    // Si no tiene año, dar más peso a las apariciones
    factorApariciones *= 1.5;
  }
  
  // 🎲 Agregar algo de variabilidad (+/- 15%)
  const variabilidad = 0.85 + (Math.random() * 0.3);
  
  // Cálculo final
  let precioFinal = precioBase * factorApariciones * factorAnio * variabilidad;
  
  // Límites razonables: entre $3 y $150
  precioFinal = Math.max(3, Math.min(150, precioFinal));
  
  return parseFloat(precioFinal.toFixed(2));
}

async function actualizarMinifiguras() {
  try {
    // Obtener todas las minifiguras
    const [minifiguras] = await db.execute(
      "SELECT id, minifig_id, name, year, appearances, avg_price_usd FROM minifigures"
    );
    
    console.log(`\n📦 Total de minifiguras: ${minifiguras.length}`);
    
    let actualizadas = 0;
    let conAnioAsignado = 0;
    
    for (const minifig of minifiguras) {
      let anioFinal = minifig.year;
      
      // Si no tiene año, intentar extraerlo del minifig_id
      if (!anioFinal && minifig.minifig_id) {
        const anioExtraido = extraerAnioDeId(minifig.minifig_id);
        if (anioExtraido) {
          anioFinal = anioExtraido;
          conAnioAsignado++;
          console.log(`  📅 ${minifig.name} (${minifig.minifig_id}) → año ${anioExtraido}`);
        }
      }
      
      // Calcular nuevo precio
      const datosParaCalculo = {
        ...minifig,
        year: anioFinal
      };
      
      const nuevoPrecio = calcularPrecioMinifigura(datosParaCalculo);
      
      // Actualizar en la base de datos
      if (anioFinal !== minifig.year) {
        // Actualizar año y precio
        await db.execute(
          "UPDATE minifigures SET year = ?, avg_price_usd = ? WHERE id = ?",
          [anioFinal, nuevoPrecio, minifig.id]
        );
      } else {
        // Solo actualizar precio
        await db.execute(
          "UPDATE minifigures SET avg_price_usd = ? WHERE id = ?",
          [nuevoPrecio, minifig.id]
        );
      }
      
      actualizadas++;
      
      // Mostrar progreso cada 50 minifiguras
      if (actualizadas % 50 === 0) {
        console.log(`  ⏳ Procesadas: ${actualizadas}/${minifiguras.length}`);
      }
    }
    
    console.log("\n✅ Actualización completada:");
    console.log(`  📊 Total actualizadas: ${actualizadas}`);
    console.log(`  📅 Años asignados: ${conAnioAsignado}`);
    
    // Mostrar estadísticas de precios
    const [stats] = await db.execute(`
      SELECT 
        MIN(avg_price_usd) as precio_minimo,
        MAX(avg_price_usd) as precio_maximo,
        AVG(avg_price_usd) as precio_promedio,
        COUNT(*) as total
      FROM minifigures
      WHERE avg_price_usd IS NOT NULL
    `);
    
    if (stats.length > 0) {
      console.log("\n💰 Estadísticas de precios:");
      console.log(`  Mínimo: $${stats[0].precio_minimo?.toFixed(2)}`);
      console.log(`  Máximo: $${stats[0].precio_maximo?.toFixed(2)}`);
      console.log(`  Promedio: $${stats[0].precio_promedio?.toFixed(2)}`);
    }
    
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    console.error("Stack:", error.stack);
    throw error;
  }
}

async function ejecutar() {
  let connection;
  try {
    console.log("🔌 Conectando a la base de datos...\n");
    await actualizarMinifiguras();
    console.log("\n🎯 Script finalizado exitosamente\n");
  } catch (err) {
    console.error("\n❌ Error fatal:", err);
    process.exit(1);
  } finally {
    // Cerrar pool de conexiones (compatible con Railway)
    setTimeout(() => {
      process.exit(0);
    }, 1000);
  }
}

ejecutar();