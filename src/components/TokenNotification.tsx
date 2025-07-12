import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface TokenNotificationProps {
  message: string;
  onClose: () => void;
}

const TokenNotification: React.FC<TokenNotificationProps> = ({ message, onClose }) => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Esperar a que termine la animación
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const handleLoginClick = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
      navigate('/login');
    }, 300);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="position-fixed top-0 start-50 translate-middle-x p-3" style={{ zIndex: 1050 }}>
      <div className={`alert alert-warning alert-dismissible fade ${isVisible ? 'show' : ''}`} role="alert">
        <div className="d-flex align-items-center">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          <div>
            <strong>¡Atención!</strong> {message}
          </div>
        </div>
        <div className="mt-2">
          <button 
            type="button" 
            className="btn btn-sm btn-outline-warning me-2"
            onClick={handleLoginClick}
          >
            Ir al login
          </button>
          <button 
            type="button" 
            className="btn btn-sm btn-outline-secondary"
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 300);
            }}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default TokenNotification; 