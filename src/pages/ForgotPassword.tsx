import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await fetch('http://localhost:3001/api/request-password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      setMessage('Si el correo existe, se enviará un enlace para restablecer tu contraseña.');
    } catch (err) {
      setMessage('Ocurrió un error. Intenta de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <h2>¿Olvidaste tu contraseña?</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="email">Correo electrónico:</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
        </button>
      </form>
      {message && <p>{message}</p>}
      <button onClick={() => navigate('/login')} style={{ marginTop: 16 }}>Volver al login</button>
    </div>
  );
};

export default ForgotPassword; 