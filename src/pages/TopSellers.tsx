import React, { useState, useEffect } from 'react';
import StarRating from '../components/StarRating';
import { apiService, Game, Review } from '../services/api';

function getAverageRating(game: Game) {
  if (!game.reviews.length) return 0;
  return game.reviews.reduce((sum: number, r: Review) => sum + r.rating, 0) / game.reviews.length;
}

const TopSellers: React.FC = () => {
  const [topSellers, setTopSellers] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="container" style={{ maxWidth: 1200, marginTop: 40, marginBottom: 40 }}>
      <h2 className="mb-5 text-center fw-bold">Juegos más vendidos</h2>
      <div className="row justify-content-center g-4">
        {topSellers.map((game: Game) => (
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
                  <button className="btn btn-success flex-fill">Agregar al carrito</button>
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