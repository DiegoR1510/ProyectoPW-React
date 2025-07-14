const Database = require('better-sqlite3');
const crypto = require('crypto');

const db = new Database('data.sqlite');

console.log('=== PRUEBA DE CONFIRMACIÓN DE EMAIL ===\n');

// 1. Crear un usuario de prueba
console.log('1. Creando usuario de prueba...');
const testEmail = 'test@example.com';
const testName = 'usuario_test';
const testPassword = 'password123';

// Verificar si el usuario ya existe
const existingUser = db.prepare('SELECT id FROM usuario WHERE correo = ?').get(testEmail);
if (existingUser) {
  console.log('Usuario ya existe, eliminando...');
  db.prepare('DELETE FROM email_tokens WHERE user_id = ?').run(existingUser.id);
  db.prepare('DELETE FROM usuario WHERE id = ?').run(existingUser.id);
}

// Insertar nuevo usuario
const userResult = db.prepare('INSERT INTO usuario (nombre, correo, password, role, is_verified) VALUES (?, ?, ?, ?, ?)').run(testName, testEmail, testPassword, 'user', 0);
console.log('Usuario creado con ID:', userResult.lastInsertRowid);

// 2. Crear token de verificación
console.log('\n2. Creando token de verificación...');
const token = crypto.randomBytes(32).toString('hex');
console.log('Token generado:', token);

const tokenResult = db.prepare('INSERT INTO email_tokens (user_id, token, type) VALUES (?, ?, ?)').run(userResult.lastInsertRowid, token, 'verify');
console.log('Token insertado:', tokenResult);

// 3. Verificar que el token existe
console.log('\n3. Verificando token en la base de datos...');
const storedToken = db.prepare('SELECT * FROM email_tokens WHERE token = ? AND type = ?').get(token, 'verify');
console.log('Token encontrado:', storedToken);

// 4. Simular confirmación de email
console.log('\n4. Simulando confirmación de email...');
const confirmResult = db.prepare('SELECT user_id, created_at FROM email_tokens WHERE token = ? AND type = ?').get(token, 'verify');
console.log('Token para confirmación:', confirmResult);

if (confirmResult) {
  // Actualizar usuario como verificado
  const updateResult = db.prepare('UPDATE usuario SET is_verified = 1 WHERE id = ?').run(confirmResult.user_id);
  console.log('Usuario actualizado:', updateResult);
  
  // Eliminar token
  const deleteResult = db.prepare('DELETE FROM email_tokens WHERE token = ?').run(token);
  console.log('Token eliminado:', deleteResult);
  
  console.log('✅ Confirmación exitosa!');
} else {
  console.log('❌ Token no encontrado para confirmación');
}

// 5. Verificar estado final
console.log('\n5. Estado final:');
const finalUser = db.prepare('SELECT id, nombre, correo, is_verified FROM usuario WHERE correo = ?').get(testEmail);
console.log('Usuario final:', finalUser);

const remainingTokens = db.prepare('SELECT * FROM email_tokens WHERE user_id = ?').all(userResult.lastInsertRowid);
console.log('Tokens restantes:', remainingTokens);

db.close(); 