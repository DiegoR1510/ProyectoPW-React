const Database = require('better-sqlite3');
const db = new Database('data.sqlite');

const token = '5ea929fdca2f8894df7407a5ca196cb124631427546e015c9f14e865c9d88fa9';
const row = db.prepare("SELECT * FROM email_tokens WHERE token = ? AND type = 'verify'").get(token);

if (row) {
  console.log('Token encontrado:', row);
} else {
  console.log('No se encontró el token.');
} 