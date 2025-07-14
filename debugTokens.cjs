const Database = require('better-sqlite3');
const db = new Database('data.sqlite');

console.log('=== DIAGNÓSTICO DE TOKENS ===\n');

// Verificar estructura de la tabla
console.log('1. Estructura de la tabla email_tokens:');
const tableInfo = db.prepare("PRAGMA table_info(email_tokens)").all();
console.log(tableInfo);

// Verificar todos los tokens
console.log('\n2. Todos los tokens en la base de datos:');
const allTokens = db.prepare('SELECT * FROM email_tokens').all();
console.log(allTokens);

// Verificar usuarios
console.log('\n3. Usuarios en la base de datos:');
const users = db.prepare('SELECT id, nombre, correo, is_verified FROM usuario').all();
console.log(users);

// Verificar si hay tokens de verificación
console.log('\n4. Tokens de verificación:');
const verifyTokens = db.prepare("SELECT * FROM email_tokens WHERE type = 'verify'").all();
console.log(verifyTokens);

// Verificar si hay tokens de reset
console.log('\n5. Tokens de reset:');
const resetTokens = db.prepare("SELECT * FROM email_tokens WHERE type = 'reset'").all();
console.log(resetTokens);

// Verificar tokens expirados
console.log('\n6. Tokens expirados (más de 24 horas):');
const expiredTokens = db.prepare(`
  SELECT * FROM email_tokens 
  WHERE created_at < datetime('now', '-24 hours')
`).all();
console.log(expiredTokens);

// Verificar tokens válidos
console.log('\n7. Tokens válidos (menos de 24 horas):');
const validTokens = db.prepare(`
  SELECT * FROM email_tokens 
  WHERE created_at >= datetime('now', '-24 hours')
`).all();
console.log(validTokens);

db.close(); 