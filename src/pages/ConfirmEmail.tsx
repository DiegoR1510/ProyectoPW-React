import React, { useEffect, useState } from 'react';

const ConfirmEmail: React.FC = () => {
  const [status, setStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (!token) {
      setStatus('error');
      setMessage('Token no proporcionado.');
      return;
    }
    fetch(`/api/confirm-email?token=${token}`)
      .then(async res => {
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || 'Error al confirmar el correo');
        }
        return res.json();
      })
      .then(() => {
        setStatus('success');
        setMessage('¡Correo confirmado correctamente! Ya puedes iniciar sesión.');
      })
      .catch(err => {
        setStatus('error');
        setMessage(err.message);
      });
  }, []);

  return (
    <div className="container mt-5" style={{ maxWidth: 400 }}>
      <h2 className="mb-4 text-center">Confirmación de correo</h2>
      {status === 'pending' && <div className="alert alert-info">Confirmando tu correo...</div>}
      {status === 'success' && <div className="alert alert-success">{message}</div>}
      {status === 'error' && <div className="alert alert-danger">{message}</div>}
      <div className="text-center mt-3">
        <a href="/login" className="btn btn-link">Ir a iniciar sesión</a>
      </div>
    </div>
  );
};

export default ConfirmEmail; 