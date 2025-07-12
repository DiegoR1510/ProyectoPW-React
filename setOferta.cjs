const Database = require('better-sqlite3');
const db = new Database('data.sqlite');

const gameId = 1; // Cambia este valor si quieres marcar otro juego
const result = db.prepare('UPDATE juego SET esta_oferta = 1 WHERE id = ?').run(gameId);

if (result.changes > 0) {
  console.log(`Juego con id=${gameId} marcado como oferta.`);
} else {
  console.log(`No se encontró el juego con id=${gameId} o ya estaba en oferta.`);
}
db.close(); 