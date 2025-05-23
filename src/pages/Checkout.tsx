import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';

const Checkout: React.FC = () => {
  const { clearCart } = useContext(CartContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    card: '',
    exp: '',
    cvv: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    // Simple validation
    if (form.name && form.email && form.card && form.exp && form.cvv) {
      clearCart();
      navigate('/thankyou');
    }
  };

  return (
    <div className="container mt-4" style={{ maxWidth: 500 }}>
      <h2>Finalizar compra</h2>
      <form onSubmit={handleSubmit} noValidate>
        <div className="mb-3">
          <label className="form-label">Nombre</label>
          <input type="text" className={`form-control${submitted && !form.name ? ' is-invalid' : ''}`} name="name" value={form.name} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input type="email" className={`form-control${submitted && !form.email ? ' is-invalid' : ''}`} name="email" value={form.email} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label className="form-label">Número de tarjeta</label>
          <input type="text" className={`form-control${submitted && !form.card ? ' is-invalid' : ''}`} name="card" value={form.card} onChange={handleChange} required maxLength={19} />
        </div>
        <div className="row">
          <div className="col">
            <label className="form-label">Expiración</label>
            <input type="text" className={`form-control${submitted && !form.exp ? ' is-invalid' : ''}`} name="exp" value={form.exp} onChange={handleChange} required placeholder="MM/AA" maxLength={5} />
          </div>
          <div className="col">
            <label className="form-label">CVV</label>
            <input type="text" className={`form-control${submitted && !form.cvv ? ' is-invalid' : ''}`} name="cvv" value={form.cvv} onChange={handleChange} required maxLength={4} />
          </div>
        </div>
        <button type="submit" className="btn btn-success mt-3 w-100">Confirmar compra</button>
      </form>
    </div>
  );
};

export default Checkout; 