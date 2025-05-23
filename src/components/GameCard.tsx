import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';

interface GameCardProps {
  id: number;
  title: string;
  image: string;
  price: number;
}

const GameCard: React.FC<GameCardProps> = ({ id, title, image, price }) => {
  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();

  return (
    <div className="card h-100 shadow-sm">
      <img
        src={image}
        className="card-img-top"
        alt={title}
        style={{ objectFit: 'cover', height: '200px' }}
      />
      <div className="card-body d-flex flex-column">
        <h5 className="card-title">{title}</h5>
        <p className="card-text">${price.toFixed(2)}</p>
        <div className="mt-auto d-flex gap-2">
          <button
            className="btn btn-outline-primary flex-fill"
            onClick={() => navigate(`/game/${id}`)}
          >
            Detalles
          </button>
          <button
            className="btn btn-success flex-fill"
            onClick={() => addToCart({ id, title, price, image, quantity: 1 })}
          >
            Agregar al carrito
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameCard; 