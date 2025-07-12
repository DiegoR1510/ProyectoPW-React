const Database = require('better-sqlite3');
const db = new Database('data.sqlite');

// Limpiar tokens de email que tienen más de 24 horas
const result = db.prepare(`
  DELETE FROM email_tokens 
  WHERE created_at < datetime('now', '-24 hours')
`).run();

console.log(`Se eliminaron ${result.changes} tokens expirados de la base de datos.`);

// Mostrar tokens restantes
const remainingTokens = db.prepare('SELECT * FROM email_tokens').all();
console.log('Tokens restantes:', remainingTokens);

db.close(); 