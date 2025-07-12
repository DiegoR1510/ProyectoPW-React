import React, { useState, useEffect, useContext } from 'react';
import StarRating from '../components/StarRating';
import { apiService, Game, Review } from '../services/api';
import { CartContext } from '../context/CartContext';

function getAverageRating(game: Game) {
  if (!game.reviews.length) return 0;
  return game.reviews.reduce((sum: number, r: Review) => sum + r.rating, 0) / game.reviews.length;
}

const getUnique = (arr: string[][]) => Array.from(new Set(arr.flat()));

function normalize(str: string) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // quita tildes
    .replace(/\s+/g, ''); // quita espacios
}

const TopSellers: React.FC = () => {
  const [topSellers, setTopSellers] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToCart } = useContext(CartContext);
  const [cartMessage, setCartMessage] = useState<string | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<string>('Todas');
  const [selectedPlatform, setSelectedPlatform] = useState('Todas');

  useEffect(() => {
    const fetchTopSellers = async () => {
      try {
        setLoading(true);
        const games = await apiService.getTopSellers();
        setTopSellers(games);
      } catch (err) {
        setError('Error loading top sellers');
        console.error('Error fetching top sellers:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTopSellers();
  }, []);
  if (loading) return <div className="container mt-4">Loading...</div>;
  if (error) return <div className="container mt-4">Error: {error}</div>;

  const allGenres = Array.from(new Set(topSellers.flatMap(g => Array.isArray(g.genre) ? g.genre : []).map(g => g && g.trim()).filter(Boolean)));
  const allPlatforms = Array.from(new Set(topSellers.flatMap(g => Array.isArray(g.platform) ? g.platform : []).map(p => p && p.trim()).filter(Boolean)));

  const filteredGames = topSellers.filter(game => {
    const genreArr = Array.isArray(game.genre) ? game.genre : [game.genre].filter(Boolean);
    const platformArr = Array.isArray(game.platform) ? game.platform : [game.platform].filter(Boolean);

    if (
      selectedGenre !== 'Todas' &&
      !genreArr.map(normalize).includes(normalize(selectedGenre))
    ) return false;

    if (
      selectedPlatform !== 'Todas' &&
      !platformArr.map(normalize).includes(normalize(selectedPlatform))
    ) return false;

    return true;
  });

  const handleGenreSelect = (genre: string) => setSelectedGenre(genre);
  const handlePlatformSelect = (platform: string) => setSelectedPlatform(platform);

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
      <h2 className="mb-5 text-center fw-bold">Juegos más vendidos</h2>
      <div className="row g-3 align-items-center mb-3">
        <div className="col-md-6">
          <label className="form-label fw-bold">Género</label>
          <select 
            className="form-select" 
            value={selectedGenre} 
            onChange={(e) => handleGenreSelect(e.target.value)}
          >
            <option value="Todas">Todas</option>
            {allGenres.length === 0 ? (
              <option disabled>Sin géneros</option>
            ) : (
              allGenres.map(genre => (
                <option key={genre} value={genre}>{genre}</option>
              ))
            )}
          </select>
        </div>
        <div className="col-md-6">
          <label className="form-label fw-bold">Plataforma</label>
          <select 
            className="form-select" 
            value={selectedPlatform} 
            onChange={(e) => handlePlatformSelect(e.target.value)}
          >
            <option value="Todas">Todas</option>
            {allPlatforms.length === 0 ? (
              <option disabled>Sin plataformas</option>
            ) : (
              allPlatforms.map(platform => (
                <option key={platform} value={platform}>{platform}</option>
              ))
            )}
          </select>
        </div>
      </div>
      {cartMessage && (
        <div className="alert alert-success text-center" role="alert">
          {cartMessage}
        </div>
      )}
      <div className="row justify-content-center g-4">
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
                <p className="card-text">${game.price.toFixed(2)}</p>
                <div className="mb-2">
                  <StarRating 
                    rating={getAverageRating(game)} 
                    readonly={true} 
                    size="sm"
                  />
                  <small className="text-muted ms-2">
                    ({game.reviews.length} reseñas)
                  </small>
                </div>
                <div className="mt-auto d-flex gap-2">
                  <button className="btn btn-outline-primary flex-fill" onClick={() => window.location.href = `/game/${game.id}`}>Detalles</button>
                  <button className="btn btn-success flex-fill" onClick={() => handleAddToCart(game)}>Agregar al carrito</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopSellers; 