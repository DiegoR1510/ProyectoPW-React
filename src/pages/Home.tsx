import React, { useContext, useEffect, useState } from 'react';
import GameCard from '../components/GameCard';
import { AuthContext } from '../context/AuthContext';
import { apiService, Game } from '../services/api';
import { CartContext } from '../context/CartContext';

const carruselImages = [
  '/assets/carrusel/gta6.jpg',
  '/assets/carrusel/fc25.jpg',
  '/assets/carrusel/godofwar.png'
];

const getUnique = (arr: string[][]) => Array.from(new Set(arr.flat()));

// Función de normalización para comparar strings de forma robusta
function normalize(str: string) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // quita tildes
    .replace(/\s+/g, ''); // quita espacios
}

const Home: React.FC = () => {
  const { user } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [maxPrice, setMaxPrice] = useState(100);
  const [selectedGenre, setSelectedGenre] = useState<string>('Todas');
  const [selectedPlatform, setSelectedPlatform] = useState('Todas');
  const [showOffersOnly, setShowOffersOnly] = useState(false);
  const [deletedIds, setDeletedIds] = useState<number[]>(() => {
    const stored = localStorage.getItem('deletedGames');
    return stored ? JSON.parse(stored) : [];
  });
  const [cartMessage, setCartMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true);
        const data = await apiService.getGames();
        console.log('Juegos recibidos del backend:', data); // <-- LOG DE DEPURACIÓN
        setGames(data);
      } catch (err) {
        setError('Error al cargar los juegos');
      } finally {
        setLoading(false);
      }
    };
    fetchGames();
  }, []);

  // Obtener todos los géneros y plataformas únicos de todos los juegos
  const allGenres = Array.from(new Set(games.flatMap(g => Array.isArray(g.genre) ? g.genre : []).map(g => g && g.trim()).filter(Boolean)));
  const allPlatforms = Array.from(new Set(games.flatMap(g => Array.isArray(g.platform) ? g.platform : []).map(p => p && p.trim()).filter(Boolean)));
  const maxGamePrice = games.length > 0 ? Math.ceil(Math.max(...games.map(g => g.price))) : 100;

  // Debug logs para ver qué géneros y plataformas están disponibles
  console.log('Géneros disponibles en dropdown:', allGenres);
  console.log('Plataformas disponibles en dropdown:', allPlatforms);
  console.log('Género seleccionado:', selectedGenre);
  console.log('Plataforma seleccionada:', selectedPlatform);

  // LOG: Mostrar cómo llegan los datos crudos del backend
  games.forEach(game => {
    console.log('ID:', game.id, 'genre:', game.genre, 'typeof:', typeof game.genre, 'isArray:', Array.isArray(game.genre));
    console.log('ID:', game.id, 'platform:', game.platform, 'typeof:', typeof game.platform, 'isArray:', Array.isArray(game.platform));
  });

  // Persistencia de juegos eliminados
  useEffect(() => {
    localStorage.setItem('deletedGames', JSON.stringify(deletedIds));
  }, [deletedIds]);

  // Filtrado
  const filteredGames = games.filter(game => {
    if (deletedIds.includes(game.id)) return false;
    if (game.price > maxPrice) return false;

    // Normaliza genre y platform a array
    const genreArr = Array.isArray(game.genre) ? game.genre : [game.genre].filter(Boolean);
    const platformArr = Array.isArray(game.platform) ? game.platform : [game.platform].filter(Boolean);

    // LOG: Mostrar valores antes de filtrar
    console.log('--- FILTRANDO JUEGO ---');
    console.log('selectedGenre:', selectedGenre, '| normalizado:', normalize(selectedGenre));
    console.log('genreArr:', genreArr, '| normalizados:', genreArr.map(normalize));
    console.log('selectedPlatform:', selectedPlatform, '| normalizado:', normalize(selectedPlatform));
    console.log('platformArr:', platformArr, '| normalizados:', platformArr.map(normalize));

    // Género
    if (
      selectedGenre !== 'Todas' &&
      !genreArr.map(normalize).includes(normalize(selectedGenre))
    ) {
      console.log('NO PASA FILTRO GÉNERO', {selectedGenre, genreArr, normalizados: genreArr.map(normalize)});
      return false;
    }

    // Plataforma
    if (
      selectedPlatform !== 'Todas' &&
      !platformArr.map(normalize).includes(normalize(selectedPlatform))
    ) {
      console.log('NO PASA FILTRO PLATAFORMA', {selectedPlatform, platformArr, normalizados: platformArr.map(normalize)});
      return false;
    }

    if (showOffersOnly && !(game.esta_oferta === 1 || game.offer === true)) return false;
    return true;
  });

  // Handlers
  const handleDelete = (id: number) => {
    setDeletedIds(prev => [...prev, id]);
  };

  const handleGenreSelect = (genre: string) => {
    setSelectedGenre(genre);
  };
  const handlePlatformSelect = (platform: string) => {
    setSelectedPlatform(platform);
  };
  const handleOfferToggle = () => {
    setShowOffersOnly(prev => !prev);
  };

  const handleAddToCart = (game: Game) => {
    addToCart({
      id: game.id,
      title: game.title,
      price: game.price,
      image: game.image,
      quantity: 1
    });
    setCartMessage(`"${game.title}" agregado al carrito!`);
    setTimeout(() => setCartMessage(null), 2000);
  };

  return (
    <div className="container" style={{ maxWidth: 1200, marginTop: 40, marginBottom: 40 }}>
      {/* Carrusel de imágenes */}
      <div id="mainCarousel" className="carousel slide mb-4" data-bs-ride="carousel">
        <div className="carousel-inner">
          {carruselImages.map((img, idx) => (
            <div className={`carousel-item${idx === 0 ? ' active' : ''}`} key={img}>
              <img src={img} className="d-block w-100" alt={`Carrusel ${idx + 1}`} style={{ maxHeight: 350, objectFit: 'cover' }} />
            </div>
          ))}
        </div>
        <button className="carousel-control-prev" type="button" data-bs-target="#mainCarousel" data-bs-slide="prev">
          <span className="carousel-control-prev-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Anterior</span>
        </button>
        <button className="carousel-control-next" type="button" data-bs-target="#mainCarousel" data-bs-slide="next">
          <span className="carousel-control-next-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Siguiente</span>
        </button>
      </div>
      {/* Filtros */}
      <div className="row g-3 align-items-center mb-3">
        <div className="col-md-3">
          <label className="form-label fw-bold">Precio máximo: ${maxPrice}</label>
          <input
            type="range"
            min={0}
            max={maxGamePrice}
            value={maxPrice}
            onChange={e => setMaxPrice(Number(e.target.value))}
            className="form-range"
          />
        </div>
        <div className="col-md-3">
          <label className="form-label fw-bold">Género</label>
          <select 
            className="form-select" 
            value={selectedGenre} 
            onChange={(e) => handleGenreSelect(e.target.value)}
          >
            <option value="Todas">Todas</option>
            {Array.isArray(allGenres) && allGenres.length > 0 ? (
              allGenres.map(genre => (
                genre && <option key={genre} value={genre}>{genre}</option>
              ))
            ) : (
              <option disabled>Sin géneros</option>
            )}
          </select>
        </div>
        <div className="col-md-3">
          <label className="form-label fw-bold">Plataforma</label>
          <select 
            className="form-select" 
            value={selectedPlatform} 
            onChange={(e) => handlePlatformSelect(e.target.value)}
          >
            <option value="Todas">Todas</option>
            {Array.isArray(allPlatforms) && allPlatforms.length > 0 ? (
              allPlatforms.map(platform => (
                platform && <option key={platform} value={platform}>{platform}</option>
              ))
            ) : (
              <option disabled>Sin plataformas</option>
            )}
          </select>
        </div>
        <div className="col-md-3 d-flex align-items-end">
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              id="ofertaCheck"
              checked={showOffersOnly}
              onChange={handleOfferToggle}
            />
            <label className="form-check-label fw-bold" htmlFor="ofertaCheck">
              Solo ofertas
            </label>
          </div>
        </div>
      </div>
      <h2 className="mb-5 text-center fw-bold">Featured Games</h2>
      {cartMessage && (
        <div className="alert alert-success text-center" role="alert">
          {cartMessage}
        </div>
      )}
      <div className="row g-4">
        {loading && <div className="col-12 text-center text-muted">Cargando juegos...</div>}
        {error && <div className="col-12 text-center text-danger">{error}</div>}
        {filteredGames.length === 0 && !loading && (
          <div className="col-12 text-center text-muted">No hay juegos que coincidan con los filtros.</div>
        )}
        {filteredGames.map((game: any) => (
          <div className="col-12 col-sm-6 col-md-4 col-lg-3" key={game.id}>
            <div className="card h-100 shadow-lg rounded-4 border-0 position-relative">
              {game.esta_oferta === 1 || game.offer === true ? (
                <span className="badge bg-danger position-absolute top-0 end-0 m-2">Oferta</span>
              ) : null}
              <img
                src={game.image}
                className="card-img-top rounded-top-4"
                alt={game.title}
                style={{ objectFit: 'cover', height: 220, transition: 'transform 0.2s' }}
                onMouseOver={e => (e.currentTarget.style.transform = 'scale(1.04)')}
                onMouseOut={e => (e.currentTarget.style.transform = 'scale(1)')}
              />
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">{game.title}</h5>
                {game.esta_oferta === 1 && game.precio_oferta ? (
                  <>
                    <p className="card-text mb-1">
                      <span style={{ textDecoration: 'line-through', color: '#888', marginRight: 8 }}>${game.price.toFixed(2)}</span>
                      <span className="fw-bold text-danger">${game.precio_oferta.toFixed(2)}</span>
                    </p>
                  </>
                ) : (
                  <p className="card-text mb-1">${game.price.toFixed(2)}</p>
                )}
                <p className="mb-1"><span className="fw-bold">Género:</span> {(Array.isArray(game.genre) ? game.genre : [game.genre]).filter(Boolean).join(', ')}</p>
                <p className="mb-2"><span className="fw-bold">Plataforma:</span> {(Array.isArray(game.platform) ? game.platform : [game.platform]).filter(Boolean).join(', ')}</p>
                <div className="mt-auto d-flex gap-2">
                  <button className="btn btn-outline-primary flex-fill" onClick={() => window.location.href = `/game/${game.id}`}>Detalles</button>
                  <button className="btn btn-success flex-fill" onClick={() => handleAddToCart(game)}>Agregar al carrito</button>
                  {user?.role === 'admin' && (
                    <button className="btn btn-danger flex-fill" onClick={() => handleDelete(game.id)}>Eliminar</button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home; 