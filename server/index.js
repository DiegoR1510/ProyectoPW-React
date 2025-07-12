import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import db from './db.js';
import { transporter } from './email.js';
import crypto from 'crypto';

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
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(403).json({ message: 'Token expirado' });
      }
      return res.status(403).json({ message: 'Token inválido' });
    }
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
// Login
app.post('/api/login', (req, res) => {
  const { name, password } = req.body;
  // Buscar por nombre de usuario
  const user = db.prepare('SELECT id, nombre, password, correo, estado FROM usuario WHERE nombre = ?').get(name);
  if (!user || user.password !== password) {
    return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
  }
  // No enviar password en el token
  const token = jwt.sign({ id: user.id, name: user.nombre, correo: user.correo, role: 'user' }, JWT_SECRET, { expiresIn: '2h' });
  res.json({ token, user: { id: user.id, name: user.nombre, correo: user.correo, role: 'user' } });
});

// Endpoint para validar token
app.get('/api/validate-token', authenticateToken, (req, res) => {
  res.json({ valid: true, user: req.user });
});

// Endpoint para renovar token
app.post('/api/refresh-token', authenticateToken, (req, res) => {
  const newToken = jwt.sign(
    { id: req.user.id, name: req.user.name, role: req.user.role }, 
    JWT_SECRET, 
    { expiresIn: '2h' }
  );
  res.json({ token: newToken });
});

// Registro de usuario
app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Faltan campos requeridos' });
  }
  // Verifica que el email no exista
  const existing = db.prepare('SELECT id FROM usuario WHERE correo = ?').get(email);
  if (existing) {
    return res.status(400).json({ message: 'El email ya está registrado' });
  }
  console.log('Insertando usuario:', name, email);
  const stmt = db.prepare('INSERT INTO usuario (nombre, correo, password, estado) VALUES (?, ?, ?, 1)');
  const info = stmt.run(name, email, password);
  console.log('Usuario insertado con id:', info.lastInsertRowid);

  // Aquí podrías agregar lógica de confirmación de correo si lo deseas
  res.status(201).json({ id: info.lastInsertRowid, name, email });
});

