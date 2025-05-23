import granTurismo from '../assets/top10/gran-turismo.jpg';
import spiderman from '../assets/top10/spiderman.jpg';
import bloodborne from '../assets/top10/bloodborne.jpg';
import lastOfUs from '../assets/top10/the-last-of-us.jpg';
import godOfWar from '../assets/top10/god-of-war.png';
import uncharted from '../assets/top10/uncharted.jpg';
import sackboy from '../assets/top10/sackboy.jpg';
import ghost from '../assets/top10/ghost-of-tsushima.jpg';
import daysGone from '../assets/top10/days-gone.jpg';
import deathStranding from '../assets/top10/death-stranding.jpg';

export interface Review {
  user: string;
  comment: string;
  rating: number;
}

export interface Game {
  id: number;
  title: string;
  image: string;
  price: number;
  trailer: string;
  reviews: Review[];
  genre: string[];
  platform: string[];
}

export const games: Game[] = [
  {
    id: 1,
    title: "Gran Turismo 7",
    price: 59.99,
    image: granTurismo,
    trailer: "https://www.youtube.com/watch?v=1tBUsXIkG1A",
    reviews: [
      { user: "Usuario1", comment: "Simulación de autos excelente", rating: 5 },
      { user: "Usuario2", comment: "Gráficos realistas", rating: 4 },
      { user: "Usuario3", comment: "Manejo técnico impresionante", rating: 5 }
    ],
    genre: ["Carreras", "Simulación"],
    platform: ["PS5"]
  },
  {
    id: 2,
    title: "Spiderman",
    price: 49.99,
    image: spiderman,
    trailer: "https://www.youtube.com/watch?v=q4GdJVvdxss",
    reviews: [
      { user: "Usuario1", comment: "Historia increíble", rating: 5 },
      { user: "Usuario2", comment: "Movilidad fluida", rating: 4 },
      { user: "Usuario3", comment: "Muy divertido", rating: 5 }
    ],
    genre: ["Acción", "Aventura"],
    platform: ["PS5", "PC"]
  },
  {
    id: 3,
    title: "Bloodborne",
    price: 49.99,
    image: bloodborne,
    trailer: "https://www.youtube.com/watch?v=TmZ5MTIu5hU",
    reviews: [
      { user: "Usuario1", comment: "Oscuro y desafiante", rating: 5 },
      { user: "Usuario2", comment: "Combate brutal", rating: 5 },
      { user: "Usuario3", comment: "Exploración intensa", rating: 4 }
    ],
    genre: ["Acción", "RPG"],
    platform: ["PS4", "PS5"]
  },
  {
    id: 4,
    title: "The Last of Us",
    price: 49.99,
    image: lastOfUs,
    trailer: "https://www.youtube.com/watch?v=Mel8DZBEJTo",
    reviews: [
      { user: "Usuario1", comment: "Narrativa poderosa", rating: 5 },
      { user: "Usuario2", comment: "Ambientación post-apocalíptica", rating: 4 },
      { user: "Usuario3", comment: "Actuaciones sobresalientes", rating: 5 }
    ],
    genre: ["Aventura", "Acción", "Drama"],
    platform: ["PS4", "PS5", "PC"]
  },
  {
    id: 5,
    title: "God of War",
    price: 49.99,
    image: godOfWar,
    trailer: "https://www.youtube.com/watch?v=K0u_kAWLJOA",
    reviews: [
      { user: "Usuario1", comment: "Increíble desarrollo de personajes", rating: 5 },
      { user: "Usuario2", comment: "Combate épico", rating: 5 },
      { user: "Usuario3", comment: "Diseño nórdico increíble", rating: 5 }
    ],
    genre: ["Acción", "Aventura", "Mitología"],
    platform: ["PS4", "PS5", "PC"]
  },
  {
    id: 6,
    title: "Uncharted",
    price: 49.99,
    image: uncharted,
    trailer: "https://www.youtube.com/watch?v=34GJ9ZMAKqA",
    reviews: [
      { user: "Usuario1", comment: "Aventura emocionante", rating: 5 },
      { user: "Usuario2", comment: "Gran historia", rating: 5 },
      { user: "Usuario3", comment: "Exploración cinematográfica", rating: 4 }
    ],
    genre: ["Aventura", "Acción"],
    platform: ["PS4", "PS5"]
  },
  {
    id: 7,
    title: "Sackboy",
    price: 49.99,
    image: sackboy,
    trailer: "https://www.youtube.com/watch?v=ymCDdrMKPrY",
    reviews: [
      { user: "Usuario1", comment: "Divertido para todas las edades", rating: 5 },
      { user: "Usuario2", comment: "Diseño adorable", rating: 5 },
      { user: "Usuario3", comment: "Cooperativo genial", rating: 5 }
    ],
    genre: ["Plataformas", "Aventura"],
    platform: ["PS4", "PS5"]
  },
  {
    id: 8,
    title: "Ghost of Tsushima",
    price: 49.99,
    image: ghost,
    trailer: "https://www.youtube.com/watch?v=RcWk08PBe7k",
    reviews: [
      { user: "Usuario1", comment: "Visualmente impresionante", rating: 5 },
      { user: "Usuario2", comment: "Samuráis con honor", rating: 5 },
      { user: "Usuario3", comment: "Mundo abierto hermoso", rating: 4 }
    ],
    genre: ["Acción", "Aventura", "Mundo Abierto"],
    platform: ["PS4", "PS5"]
  },
  {
    id: 9,
    title: "Days Gone",
    price: 49.99,
    image: daysGone,
    trailer: "https://www.youtube.com/watch?v=NzamskPtd0c",
    reviews: [
      { user: "Usuario1", comment: "Zombies intensos", rating: 5 },
      { user: "Usuario2", comment: "Historia emocional", rating: 4 },
      { user: "Usuario3", comment: "Moto + supervivencia", rating: 5 }
    ],
    genre: ["Acción", "Supervivencia", "Aventura"],
    platform: ["PS4", "PS5", "PC"]
  },
  {
    id: 10,
    title: "Death Stranding",
    price: 49.99,
    image: deathStranding,
    trailer: "https://www.youtube.com/watch?v=Mpn-MC2B6Zc",
    reviews: [
      { user: "Usuario1", comment: "Experiencia única", rating: 5 },
      { user: "Usuario2", comment: "Paisajes hermosos", rating: 4 },
      { user: "Usuario3", comment: "Narrativa profunda", rating: 5 }
    ],
    genre: ["Aventura", "Acción", "Misterio"],
    platform: ["PS4", "PS5", "PC"]
  }
];