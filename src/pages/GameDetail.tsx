import React, { useContext, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import StarRating from '../components/StarRating';
import { apiService, Game, Review } from '../services/api';



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
  const { addToCart } = useContext(CartContext);
  const { user, token } = useContext(AuthContext);
  
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [newReview, setNewReview] = useState({
    rating: 0,
    comment: ''
  });
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    const fetchGame = async () => {
      try {
        setLoading(true);
        const gameData = await apiService.getGame(Number(id));
        setGame(gameData);
      } catch (err) {
        setError('Error loading game');
        console.error('Error fetching game:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchGame();
    }
  }, [id]);

  if (loading) return <div className="container mt-4">Loading...</div>;
  if (error || !game) return <div className="container mt-4">Game not found.</div>;

  const averageRating = game.reviews.length > 0 
    ? game.reviews.reduce((sum: number, review: Review) => sum + review.rating, 0) / game.reviews.length 
    : 0;

  const handleSubmitReview = async () => {
    if (newReview.rating === 0 || !newReview.comment.trim()) {
      alert('Por favor completa la calificación y el comentario');
      return;
    }

    if (!token) {
      alert('Debes iniciar sesión para escribir una reseña');
      return;
    }

    try {
      await apiService.addReview(game.id, {
        comment: newReview.comment,
        rating: newReview.rating
      }, token);

      // Refresh the game data to show the new review
      const updatedGame = await apiService.getGame(game.id);
      setGame(updatedGame);
      
      setNewReview({ rating: 0, comment: '' });
      setShowReviewForm(false);
      alert('Reseña enviada exitosamente!');
    } catch (err: any) {
      console.error('Error submitting review:', err);
      
      // Manejar errores específicos
      if (err.message.includes('Token expirado')) {
        alert('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
        // El AuthContext ya maneja la redirección automáticamente
      } else if (err.message.includes('Token inválido')) {
        alert('Error de autenticación. Por favor, inicia sesión nuevamente.');
      } else {
        alert('Error al enviar la reseña. Inténtalo de nuevo.');
      }
    }
  };

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-md-5">
          <img src={game.image} alt={game.title} className="img-fluid rounded mb-3" />
        </div>
        <div className="col-md-7">
          <h2>{game.title}</h2>
          <div className="d-flex align-items-center mb-2">
            <StarRating rating={averageRating} readonly={true} size="lg" />
            <span className="ms-2 text-muted">({game.reviews.length} reseñas)</span>
          </div>
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
          
          {/* Review Form */}
          {user && (
            <div className="mb-4">
              {!showReviewForm ? (
                <button 
                  className="btn btn-outline-primary mb-3"
                  onClick={() => setShowReviewForm(true)}
                >
                  Escribir una reseña
                </button>
              ) : (
                <div className="card p-3 mb-3">
                  <h6>Escribir reseña</h6>
                  <div className="mb-3">
                    <label className="form-label">Calificación:</label>
                    <StarRating 
                      rating={newReview.rating} 
                      onRatingChange={(rating) => setNewReview(prev => ({ ...prev, rating }))}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Comentario:</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={newReview.comment}
                      onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                      placeholder="Comparte tu experiencia con este juego..."
                    />
                  </div>
                  <div className="d-flex gap-2">
                    <button 
                      className="btn btn-primary"
                      onClick={handleSubmitReview}
                    >
                      Enviar reseña
                    </button>
                    <button 
                      className="btn btn-secondary"
                      onClick={() => {
                        setShowReviewForm(false);
                        setNewReview({ rating: 0, comment: '' });
                      }}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Reviews List */}
          <ul className="list-group">
            {game.reviews.map((review: Review, idx: number) => (
              <li className="list-group-item" key={idx}>
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <strong>{review.user}</strong>
                    <div className="mt-1">
                      <StarRating rating={review.rating} readonly={true} size="sm" />
                    </div>
                    <p className="mb-0 mt-2">{review.comment}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default GameDetail; 