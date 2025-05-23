import React from 'react';
import { games } from '../data/games';
import GameCard from '../components/GameCard';
import type { Game, Review } from '../data/games';

function getAverageRating(game: Game) {
  if (!game.reviews.length) return 0;
  return game.reviews.reduce((sum: number, r: Review) => sum + r.rating, 0) / game.reviews.length;
}

const TopRated: React.FC = () => {
  // Ordenar por promedio de calificación y tomar los 4 mejores
  const topRated = [...games]
    .sort((a: Game, b: Game) => getAverageRating(b) - getAverageRating(a))
    .slice(0, 4);
  return (
    <div className="container" style={{ maxWidth: 1200, marginTop: 40, marginBottom: 40 }}>
      <h2 className="mb-5 text-center fw-bold">Juegos con mejor calificación</h2>
      <div className="row justify-content-center g-4">
        {topRated.map((game: Game) => (
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

export default TopRated; 