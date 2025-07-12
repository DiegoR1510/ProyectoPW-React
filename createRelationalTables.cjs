const Database = require('better-sqlite3');
const db = new Database('data.sqlite');

// Crear tablas y relaciones
const schema = `
-- Tabla Usuario
CREATE TABLE IF NOT EXISTS usuario (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    correo TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    nombre TEXT NOT NULL,
    token TEXT,
    estado INTEGER DEFAULT 1,
    is_verified INTEGER DEFAULT 0
);

-- Tabla Plataforma
CREATE TABLE IF NOT EXISTS plataforma (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL
);

-- Tabla Categoría
CREATE TABLE IF NOT EXISTS categoria (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL
);

-- Tabla Juego
CREATE TABLE IF NOT EXISTS juego (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    precio REAL NOT NULL,
    categoria_id INTEGER,
    esta_oferta INTEGER DEFAULT 0,
    estado INTEGER DEFAULT 1,
    image TEXT,
    trailer TEXT,
    FOREIGN KEY (categoria_id) REFERENCES categoria(id)
);

-- Relación muchos a muchos: Juego-Plataforma
CREATE TABLE IF NOT EXISTS juego_plataforma (
    juego_id INTEGER,
    plataforma_id INTEGER,
    PRIMARY KEY (juego_id, plataforma_id),
    FOREIGN KEY (juego_id) REFERENCES juego(id),
    FOREIGN KEY (plataforma_id) REFERENCES plataforma(id)
);

-- Tabla Venta
CREATE TABLE IF NOT EXISTS venta (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    usuario_id INTEGER,
    juego_id INTEGER,
    codigo TEXT,
    monto_pagado REAL,
    FOREIGN KEY (usuario_id) REFERENCES usuario(id),
    FOREIGN KEY (juego_id) REFERENCES juego(id)
);

-- Tabla Calificación
CREATE TABLE IF NOT EXISTS calificacion (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    valoracion INTEGER NOT NULL,
    comentario TEXT,
    juego_id INTEGER,
    usuario_id INTEGER,
    FOREIGN KEY (juego_id) REFERENCES juego(id),
    FOREIGN KEY (usuario_id) REFERENCES usuario(id)
);

-- Tabla Noticia
CREATE TABLE IF NOT EXISTS noticia (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    texto TEXT NOT NULL,
    activo INTEGER DEFAULT 1
);

-- Tabla para tokens de email
CREATE TABLE IF NOT EXISTS email_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token TEXT NOT NULL,
    type TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES usuario(id)
);
`;

db.exec(schema);
console.log('¡Tablas y relaciones creadas exitosamente!');
db.close(); 