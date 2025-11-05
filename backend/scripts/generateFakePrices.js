/* Script para generar precios ficticios realistas basandose en año de emisión y cantidad de piezas*/

require("dotenv").config();
const db = require("../db.js");

console.log("🧩 Iniciando actualización de precios ficticios...");

// 🧮 Función para calcular precios estimados
function calcularPrecio(item, tipo) {
  let basePrice;

  if (tipo === "set") {
    basePrice = Math.max(5, (item.pieces || 80) * 0.1);
  } else {
    // minifig
    basePrice = Math.random() * (25 - 5) + 5;
  }

  let finalPrice = basePrice;

  // Aumentos por rareza o antigüedad
  if (item.retired === 1) finalPrice *= 1.4;
  if (item.year && item.year < 2015) finalPrice *= 1.2;

  return parseFloat(finalPrice.toFixed(2));
}

async function actualizarPreciosSets() {
  const [sets] = await db.query("SELECT id, name, pieces, year, retired FROM sets");
  console.log(`🔹 ${sets.length} registros en 'sets'`);

  for (const set of sets) {
    const nuevoPrecio = calcularPrecio(set, "set");
    await db.query("UPDATE sets SET price_usd = ? WHERE id = ?", [nuevoPrecio, set.id]);
  }

  console.log("✅ Precios actualizados en 'sets' correctamente.");
}

async function actualizarPreciosMinifigures() {
  const [figs] = await db.query("SELECT id, name, year FROM minifigures");
  console.log(`🔹 ${figs.length} registros en 'minifigures'`);

  for (const fig of figs) {
    const nuevoPrecio = calcularPrecio(fig, "minifig");
    await db.query(
      "UPDATE minifigures SET estimated_value_usd = ? WHERE id = ?",
      [nuevoPrecio, fig.id]
    );
  }

  console.log("✅ Precios actualizados en 'minifigures' correctamente.");
}

async function generarPrecios() {
  try {
    await actualizarPreciosSets();
    await actualizarPreciosMinifigures();
    console.log("🎯 Todos los precios ficticios fueron generados correctamente.");
  } catch (err) {
    console.error("❌ Error al generar precios:", err);
  } finally {
    await db.end();
    process.exit(0);
  }
}

generarPrecios();
