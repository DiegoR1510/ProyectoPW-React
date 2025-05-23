import React, { useContext, useEffect, useState } from 'react';
import { games as allGames, Game } from '../data/games';
import GameCard from '../components/GameCard';
import { AuthContext } from '../context/AuthContext';

const carruselImages = [
  '/assets/carrusel/gta6.jpg',
  '/assets/carrusel/fc25.jpg',
  '/assets/carrusel/godofwar.png'
];

const getUnique = (arr: string[][]) => Array.from(new Set(arr.flat()));

const Home: React.FC = () => {
  const { user } = useContext(AuthContext);
  const [maxPrice, setMaxPrice] = useState(100);
  const [selectedGenre, setSelectedGenre] = useState<string>('Todos');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('Todos');
  const [deletedIds, setDeletedIds] = useState<number[]>(() => {
    const stored = localStorage.getItem('deletedGames');
    return stored ? JSON.parse(stored) : [];
  });

  // Obtener valores únicos
  const allGenres = getUnique(allGames.map(g => g.genre));
  const allPlatforms = getUnique(allGames.map(g => g.platform));
  const maxGamePrice = Math.ceil(Math.max(...allGames.map(g => g.price)));

  // Persistencia de juegos eliminados
  useEffect(() => {
    localStorage.setItem('deletedGames', JSON.stringify(deletedIds));
  }, [deletedIds]);

  // Filtrado
  const filteredGames = allGames.filter(game => {
    if (deletedIds.includes(game.id)) return false;
    if (game.price > maxPrice) return false;
    if (selectedGenre !== 'Todos' && !game.genre.includes(selectedGenre)) return false;
    if (selectedPlatform !== 'Todos' && !game.platform.includes(selectedPlatform)) return false;
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
      <div className="card p-3 mb-4 shadow-sm">
        <div className="row g-3 align-items-center">
          <div className="col-md-4">
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
          <div className="col-md-4">
            <label className="form-label fw-bold">Género</label>
            <div className="dropdown">
              <button className="btn btn-outline-secondary dropdown-toggle w-100" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                {selectedGenre}
              </button>
              <ul className="dropdown-menu w-100">
                <li><button className="dropdown-item" onClick={() => handleGenreSelect('Todos')}>Todos</button></li>
                {allGenres.map(genre => (
                  <li key={genre}><button className="dropdown-item" onClick={() => handleGenreSelect(genre)}>{genre}</button></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="col-md-4">
            <label className="form-label fw-bold">Plataforma</label>
            <div className="dropdown">
              <button className="btn btn-outline-secondary dropdown-toggle w-100" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                {selectedPlatform}
              </button>
              <ul className="dropdown-menu w-100">
                <li><button className="dropdown-item" onClick={() => handlePlatformSelect('Todos')}>Todos</button></li>
                {allPlatforms.map(platform => (
                  <li key={platform}><button className="dropdown-item" onClick={() => handlePlatformSelect(platform)}>{platform}</button></li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
      <h2 className="mb-5 text-center fw-bold">Featured Games</h2>
      <div className="row justify-content-center g-4">
        {filteredGames.length === 0 && (
          <div className="col-12 text-center text-muted">No hay juegos que coincidan con los filtros.</div>
        )}
        {filteredGames.map((game: Game) => (
          <div className="col-12 col-sm-6 col-md-4 col-lg-3" key={game.id}>
            <div className="card h-100 shadow-lg rounded-4 border-0">
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
                <p className="card-text mb-1">${game.price.toFixed(2)}</p>
                <p className="mb-1"><span className="fw-bold">Género:</span> {game.genre.join(', ')}</p>
                <p className="mb-2"><span className="fw-bold">Plataforma:</span> {game.platform.join(', ')}</p>
                <div className="mt-auto d-flex gap-2">
                  <button className="btn btn-outline-primary flex-fill" onClick={() => window.location.href = `/game/${game.id}`}>Detalles</button>
                  <button className="btn btn-success flex-fill">Agregar al carrito</button>
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