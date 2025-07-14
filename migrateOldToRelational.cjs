const Database = require('better-sqlite3');
const db = new Database('data.sqlite');

// 1. Migrar juegos
const oldGames = db.prepare('SELECT * FROM games').all();
for (const g of oldGames) {
  // Insertar en juego
  db.prepare(`INSERT OR IGNORE INTO juego (id, nombre, precio, categoria_id, esta_oferta, estado, image, trailer) VALUES (?, ?, ?, NULL, 0, 1, ?, ?)`).run(
    g.id, g.title, g.price, g.image || '', g.trailer || ''
  );
  // Insertar plataformas (si existen)
  if (g.platform) {
    let platforms;
    try { platforms = JSON.parse(g.platform); } catch { platforms = []; }
    for (const plat of platforms) {
      // Insertar plataforma si no existe
      let platRow = db.prepare('SELECT id FROM plataforma WHERE nombre = ?').get(plat);
      if (!platRow) {
        db.prepare('INSERT INTO plataforma (nombre) VALUES (?)').run(plat);
        platRow = db.prepare('SELECT id FROM plataforma WHERE nombre = ?').get(plat);
      }
      // Relacionar juego-plataforma
      db.prepare('INSERT OR IGNORE INTO juego_plataforma (juego_id, plataforma_id) VALUES (?, ?)').run(g.id, platRow.id);
    }
  }
  // Insertar categoría (si existe en genre)
  if (g.genre) {
    let genres;
    try { genres = JSON.parse(g.genre); } catch { genres = []; }
    if (genres.length > 0) {
      // Solo la primera como categoría principal
      let catRow = db.prepare('SELECT id FROM categoria WHERE nombre = ?').get(genres[0]);
      if (!catRow) {
        db.prepare('INSERT INTO categoria (nombre) VALUES (?)').run(genres[0]);
        catRow = db.prepare('SELECT id FROM categoria WHERE nombre = ?').get(genres[0]);
      }
      db.prepare('UPDATE juego SET categoria_id = ? WHERE id = ?').run(catRow.id, g.id);
    }
  }
}
console.log('Juegos migrados.');

// 2. Migrar usuarios
const oldUsers = db.prepare('SELECT * FROM usuario').all();
for (const u of oldUsers) {
  db.prepare(`INSERT OR IGNORE INTO usuario (id, correo, password, nombre, token, estado, is_verified) VALUES (?, ?, ?, ?, NULL, 1, ?)`).run(
    u.id, u.correo || u.nombre + '@mail.com', u.password, u.nombre, u.is_verified || 1
  );
}
console.log('Usuarios migrados.');

// 3. Migrar reviews (del campo reviews de games)
for (const g of oldGames) {
  let reviews;
  try { reviews = JSON.parse(g.reviews); } catch { reviews = []; }
  if (Array.isArray(reviews)) {
    for (const r of reviews) {
      // Buscar usuario por nombre (si existe)
      let userRow = db.prepare('SELECT id FROM usuario WHERE nombre = ?').get(r.user);
      if (!userRow) {
        // Insertar usuario dummy si no existe
        db.prepare('INSERT INTO usuario (nombre, correo, password, estado, is_verified) VALUES (?, ?, ?, 1, 1)').run(r.user, r.user + '@mail.com', '1234');
        userRow = db.prepare('SELECT id FROM usuario WHERE nombre = ?').get(r.user);
      }
      db.prepare('INSERT INTO calificacion (valoracion, comentario, juego_id, usuario_id) VALUES (?, ?, ?, ?)').run(
        r.rating, r.comment, g.id, userRow.id
      );
    }
  }
}
console.log('Reviews migradas.');
db.close();
console.log('¡Migración completa!'); 