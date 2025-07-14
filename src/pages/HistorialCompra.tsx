import React, { useEffect, useState } from 'react';
import { apiService, Venta } from '../services/api';
import 'bootstrap/dist/css/bootstrap.min.css';

const HistorialCompra: React.FC = () => {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (user?.id) {
      const token = localStorage.getItem('token') || undefined;
      apiService.getHistorialVentas(user.id, token)
        .then(data => setVentas(data))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [user.id]);

  if (loading) return <p className="text-center mt-4">Cargando historial...</p>;

  return (
    <div className="container my-5">
      <h2 className="mb-4 text-center">Historial de Compras</h2>
      <div className="table-responsive">
        <table className="table table-striped table-hover align-middle">
          <thead className="table-dark">
            <tr>
              <th scope="col">Juego</th>
              <th scope="col">Fecha</th>
              <th scope="col">Código</th>
              <th scope="col">Monto Pagado</th>
            </tr>
          </thead>
          <tbody>
            {ventas.map((v) => (
              <tr key={v.id}>
                <td>{v.juego}</td>
                <td>{new Date(v.fecha).toLocaleString()}</td>
                <td>
                  <span className="badge bg-secondary">{v.codigo}</span>
                </td>
                <td>
                  <strong>S/ {v.monto_pagado.toFixed(2)}</strong>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {ventas.length === 0 && (
        <div className="alert alert-info text-center mt-4">
          No se encontraron compras registradas.
        </div>
      )}
    </div>
  );
};

export default HistorialCompra;


