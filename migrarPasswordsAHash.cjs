const Database = require('better-sqlite3');
const bcrypt = require('bcrypt');

const db = new Database('data.sqlite');

// Selecciona todos los usuarios
const usuarios = db.prepare('SELECT id, password FROM usuario').all();

let actualizados = 0;
for (const u of usuarios) {
  // Si la contraseña ya parece un hash bcrypt, la saltamos
  if (typeof u.password === 'string' && u.password.startsWith('$2b$')) continue;
  // Si no, la hasheamos y actualizamos
  const hash = bcrypt.hashSync(u.password, 10);
  db.prepare('UPDATE usuario SET password = ? WHERE id = ?').run(hash, u.id);
  actualizados++;
}

console.log(`Contraseñas migradas a hash: ${actualizados}`);
db.close(); 