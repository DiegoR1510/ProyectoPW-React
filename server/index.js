import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import db from './db.js';

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = 'supersecret_jwt_key'; // En producción, usa variable de entorno

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Usuarios en memoria (ya no se usa, ahora en SQLite)
// const users = [ ... ];

// In-memory data storage (in a real app, you'd use a database)
let games = [
  {
    id: 1,
    title: "Gran Turismo 7",
    price: 59.99,
    image: "/src/assets/top10/gran-turismo.jpg",
    trailer: "https://www.youtube.com/watch?v=1tBUsXIkG1A",
    reviews: [
      { id: 1, user: "Usuario1", comment: "Simulación de autos excelente", rating: 5 },
      { id: 2, user: "Usuario2", comment: "Gráficos realistas", rating: 4 },
      { id: 3, user: "Usuario3", comment: "Manejo técnico impresionante", rating: 5 }
    ],
    genre: ["Carreras", "Simulación"],
    platform: ["PS5"]
  },
  {
    id: 2,
    title: "Spiderman",
    price: 49.99,
    image: "/src/assets/top10/spiderman.jpg",
    trailer: "https://www.youtube.com/watch?v=q4GdJVvdxss",
    reviews: [
      { id: 4, user: "Usuario1", comment: "Historia increíble", rating: 5 },
      { id: 5, user: "Usuario2", comment: "Movilidad fluida", rating: 4 },
      { id: 6, user: "Usuario3", comment: "Muy divertido", rating: 5 }
    ],
    genre: ["Acción", "Aventura"],
    platform: ["PS5", "PC"]
  },
  {
    id: 3,
    title: "Bloodborne",
    price: 49.99,
    image: "/src/assets/top10/bloodborne.jpg",
    trailer: "https://www.youtube.com/watch?v=TmZ5MTIu5hU",
    reviews: [
      { id: 7, user: "Usuario1", comment: "Oscuro y desafiante", rating: 5 },
      { id: 8, user: "Usuario2", comment: "Combate brutal", rating: 5 },
      { id: 9, user: "Usuario3", comment: "Exploración intensa", rating: 4 }
    ],
    genre: ["Acción", "RPG"],
    platform: ["PS4", "PS5"]
  },
  {
    id: 4,
    title: "The Last of Us",
    price: 49.99,
    image: "/src/assets/top10/the-last-of-us.jpg",
    trailer: "https://www.youtube.com/watch?v=Mel8DZBEJTo",
    reviews: [
      { id: 10, user: "Usuario1", comment: "Narrativa poderosa", rating: 5 },
      { id: 11, user: "Usuario2", comment: "Ambientación post-apocalíptica", rating: 4 },
      { id: 12, user: "Usuario3", comment: "Actuaciones sobresalientes", rating: 5 }
    ],
    genre: ["Aventura", "Acción", "Drama"],
    platform: ["PS4", "PS5", "PC"]
  },
  {
    id: 5,
    title: "God of War",
    price: 49.99,
    image: "/src/assets/top10/god-of-war.png",
    trailer: "https://www.youtube.com/watch?v=K0u_kAWLJOA",
    reviews: [
      { id: 13, user: "Usuario1", comment: "Increíble desarrollo de personajes", rating: 5 },
      { id: 14, user: "Usuario2", comment: "Combate épico", rating: 5 },
      { id: 15, user: "Usuario3", comment: "Diseño nórdico increíble", rating: 5 }
    ],
    genre: ["Acción", "Aventura", "Mitología"],
    platform: ["PS4", "PS5", "PC"]
  }
];

let nextReviewId = 16;

// Noticias en memoria
let news = [
  { id: 1, title: '¡Nuevo lanzamiento!', content: 'Gran Turismo 7 ya disponible.', date: '2024-06-01' },
  { id: 2, title: 'Oferta especial', content: 'Descuentos en juegos de PS5.', date: '2024-06-05' }
];
let nextNewsId = 3;

// --- AUTENTICACIÓN Y AUTORIZACIÓN ---
// Middleware para verificar JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token requerido' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Token inválido' });
    req.user = user;
    next();
  });
}
// Middleware para verificar rol de admin
function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Solo el admin puede realizar esta acción' });
  }
  next();
}

