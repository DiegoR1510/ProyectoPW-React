import React from 'react';
import { Link } from 'react-router-dom';

const ThankYou: React.FC = () => {
  return (
    <div className="container mt-5 text-center">
      <h2>¡Gracias por tu compra!</h2>
      <p className="lead">Tu pedido ha sido procesado exitosamente.</p>
      <Link to="/" className="btn btn-primary mt-3">Volver al inicio</Link>
    </div>
  );
};

export default ThankYou; 