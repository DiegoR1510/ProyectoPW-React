import React from 'react';

import { games } from '../data/games';
import GameCard from '../components/GameCard';
import type { Game } from '../data/games';

const TopSellers: React.FC = () => {
  // Ejemplo: los 4 primeros juegos como más vendidos
  const topSellers = games.slice(0, 4);
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