// --- ENDPOINTS DE AUTENTICACIÓN ---
app.post('/api/login', (req, res) => {
  const { name, password } = req.body;
  const user = db.prepare('SELECT id, name, password, role FROM users WHERE name = ?').get(name);
  if (!user || user.password !== password) {
    return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
  }
  // No enviar password en el token
  const token = jwt.sign({ id: user.id, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: '2h' });
  res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
});

// --- RUTAS DE JUEGOS Y REVIEWS ---
app.get('/api/games/top-rated', (req, res) => {
  const games = db.prepare('SELECT * FROM games').all();
  // Simulación: no hay reviews aún, así que solo devolver los primeros 4
  res.json(games.slice(0, 4));
});

app.get('/api/games/top-sellers', (req, res) => {
  const games = db.prepare('SELECT * FROM games').all();
  res.json(games.slice(0, 4));
});

app.get('/api/games', (req, res) => {
  const games = db.prepare('SELECT * FROM games').all();
  // Parsear genre y platform de JSON
  const parsed = games.map(g => ({ ...g, genre: JSON.parse(g.genre), platform: JSON.parse(g.platform) }));
  res.json(parsed);
});

app.get('/api/games/:id', (req, res) => {
  const game = db.prepare('SELECT * FROM games WHERE id = ?').get(req.params.id);
  if (!game) {
    return res.status(404).json({ message: 'Game not found' });
  }
  game.genre = JSON.parse(game.genre);
  game.platform = JSON.parse(game.platform);
  // Las reviews se migrarán después
  game.reviews = [];
  res.json(game);
});

// --- PROTEGER REVIEWS: SOLO USUARIOS AUTENTICADOS ---
app.post('/api/games/:id/reviews', authenticateToken, (req, res) => {
  const gameId = parseInt(req.params.id);
  const game = games.find(g => g.id === gameId);
  if (!game) {
    return res.status(404).json({ message: 'Game not found' });
  }
  const { user, comment, rating } = req.body;
  if (!user || !comment || !rating) {
    return res.status(400).json({ message: 'User, comment, and rating are required' });
  }
  if (rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Rating must be between 1 and 5' });
  }
  const newReview = {
    id: nextReviewId++,
    user,
    comment,
    rating: parseInt(rating)
  };
  game.reviews.push(newReview);
  res.status(201).json(newReview);
});

// --- EJEMPLO DE RUTA SOLO ADMIN ---
app.delete('/api/games/:id', authenticateToken, requireAdmin, (req, res) => {
  // Solo admin puede eliminar juegos
  const gameId = parseInt(req.params.id);
  const idx = games.findIndex(g => g.id === gameId);
  if (idx === -1) return res.status(404).json({ message: 'Game not found' });
  games.splice(idx, 1);
  res.json({ message: 'Juego eliminado' });
});

// --- ENDPOINTS DE NOTICIAS (solo admin) ---
app.get('/api/news', (req, res) => {
  res.json(news);
});
app.post('/api/news', authenticateToken, requireAdmin, (req, res) => {
  const { title, content, date } = req.body;
  if (!title || !content || !date) {
    return res.status(400).json({ message: 'Faltan campos requeridos' });
  }
  const newItem = { id: nextNewsId++, title, content, date };
  news.push(newItem);
  res.status(201).json(newItem);
});
app.put('/api/news/:id', authenticateToken, requireAdmin, (req, res) => {
  const id = parseInt(req.params.id);
  const idx = news.findIndex(n => n.id === id);
  if (idx === -1) return res.status(404).json({ message: 'Noticia no encontrada' });
  const { title, content, date } = req.body;
  if (!title || !content || !date) {
    return res.status(400).json({ message: 'Faltan campos requeridos' });
  }
  news[idx] = { id, title, content, date };
  res.json(news[idx]);
});
app.delete('/api/news/:id', authenticateToken, requireAdmin, (req, res) => {
  const id = parseInt(req.params.id);
  const idx = news.findIndex(n => n.id === id);
  if (idx === -1) return res.status(404).json({ message: 'Noticia no encontrada' });
  news.splice(idx, 1);
  res.json({ message: 'Noticia eliminada' });
});

// --- ENDPOINT DE GANANCIAS (solo admin) ---
app.get('/api/admin/earnings', authenticateToken, requireAdmin, (req, res) => {
  // Simulación: suma de precio * 10 por cada juego (como si se vendieron 10 de cada uno)
  const total = games.reduce((sum, g) => sum + g.price * 10, 0);
  res.json({ total });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`Games API: http://localhost:${PORT}/api/games`);
}); 