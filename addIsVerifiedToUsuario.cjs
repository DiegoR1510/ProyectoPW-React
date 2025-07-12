const Database = require('better-sqlite3');
const db = new Database('data.sqlite');

try {
  db.prepare('ALTER TABLE usuario ADD COLUMN is_verified INTEGER DEFAULT 0').run();
  console.log('Columna is_verified agregada a usuario.');
} catch (e) {
  console.log('Columna is_verified ya existe en usuario.');
}
db.close(); 