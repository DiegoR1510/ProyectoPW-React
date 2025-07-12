const Database = require('better-sqlite3');
const db = new Database('data.sqlite');

const games = [
  {
    id: 1,
    title: "Gran Turismo 7",
    price: 59.99,
    image: "/src/assets/top10/gran-turismo.jpg",
    trailer: "https://www.youtube.com/watch?v=1tBUsXIkG1A",
    genre: ["Carreras", "Simulación"],
    platform: ["PS5"]
  },
  {
    id: 2,
    title: "Spiderman",
    price: 49.99,
    image: "/src/assets/top10/spiderman.jpg",
    trailer: "https://www.youtube.com/watch?v=q4GdJVvdxss",
    genre: ["Acción", "Aventura"],
    platform: ["PS5", "PC"]
  },
  {
    id: 3,
    title: "Bloodborne",
    price: 49.99,
    image: "/src/assets/top10/bloodborne.jpg",
    trailer: "https://www.youtube.com/watch?v=TmZ5MTIu5hU",
    genre: ["Acción", "RPG"],
    platform: ["PS4", "PS5"]
  },
  {
    id: 4,
    title: "The Last of Us",
    price: 49.99,
    image: "/src/assets/top10/the-last-of-us.jpg",
    trailer: "https://www.youtube.com/watch?v=Mel8DZBEJTo",
    genre: ["Aventura", "Acción", "Drama"],
    platform: ["PS4", "PS5", "PC"]
  },
  {
    id: 5,
    title: "God of War",
    price: 49.99,
    image: "/src/assets/top10/god-of-war.png",
    trailer: "https://www.youtube.com/watch?v=K0u_kAWLJOA",
    genre: ["Acción", "Aventura", "Mitología"],
    platform: ["PS4", "PS5", "PC"]
  },
  {
    id: 6,
    title: "Uncharted",
    price: 49.99,
    image: "/src/assets/top10/uncharted.jpg",
    trailer: "https://www.youtube.com/watch?v=34GJ9ZMAKqA",
    genre: ["Aventura", "Acción"],
    platform: ["PS4", "PS5"]
  },
  {
    id: 7,
    title: "Sackboy",
    price: 49.99,
    image: "/src/assets/top10/sackboy.jpg",
    trailer: "https://www.youtube.com/watch?v=ymCDdrMKPrY",
    genre: ["Plataformas", "Aventura"],
    platform: ["PS4", "PS5"]
  },
  {
    id: 8,
    title: "Ghost of Tsushima",
    price: 49.99,
    image: "/src/assets/top10/ghost-of-tsushima.jpg",
    trailer: "https://www.youtube.com/watch?v=RcWk08PBe7k",
    genre: ["Acción", "Aventura", "Mundo Abierto"],
    platform: ["PS4", "PS5"]
  },
  {
    id: 9,
    title: "Days Gone",
    price: 49.99,
    image: "/src/assets/top10/days-gone.jpg",
    trailer: "https://www.youtube.com/watch?v=NzamskPtd0c",
    genre: ["Acción", "Supervivencia", "Aventura"],
    platform: ["PS4", "PS5", "PC"]
  },
  {
    id: 10,
    title: "Death Stranding",
    price: 49.99,
    image: "/src/assets/top10/death-stranding.jpg",
    trailer: "https://www.youtube.com/watch?v=Mpn-MC2B6Zc",
    genre: ["Aventura", "Acción", "Misterio"],
    platform: ["PS4", "PS5", "PC"]
  }
];

for (const game of games) {
  // Verifica si ya existe
  const exists = db.prepare('SELECT id FROM games WHERE id = ?').get(game.id);
  if (!exists) {
    db.prepare(
      'INSERT INTO games (id, title, price, image, trailer, genre, platform) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(
      game.id,
      game.title,
      game.price,
      game.image,
      game.trailer,
      JSON.stringify(game.genre),
      JSON.stringify(game.platform)
    );
    console.log(`Juego insertado: ${game.title}`);
  } else {
    console.log(`Juego ya existe: ${game.title}`);
  }
}

db.close();
console.log('¡Base de datos poblada con juegos!'); 