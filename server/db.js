import Database from 'better-sqlite3';

const db = new Database('data.sqlite');

// Eliminar la tabla usuario y su creación
// Crear tabla de usuario (para compatibilidad con el código existente)
db.exec(`
CREATE TABLE IF NOT EXISTS usuario (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  correo TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  estado INTEGER DEFAULT 1,
  is_verified INTEGER DEFAULT 0,
  role TEXT NOT NULL DEFAULT 'user'
);
`);

// Insertar usuarios de ejemplo en la tabla usuario si no existen
const existingUsuario = db.prepare('SELECT COUNT(*) as count FROM usuario').get();
if (existingUsuario.count === 0) {
  db.prepare('INSERT INTO usuario (nombre, correo, password, estado, is_verified, role) VALUES (?, ?, ?, ?, ?, ?)').run('admin', 'admin@admin.com', 'admin123', 1, 1, 'admin');
  db.prepare('INSERT INTO usuario (nombre, correo, password, estado, is_verified, role) VALUES (?, ?, ?, ?, ?, ?)').run('usuario', 'usuario@usuario.com', 'usuario123', 1, 1, 'user');
}

// Crear tabla de juegos
// id, title, price, image, trailer, genre, platform
db.exec(`
CREATE TABLE IF NOT EXISTS games (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  price REAL NOT NULL,
  image TEXT NOT NULL,
  trailer TEXT NOT NULL,
  genre TEXT NOT NULL,      -- JSON string
  platform TEXT NOT NULL    -- JSON string
);
`);

// Insertar juegos de ejemplo si no existen
const gamesExist = db.prepare('SELECT COUNT(*) as count FROM games').get();
if (gamesExist.count === 0) {
  const exampleGames = [
    {
      title: "Gran Turismo 7",
      price: 59.99,
      image: "/src/assets/top10/gran-turismo.jpg",
      trailer: "https://www.youtube.com/watch?v=1tBUsXIkG1A",
      genre: ["Carreras", "Simulación"],
      platform: ["PS5"]
    },
    {
      title: "Spiderman",
      price: 49.99,
      image: "/src/assets/top10/spiderman.jpg",
      trailer: "https://www.youtube.com/watch?v=q4GdJVvdxss",
      genre: ["Acción", "Aventura"],
      platform: ["PS5", "PC"]
    },
    {
      title: "Bloodborne",
      price: 49.99,
      image: "/src/assets/top10/bloodborne.jpg",
      trailer: "https://www.youtube.com/watch?v=TmZ5MTIu5hU",
      genre: ["Acción", "RPG"],
      platform: ["PS4", "PS5"]
    },
    {
      title: "The Last of Us",
      price: 49.99,
      image: "/src/assets/top10/the-last-of-us.jpg",
      trailer: "https://www.youtube.com/watch?v=Mel8DZBEJTo",
      genre: ["Aventura", "Acción", "Drama"],
      platform: ["PS4", "PS5", "PC"]
    },
    {
      title: "God of War",
      price: 49.99,
      image: "/src/assets/top10/god-of-war.png",
      trailer: "https://www.youtube.com/watch?v=K0u_kAWLJOA",
      genre: ["Acción", "Aventura", "Mitología"],
      platform: ["PS4", "PS5", "PC"]
    }
  ];
  const stmt = db.prepare('INSERT INTO games (title, price, image, trailer, genre, platform) VALUES (?, ?, ?, ?, ?, ?)');
  for (const g of exampleGames) {
    stmt.run(g.title, g.price, g.image, g.trailer, JSON.stringify(g.genre), JSON.stringify(g.platform));
  }
}

db.exec(`
CREATE TABLE IF NOT EXISTS reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  game_id INTEGER NOT NULL,
  user TEXT NOT NULL,
  comment TEXT NOT NULL,
  rating INTEGER NOT NULL,
  FOREIGN KEY (game_id) REFERENCES games(id)
);
`);

db.exec(`
CREATE TABLE IF NOT EXISTS email_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  token TEXT NOT NULL,
  type TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES usuario(id)
);
`);

// Exportar la instancia de la base de datos
export default db; 