// Confirmación de email
app.get('/api/confirm-email', (req, res) => {
  const { token } = req.query;
  console.log('Confirmación de email solicitada con token:', token);

  if (!token) {
    console.log('Error: Token no proporcionado');
    return res.status(400).json({ message: 'Token no proporcionado' });
  }

  // Buscar el token en la base de datos
  const row = db.prepare('SELECT user_id, created_at FROM email_tokens WHERE token = ? AND type = ?').get(token, 'verify');
  console.log('Resultado de búsqueda de token:', row);

  if (!row) {
    // Intentar buscar el usuario por el token aunque el token ya no exista
    const userRow = db.prepare('SELECT usuario.is_verified FROM usuario JOIN email_tokens ON usuario.id = email_tokens.user_id WHERE email_tokens.token = ?').get(token);
    // Si no se encuentra por el token, intentar buscar por el usuario (por si el token ya fue eliminado)
    if (!userRow) {
      const userByToken = db.prepare('SELECT is_verified FROM usuario WHERE id = (SELECT user_id FROM email_tokens WHERE token = ?)').get(token);
      if (userByToken && userByToken.is_verified === 1) {
        console.log('Usuario ya estaba verificado (por id). Respondiendo éxito.');
        return res.json({ message: 'Correo confirmado correctamente' });
      }
    } else if (userRow.is_verified === 1) {
      console.log('Usuario ya estaba verificado. Respondiendo éxito.');
      return res.json({ message: 'Correo confirmado correctamente' });
    }
    console.log('Error: Token no encontrado en la base de datos');
    return res.status(400).json({ message: 'Token inválido o expirado' });
  }

  // Verificar si el token no ha expirado (24 horas)
  const tokenAge = db.prepare(`
    SELECT 
      (julianday('now') - julianday(created_at)) * 24 as hours_old
    FROM email_tokens 
    WHERE token = ?
  `).get(token);

  console.log('Edad del token (horas):', tokenAge?.hours_old);

  if (tokenAge && tokenAge.hours_old > 24) {
    console.log('Error: Token expirado');
    db.prepare('DELETE FROM email_tokens WHERE token = ?').run(token);
    return res.status(400).json({ message: 'Token expirado. Solicita un nuevo enlace de confirmación.' });
  }

  try {
    // Actualizar usuario como verificado
    const updateResult = db.prepare('UPDATE usuario SET is_verified = 1 WHERE id = ?').run(row.user_id);
    console.log('Usuario actualizado:', updateResult);
    // Eliminar el token usado
    const deleteResult = db.prepare('DELETE FROM email_tokens WHERE token = ?').run(token);
    console.log('Token eliminado:', deleteResult);
    res.json({ message: 'Correo confirmado correctamente' });
  } catch (error) {
    console.error('Error al confirmar email:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Solicitud de recuperación de contraseña
app.post('/api/request-password-reset', async (req, res) => {
  const { email } = req.body;
  const user = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (!user) return res.status(200).json({ message: 'Si el email existe, se enviará un enlace.' });
  const token = crypto.randomBytes(32).toString('hex');
  db.prepare('INSERT INTO email_tokens (user_id, token, type) VALUES (?, ?, ?)').run(user.id, token, 'reset');
  const resetUrl = `http://localhost:3000/reset-password?token=${token}`;
  await transporter.sendMail({
    from: 'Diego <20204879@aloe.ulima.edu.pe>',
    to: email,
    subject: 'Recupera tu contraseña',
    html: `<p>Haz clic <a href="${resetUrl}">aquí</a> para restablecer tu contraseña.</p>`
  });
  res.json({ message: 'Si el email existe, se enviará un enlace.' });
});

// Restablecimiento de contraseña
app.post('/api/reset-password', (req, res) => {
  const { token, password } = req.body;
  const row = db.prepare('SELECT user_id FROM email_tokens WHERE token = ? AND type = ?').get(token, 'reset');
  if (!row) return res.status(400).json({ message: 'Token inválido' });
  db.prepare('UPDATE users SET password = ? WHERE id = ?').run(password, row.user_id);
  db.prepare('DELETE FROM email_tokens WHERE token = ?').run(token);
  res.json({ message: 'Contraseña actualizada correctamente' });
});

// --- RUTAS DE JUEGOS Y REVIEWS ---
app.get('/api/games/top-rated', (req, res) => {
  const juegos = db.prepare('SELECT * FROM juego').all();
  const result = juegos.map(j => {
    // Obtener categoría
    let categoria = null;
    if (j.categoria_id) {
      const cat = db.prepare('SELECT nombre FROM categoria WHERE id = ?').get(j.categoria_id);
      categoria = cat ? cat.nombre : null;
    }
    // Obtener plataformas
    const plataformas = db.prepare(`
      SELECT p.nombre FROM plataforma p
      JOIN juego_plataforma jp ON jp.plataforma_id = p.id
      WHERE jp.juego_id = ?
    `).all(j.id).map(p => p.nombre);
    // Obtener calificaciones
    const calificaciones = db.prepare(`
      SELECT c.valoracion as rating, c.comentario as comment, u.nombre as user
      FROM calificacion c JOIN usuario u ON c.usuario_id = u.id
      WHERE c.juego_id = ?
    `).all(j.id);
    // Calcular promedio
    const avgRating = calificaciones.length
      ? calificaciones.reduce((sum, r) => sum + r.rating, 0) / calificaciones.length
      : 0;
    return {
      id: j.id,
      title: j.nombre,
      price: j.precio,
      image: j.image || '',
      trailer: j.trailer || '',
      genre: categoria ? [categoria] : [],
      platform: plataformas,
      reviews: calificaciones,
      avgRating,
      esta_oferta: j.esta_oferta,
      precio_oferta: j.precio_oferta
    };
  });
  // Filtrar solo juegos con al menos una review
  const conReviews = result.filter(j => j.reviews.length > 0);
  // Ordenar por promedio de rating descendente y devolver los primeros 4
  conReviews.sort((a, b) => b.avgRating - a.avgRating);
  res.json(conReviews.slice(0, 4));
});

app.get('/api/games/top-sellers', (req, res) => {
  const juegos = db.prepare('SELECT * FROM juego').all();
  const result = juegos.slice(0, 4).map(j => {
    // Obtener categoría
    let categoria = null;
    if (j.categoria_id) {
      const cat = db.prepare('SELECT nombre FROM categoria WHERE id = ?').get(j.categoria_id);
      categoria = cat ? cat.nombre : null;
    }
    // Obtener plataformas
    const plataformas = db.prepare(`
      SELECT p.nombre FROM plataforma p
      JOIN juego_plataforma jp ON jp.plataforma_id = p.id
      WHERE jp.juego_id = ?
    `).all(j.id).map(p => p.nombre);
    // Obtener calificaciones
    const calificaciones = db.prepare(`
      SELECT c.valoracion as rating, c.comentario as comment, u.nombre as user
      FROM calificacion c JOIN usuario u ON c.usuario_id = u.id
      WHERE c.juego_id = ?
    `).all(j.id);
    return {
      id: j.id,
      title: j.nombre,
      price: j.precio,
      image: j.image || '',
      trailer: j.trailer || '',
      genre: categoria ? [categoria] : [],
      platform: plataformas,
      reviews: calificaciones,
      esta_oferta: j.esta_oferta,
      precio_oferta: j.precio_oferta
    };
  });
  res.json(result);
});

// --- ENDPOINTS DE JUEGOS ---
// Listado de juegos
app.get('/api/games', (req, res) => {
  const juegos = db.prepare('SELECT * FROM juego').all();
  const result = juegos.map(j => {
    // Obtener categoría
    let categoria = null;
    if (j.categoria_id) {
      const cat = db.prepare('SELECT nombre FROM categoria WHERE id = ?').get(j.categoria_id);
      categoria = cat ? cat.nombre : null;
    }
    // Obtener plataformas
    const plataformas = db.prepare(`
      SELECT p.nombre FROM plataforma p
      JOIN juego_plataforma jp ON jp.plataforma_id = p.id
      WHERE jp.juego_id = ?
    `).all(j.id).map(p => p.nombre);
    // Obtener calificaciones
    const calificaciones = db.prepare(`
      SELECT c.valoracion as rating, c.comentario as comment, u.nombre as user
      FROM calificacion c JOIN usuario u ON c.usuario_id = u.id
      WHERE c.juego_id = ?
    `).all(j.id);
    return {
      id: j.id,
      title: j.nombre,
      price: j.precio,
      image: j.image || '',
      trailer: j.trailer || '',
      genre: categoria ? [categoria] : [],
      platform: plataformas,
      reviews: calificaciones,
      esta_oferta: j.esta_oferta,
      precio_oferta: j.precio_oferta // <-- Añadido
    };
  });
  res.json(result);
});

// Detalle de juego
app.get('/api/games/:id', (req, res) => {
  const j = db.prepare('SELECT * FROM juego WHERE id = ?').get(req.params.id);
  if (!j) return res.status(404).json({ message: 'Game not found' });
  // Obtener categoría
  let categoria = null;
  if (j.categoria_id) {
    const cat = db.prepare('SELECT nombre FROM categoria WHERE id = ?').get(j.categoria_id);
    categoria = cat ? cat.nombre : null;
  }
  // Obtener plataformas
  const plataformas = db.prepare(`
    SELECT p.nombre FROM plataforma p
    JOIN juego_plataforma jp ON jp.plataforma_id = p.id
    WHERE jp.juego_id = ?
  `).all(j.id).map(p => p.nombre);
  // Obtener calificaciones
  const calificaciones = db.prepare(`
    SELECT c.valoracion as rating, c.comentario as comment, u.nombre as user
    FROM calificacion c JOIN usuario u ON c.usuario_id = u.id
    WHERE c.juego_id = ?
  `).all(j.id);
  const result = {
    id: j.id,
    title: j.nombre,
    price: j.precio,
    image: j.image || '',
    trailer: j.trailer || '',
    genre: categoria ? [categoria] : [],
    platform: plataformas,
    reviews: calificaciones
  };
  res.json(result);
});

// --- PROTEGER REVIEWS: SOLO USUARIOS AUTENTICADOS ---
app.post('/api/games/:id/reviews', authenticateToken, (req, res) => {
  const gameId = parseInt(req.params.id);
  const { comment, rating } = req.body;
  const userId = req.user.id;
  // LOGS DE DEPURACIÓN
  console.log('--- NUEVA REVIEW ---');
  console.log('req.user:', req.user);
  console.log('userId:', userId);
  console.log('comment:', comment);
  console.log('rating:', rating);
  if (!userId || !comment || !rating) {
    console.log('FALTA ALGÚN DATO: userId, comment o rating');
    return res.status(400).json({ message: 'User, comment, and rating are required' });
  }
  if (rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Rating must be between 1 and 5' });
  }
  // Insertar en calificacion
  const stmt = db.prepare('INSERT INTO calificacion (valoracion, comentario, juego_id, usuario_id) VALUES (?, ?, ?, ?)');
  const info = stmt.run(rating, comment, gameId, userId);
  // Obtener nombre de usuario
  const user = db.prepare('SELECT nombre FROM usuario WHERE id = ?').get(userId);
  const newReview = {
    id: info.lastInsertRowid,
    user: user ? user.nombre : 'Usuario',
    comment,
    rating
  };
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