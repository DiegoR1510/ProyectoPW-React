import React, { useContext } from 'react';
import { useParams } from 'react-router-dom';
import { games } from '../data/games';
import { CartContext } from '../context/CartContext';

interface Review {
  user: string;
  comment: string;
  rating: number;
}

interface Game {
  id: number;
  title: string;
  image: string;
  price: number;
  trailer: string;
  reviews: Review[];
}

const getEmbedUrl = (url: string) => {
  // Si ya es un enlace /embed/, lo retorna igual
  if (url.includes('/embed/')) return url;
  // Si es un enlace watch?v=, lo convierte a /embed/
  const match = url.match(/v=([\w-]+)/);
  if (match) return `https://www.youtube.com/embed/${match[1]}`;
  return url;
};

const GameDetail: React.FC = () => {
  const { id } = useParams();
  const game = games.find((g: Game) => g.id === Number(id));
  const { addToCart } = useContext(CartContext);

  if (!game) return <div className="container mt-4">Game not found.</div>;

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-md-5">
          <img src={game.image} alt={game.title} className="img-fluid rounded mb-3" />
        </div>
        <div className="col-md-7">
          <h2>{game.title}</h2>
          <p className="lead">${game.price.toFixed(2)}</p>
          <button
            className="btn btn-success mb-3"
            onClick={() => addToCart({ id: game.id, title: game.title, price: game.price, image: game.image, quantity: 1 })}
          >
            Agregar al carrito
          </button>
          <div className="ratio ratio-16x9 mb-3">
            <iframe
              src={getEmbedUrl(game.trailer)}
              title="YouTube trailer"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              width="100%"
              height="315"
              style={{ border: 0 }}
            ></iframe>
          </div>
          <h4>Reviews</h4>
          <ul className="list-group">
            {game.reviews.map((review: Review, idx: number) => (
              <li className="list-group-item" key={idx}>
                <strong>{review.user}:</strong> {review.comment} <span className="text-warning">{'★'.repeat(review.rating)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default GameDetail; 