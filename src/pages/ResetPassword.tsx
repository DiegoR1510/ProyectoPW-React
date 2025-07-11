import React, { useState } from 'react';

const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setStatus('error');
      setMessage('Token no proporcionado.');
      return;
    }
    setStatus('loading');
    setMessage('');
    try {
      const res = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Error al restablecer la contraseña');
      }
      setStatus('success');
      setMessage('¡Contraseña actualizada correctamente! Ya puedes iniciar sesión.');
      setPassword('');
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message);
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: 400 }}>
      <h2 className="mb-4 text-center">Restablecer contraseña</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Nueva contraseña</label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary w-100" disabled={status === 'loading'}>
          {status === 'loading' ? 'Actualizando...' : 'Actualizar contraseña'}
        </button>
      </form>
      {status === 'success' && <div className="alert alert-success mt-3">{message}</div>}
      {status === 'error' && <div className="alert alert-danger mt-3">{message}</div>}
      <div className="text-center mt-3">
        <a href="/login" className="btn btn-link">Ir a iniciar sesión</a>
      </div>
    </div>
  );
};

export default ResetPassword; 