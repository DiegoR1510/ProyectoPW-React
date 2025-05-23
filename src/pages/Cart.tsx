import React, { useContext } from 'react';
import { CartContext } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

const Cart: React.FC = () => {
  const { cart, removeFromCart, clearCart } = useContext(CartContext);
  const navigate = useNavigate();

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (cart.length === 0) {
    return (
      <div className="container" style={{ maxWidth: 900, marginTop: 40, marginBottom: 40 }}>
        <h2 className="mb-4 text-center fw-bold">Carrito de compras</h2>
        <div className="alert alert-info text-center">Tu carrito está vacío.</div>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: 900, marginTop: 40, marginBottom: 40 }}>
      <h2 className="mb-4 text-center fw-bold">Carrito de compras</h2>
      <div className="table-responsive">
        <table className="table align-middle table-bordered shadow-sm bg-white rounded-4">
          <thead className="table-light">
            <tr>
              <th>Juego</th>
              <th>Precio</th>
              <th>Cantidad</th>
              <th>Subtotal</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {cart.map(item => (
              <tr key={item.id}>
                <td className="d-flex align-items-center gap-2">
                  <img src={item.image} alt={item.title} style={{ width: 60, height: 40, objectFit: 'cover', borderRadius: 8 }} />
                  <span>{item.title}</span>
                </td>
                <td>${item.price.toFixed(2)}</td>
                <td>{item.quantity}</td>
                <td>${(item.price * item.quantity).toFixed(2)}</td>
                <td>
                  <button className="btn btn-danger btn-sm" onClick={() => removeFromCart(item.id)}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h4 className="text-end mt-4">Total: <span className="text-success">${total.toFixed(2)}</span></h4>
      <div className="d-flex gap-2 mt-3 justify-content-end">
        <button className="btn btn-secondary" onClick={clearCart}>Vaciar carrito</button>
        <button className="btn btn-success" onClick={() => navigate('/checkout')}>Proceder al pago</button>
      </div>
    </div>
  );
};

export default Cart; 