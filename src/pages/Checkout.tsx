import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';

const Checkout: React.FC = () => {
  const { cart, clearCart } = useContext(CartContext);
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    card: '',
    exp: '',
    cvv: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setError('');
    if (form.name && form.email && form.card && form.exp && form.cvv) {
      setLoading(true);
      try {
        // Prepara los juegos para el backend
        const juegos = cart.map(item => ({
          juegoId: item.id,
          monto_pagado: item.price * item.quantity
        }));
        const res = await fetch('http://localhost:3001/api/ventas', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ juegos })
        });
        const data = await res.json();
        if (res.ok) {
          clearCart();
          navigate('/thankyou');
        } else {
          setError(data.message || 'Error al procesar la compra');
        }
      } catch (err) {
        setError('Error de red o del servidor');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="container" style={{ maxWidth: 500, marginTop: 40 }}>
      <h2 className="mb-4 text-center fw-bold">Pago</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Nombre en la tarjeta</label>
          <input type="text" className="form-control" name="name" value={form.name} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label className="form-label">Correo electrónico</label>
          <input type="email" className="form-control" name="email" value={form.email} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label className="form-label">Número de tarjeta</label>
          <input type="text" className="form-control" name="card" value={form.card} onChange={handleChange} required />
        </div>
        <div className="mb-3 d-flex gap-2">
          <div style={{ flex: 1 }}>
            <label className="form-label">Expiración</label>
            <input type="text" className="form-control" name="exp" value={form.exp} onChange={handleChange} required />
          </div>
          <div style={{ flex: 1 }}>
            <label className="form-label">CVV</label>
            <input type="text" className="form-control" name="cvv" value={form.cvv} onChange={handleChange} required />
          </div>
        </div>
        {error && <div className="alert alert-danger py-2">{error}</div>}
        <button type="submit" className="btn btn-success w-100" disabled={loading}>
          {loading ? 'Procesando...' : 'Pagar y finalizar compra'}
        </button>
      </form>
    </div>
  );
};

export default Checkout; 