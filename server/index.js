import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import db from './db.js';
import { transporter } from './email.js';
import crypto from 'crypto';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Usuarios en memoria (ya no se usa, ahora en SQLite)
//

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
app.post('/api/login', async (req, res) => {
  const { name, password } = req.body;
  // Buscar por nombre de usuario
  const user = db.prepare('SELECT id, nombre, password, correo, estado, role FROM usuario WHERE nombre = ?').get(name);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
  }
  // No enviar password en el token
  const token = jwt.sign({ id: user.id, name: user.nombre, correo: user.correo, role: user.role }, JWT_SECRET, { expiresIn: '2h' });
  res.json({ token, user: { id: user.id, name: user.nombre, correo: user.correo, role: user.role } });
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

// --- REGISTRO DE USUARIO CON ENVÍO DE CORREO DE CONFIRMACIÓN ---
app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Faltan campos requeridos' });
  }
  // Verifica que el email no exista en la tabla 'usuario'
  const existing = db.prepare('SELECT id FROM usuario WHERE correo = ?').get(email);
  if (existing) {
    return res.status(400).json({ message: 'El email ya está registrado' });
  }
  try {
    // Hashear la contraseña antes de guardar
    const hashedPassword = await bcrypt.hash(password, 10);
    const stmt = db.prepare('INSERT INTO usuario (nombre, correo, password, estado, is_verified, role) VALUES (?, ?, ?, 1, 0, ?)');
    const info = stmt.run(name, email, hashedPassword, 'user');
    // Generar token de confirmación
    const token = crypto.randomBytes(32).toString('hex');
    db.prepare('INSERT INTO email_tokens (user_id, token, type) VALUES (?, ?, ?)').run(info.lastInsertRowid, token, 'verify');
    // Enviar correo de confirmación
    const confirmUrl = `http://localhost:5173/confirm-email?token=${token}`;
    await transporter.sendMail({
      from: 'Diego <20204879@aloe.ulima.edu.pe>',
      to: email,
      subject: 'Confirma tu correo electrónico',
      html: `<h2>¡Bienvenido a nuestra tienda de juegos!</h2>
        <p>Hola ${name},</p>
        <p>Gracias por registrarte. Para completar tu registro, por favor confirma tu correo electrónico haciendo clic en el siguiente enlace:</p>
        <p><a href="${confirmUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Confirmar Correo</a></p>
        <p>Si el botón no funciona, puedes copiar y pegar este enlace en tu navegador:</p>
        <p>${confirmUrl}</p>
        <p>Este enlace expirará en 24 horas.</p>
        <p>Saludos,<br>El equipo de la tienda de juegos</p>`
    });
    res.status(201).json({ id: info.lastInsertRowid, name, email, message: 'Usuario registrado. Se ha enviado un correo de confirmación.' });
  } catch (error) {
    console.error('Error en el registro:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
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
    // Si no está verificado, no mostrar mensaje de token inválido, solo éxito si ya está verificado
    return res.json({ message: 'Correo confirmado correctamente' });
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
  const user = db.prepare('SELECT id FROM usuario WHERE correo = ?').get(email);
  if (!user) return res.status(200).json({ message: 'Si el email existe, se enviará un enlace.' });
  const token = crypto.randomBytes(32).toString('hex');
  db.prepare('INSERT INTO email_tokens (user_id, token, type) VALUES (?, ?, ?)').run(user.id, token, 'reset');
  const resetUrl = `http://localhost:5173/reset-password?token=${token}`;
  try {
    await transporter.sendMail({
      from: 'Diego <20204879@aloe.ulima.edu.pe>',
      to: email,
      subject: 'Recupera tu contraseña',
      html: `<p>Haz clic <a href="${resetUrl}">aquí</a> para restablecer tu contraseña.</p>`
    });
    console.log('Correo de recuperación enviado a:', email);
  } catch (error) {
    console.error('Error enviando correo de recuperación:', error);
  }
  res.json({ message: 'Si el email existe, se enviará un enlace.' });
});

