const Database = require('better-sqlite3');
const db = new Database('data.sqlite');

// 1. Agregar columnas si no existen
try {
  db.prepare('ALTER TABLE juego ADD COLUMN image TEXT').run();
  console.log('Columna image agregada a juego.');
} catch (e) { console.log('Columna image ya existe.'); }
try {
  db.prepare('ALTER TABLE juego ADD COLUMN trailer TEXT').run();
  console.log('Columna trailer agregada a juego.');
} catch (e) { console.log('Columna trailer ya existe.'); }

// 2. Migrar datos desde games
const oldGames = db.prepare('SELECT id, image, trailer FROM games').all();
for (const g of oldGames) {
  db.prepare('UPDATE juego SET image = ?, trailer = ? WHERE id = ?').run(g.image, g.trailer, g.id);
}
console.log('Datos de imagen y trailer migrados a juego.');
db.close(); 