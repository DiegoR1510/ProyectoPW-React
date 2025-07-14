import Database from 'better-sqlite3';

const db = new Database('data.sqlite');

db.exec("DROP TABLE IF EXISTS usuario;");
console.log("Tabla 'usuario' eliminada si existía."); 