// Restablecimiento de contraseña
app.post('/api/reset-password', async (req, res) => {
  const { token, password } = req.body;
  const row = db.prepare('SELECT user_id FROM email_tokens WHERE token = ? AND type = ?').get(token, 'reset');
  if (!row) return res.status(400).json({ message: 'Token inválido' });
  const hashedPassword = await bcrypt.hash(password, 10);
  db.prepare('UPDATE usuario SET password = ? WHERE id = ?').run(hashedPassword, row.user_id);
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

// Endpoint para que el admin actualice el precio de oferta de un juego
app.patch('/api/games/:id/oferta', authenticateToken, requireAdmin, (req, res) => {
  const gameId = parseInt(req.params.id);
  const { precio_oferta } = req.body;
  if (typeof precio_oferta !== 'number' || precio_oferta < 0) {
    return res.status(400).json({ message: 'El precio de oferta debe ser un número positivo.' });
  }
  // Si el precio de oferta es mayor a 0, activa la oferta, si es 0, la desactiva
  const esta_oferta = precio_oferta > 0 ? 1 : 0;
  const result = db.prepare('UPDATE juego SET precio_oferta = ?, esta_oferta = ? WHERE id = ?').run(precio_oferta, esta_oferta, gameId);
  if (result.changes === 0) {
    return res.status(404).json({ message: 'Juego no encontrado.' });
  }
  res.json({ message: 'Precio de oferta actualizado correctamente.' });
});

// --- PROTEGER REVIEWS: SOLO USUARIOS AUTENTICADOS ---
app.post('/api/games/:id/reviews', authenticateToken, (req, res) => {
  const gameId = parseInt(req.params.id);
  const { comment, rating } = req.body;
  const userId = req.user.id;
  // Verificar que el usuario esté verificado
  const userDb = db.prepare('SELECT is_verified FROM usuario WHERE id = ?').get(userId);
  if (!userDb || userDb.is_verified !== 1) {
    return res.status(403).json({ message: 'Debes verificar tu correo para dejar una review.' });
  }
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

// --- ENDPOINT DE HISTORIAL DE COMPRAS ---
app.get('/api/ventas/:usuarioId', authenticateToken, (req, res) => {
  const usuarioId = parseInt(req.params.usuarioId);
  const ventas = db.prepare(`
    SELECT v.id, v.fecha, v.codigo, v.monto_pagado, j.nombre as juego
    FROM venta v
    JOIN juego j ON v.juego_id = j.id
    WHERE v.usuario_id = ?
    ORDER BY v.fecha DESC
  `).all(usuarioId);
  res.json(ventas);
});

// --- ENDPOINT PARA REGISTRAR UNA VENTA (COMPRA DE JUEGOS MULTIPLES) ---
app.post('/api/ventas', authenticateToken, async (req, res) => {
  const usuarioId = req.user.id;
  const { juegos } = req.body; // [{ juegoId, monto_pagado }]
  const codigos = [];

  for (const item of juegos) {
    const codigo = Math.random().toString(36).substring(2, 10).toUpperCase();
    db.prepare('INSERT INTO venta (usuario_id, juego_id, monto_pagado, codigo) VALUES (?, ?, ?, ?)').run(
      usuarioId, item.juegoId, item.monto_pagado, codigo
    );
    codigos.push({ juegoId: item.juegoId, codigo });
  }

  // Obtener info de los juegos para el correo
  const juegosInfo = codigos.map(({ juegoId, codigo }) => {
    const juego = db.prepare('SELECT nombre FROM juego WHERE id = ?').get(juegoId);
    return { nombre: juego.nombre, codigo };
  });

  // Enviar correo al usuario
  const user = db.prepare('SELECT correo, nombre FROM usuario WHERE id = ?').get(usuarioId);
  await transporter.sendMail({
    from: `Diego <${process.env.EMAIL_USER}>`,
    to: user.correo,
    subject: '¡Gracias por tu compra!',
    html: `
      <h2>¡Gracias por tu compra, ${user.nombre}!</h2>
      <p>Estos son los juegos y códigos que adquiriste:</p>
      <ul>
        ${juegosInfo.map(j => `<li><b>${j.nombre}</b>: ${j.codigo}</li>`).join('')}
      </ul>
      <p>¡Disfruta tus juegos!</p>
    `
  });

  res.json({ message: 'Compra registrada y correo enviado', codigos: juegosInfo });
});

// --- ENDPOINT DE TODAS LAS VENTAS (solo admin) ---
app.get('/api/ventas', authenticateToken, requireAdmin, (req, res) => {
  const ventas = db.prepare(`
    SELECT v.id, v.fecha, v.codigo, v.monto_pagado, j.nombre as juego, u.nombre as usuario
    FROM venta v
    JOIN juego j ON v.juego_id = j.id
    JOIN usuario u ON v.usuario_id = u.id
    ORDER BY v.fecha DESC
  `).all();
  res.json(ventas);
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
  const total = db.prepare('SELECT SUM(monto_pagado) as total FROM venta').get().total || 0;
  res.json({ total });
});

// --- ENDPOINT DE GANANCIAS POR MES (solo admin) ---
app.get('/api/admin/earnings-by-month', authenticateToken, requireAdmin, (req, res) => {
  // Agrupa las ventas por mes y suma el monto_pagado
  const rows = db.prepare(`
    SELECT 
      strftime('%m', fecha) as mes,
      SUM(monto_pagado) as total
    FROM venta
    GROUP BY mes
    ORDER BY mes
  `).all();

  // Devuelve un array de 12 meses, rellenando con 0 si no hay ventas en algún mes
  const earnings = Array(12).fill(0);
  rows.forEach(row => {
    const monthIndex = parseInt(row.mes, 10) - 1;
    earnings[monthIndex] = row.total;
  });

  res.json({ earnings });
});

// --- ENDPOINT: CANTIDAD DE USUARIOS (solo admin) ---
app.get('/api/usuarios/count', authenticateToken, requireAdmin, (req, res) => {
  const row = db.prepare('SELECT COUNT(*) as total FROM usuario').get();
  res.json({ total: row.total });
});

// --- ENDPOINT: LISTA DE USUARIOS (solo admin) ---
app.get('/api/usuarios', authenticateToken, requireAdmin, (req, res) => {
  const usuarios = db.prepare('SELECT id, nombre, correo, estado, is_verified, role FROM usuario ORDER BY id ASC').all();
  res.json(usuarios);
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