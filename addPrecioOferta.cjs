const Database = require('better-sqlite3');
const db = new Database('data.sqlite');

// Verificar si la columna precio_oferta ya existe
function columnExists() {
  const pragma = db.prepare("PRAGMA table_info(juego)").all();
  return pragma.some(col => col.name === 'precio_oferta');
}

if (!columnExists()) {
  db.prepare('ALTER TABLE juego ADD COLUMN precio_oferta REAL').run();
  console.log('Columna precio_oferta agregada a la tabla juego.');
} else {
  console.log('La columna precio_oferta ya existe.');
}

// Actualizar el precio de oferta de un juego (id=1)
const nuevoPrecioOferta = 39.99; // Cambia este valor si quieres otro precio
const gameId = 1;
const result = db.prepare('UPDATE juego SET precio_oferta = ? WHERE id = ?').run(nuevoPrecioOferta, gameId);
if (result.changes > 0) {
  console.log(`Juego con id=${gameId} actualizado con precio de oferta $${nuevoPrecioOferta}`);
} else {
  console.log(`No se encontró el juego con id=${gameId}`);
}
db.close(); 