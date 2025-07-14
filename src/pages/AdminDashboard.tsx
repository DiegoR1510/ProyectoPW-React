import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { apiService, Game } from '../services/api';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const data = {
  labels: [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ],
  datasets: [
    {
      label: 'Ganancias ($)',
      data: [1200, 1500, 1800, 2000, 1700, 2100, 2500, 2300, 2200, 2400, 2600, 3000],
      backgroundColor: 'rgba(54, 162, 235, 0.7)'
    }
  ]
};

const options = {
  responsive: true,
  plugins: {
    legend: { position: 'top' as const },
    title: { display: true, text: 'Ganancias por mes (2024)' }
  }
};

const AdminDashboard: React.FC = () => {
  const { user, token } = useContext(AuthContext);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [offerInputs, setOfferInputs] = useState<{ [id: number]: string }>({});
  const [offerStatus, setOfferStatus] = useState<{ [id: number]: { loading: boolean; error: string; success: string } }>({});
  const [earnings, setEarnings] = useState<number[]>(Array(12).fill(0));
  const [earningsLoading, setEarningsLoading] = useState(true);
  const [earningsError, setEarningsError] = useState('');
  const [ventas, setVentas] = useState<any[]>([]);
  const [ventasLoading, setVentasLoading] = useState(true);
  const [ventasError, setVentasError] = useState('');

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const data = await apiService.getGames();
        setGames(data);
        // Inicializar los inputs con el valor actual de oferta
        const initialInputs: { [id: number]: string } = {};
        data.forEach(g => {
          initialInputs[g.id] = g.precio_oferta !== null && g.precio_oferta !== undefined ? String(g.precio_oferta) : '';
        });
        setOfferInputs(initialInputs);
      } catch (err) {
        setError('Error al cargar los juegos');
      } finally {
        setLoading(false);
      }
    };
    fetchGames();
  }, []);

  useEffect(() => {
    const fetchEarnings = async () => {
      if (!token) return;
      setEarningsLoading(true);
      setEarningsError('');
      try {
        const data = await apiService.getEarningsByMonth(token);
        setEarnings(data);
      } catch (err) {
        setEarningsError('Error al cargar las ganancias');
      } finally {
        setEarningsLoading(false);
      }
    };
    fetchEarnings();
  }, [token]);

  useEffect(() => {
    const fetchVentas = async () => {
      if (!token) return;
      setVentasLoading(true);
      setVentasError('');
      try {
        const data = await apiService.getAllVentas(token);
        setVentas(data);
      } catch (err) {
        setVentasError('Error al cargar las ventas');
      } finally {
        setVentasLoading(false);
      }
    };
    fetchVentas();
  }, [token]);

  const handleOfferChange = (id: number, value: string) => {
    setOfferInputs(inputs => ({ ...inputs, [id]: value }));
    setOfferStatus(status => ({ ...status, [id]: { loading: false, error: '', success: '' } }));
  };

  const handleSetOffer = async (id: number) => {
    setOfferStatus(status => ({ ...status, [id]: { loading: true, error: '', success: '' } }));
    const value = offerInputs[id];
    if (value === '' || Number(value) === 0) {
      // Quitar oferta
      try {
        await apiService.setGameOffer(id, 0, localStorage.getItem('token') || '');
        setGames(games => games.map(g => g.id === id ? { ...g, precio_oferta: undefined } : g));
        setOfferStatus(status => ({ ...status, [id]: { loading: false, error: '', success: 'Oferta eliminada.' } }));
      } catch (err) {
        setOfferStatus(status => ({ ...status, [id]: { loading: false, error: 'Error al eliminar la oferta.', success: '' } }));
      }
      return;
    }
    if (isNaN(Number(value)) || Number(value) < 0) {
      setOfferStatus(status => ({ ...status, [id]: { loading: false, error: 'El precio de oferta debe ser un número positivo.', success: '' } }));
      return;
    }
    try {
      await apiService.setGameOffer(id, Number(value), localStorage.getItem('token') || '');
      setGames(games => games.map(g => g.id === id ? { ...g, precio_oferta: Number(value) } : g));
      setOfferStatus(status => ({ ...status, [id]: { loading: false, error: '', success: 'Precio de oferta actualizado.' } }));
    } catch (err) {
      setOfferStatus(status => ({ ...status, [id]: { loading: false, error: 'Error al actualizar el precio de oferta.', success: '' } }));
    }
  };

  if (!user || user.role !== 'admin') {
    return <div className="container mt-5"><h3>No autorizado</h3></div>;
  }

  const data = {
    labels: [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ],
    datasets: [
      {
        label: 'Ganancias ($)',
        data: earnings,
        backgroundColor: 'rgba(54, 162, 235, 0.7)'
      }
    ]
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Panel de Administrador</h2>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        {earningsLoading ? (
          <div className="text-center">Cargando ganancias...</div>
        ) : earningsError ? (
          <div className="text-danger text-center">{earningsError}</div>
        ) : (
          <Bar data={data} options={options} />
        )}
      </div>
      <hr className="my-5" />
      <h4>Ventas realizadas</h4>
      {ventasLoading ? (
        <p>Cargando ventas...</p>
      ) : ventasError ? (
        <p className="text-danger">{ventasError}</p>
      ) : ventas.length === 0 ? (
        <p className="text-muted">No hay ventas registradas.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered mt-3">
            <thead>
              <tr>
                <th>ID</th>
                <th>Usuario</th>
                <th>Juego</th>
                <th>Fecha</th>
                <th>Código</th>
                <th>Monto Pagado</th>
              </tr>
            </thead>
            <tbody>
              {ventas.map(v => (
                <tr key={v.id}>
                  <td>{v.id}</td>
                  <td>{v.usuario}</td>
                  <td>{v.juego}</td>
                  <td>{new Date(v.fecha).toLocaleString()}</td>
                  <td><span className="badge bg-secondary">{v.codigo}</span></td>
                  <td><strong>S/ {v.monto_pagado.toFixed(2)}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <hr className="my-5" />
      <h4>Juegos y Ofertas</h4>
      {loading ? <p>Cargando juegos...</p> : error ? <p className="text-danger">{error}</p> : (
        <table className="table table-bordered mt-3">
          <thead>
            <tr>
              <th>ID</th>
              <th>Título</th>
              <th>Precio</th>
              <th>Precio Oferta</th>
              <th>Editar Oferta</th>
            </tr>
          </thead>
          <tbody>
            {games.map(game => (
              <tr key={game.id}>
                <td>{game.id}</td>
                <td>{game.title}</td>
                <td>${game.price}</td>
                <td>{game.precio_oferta !== null && game.precio_oferta !== undefined ? `$${game.precio_oferta}` : '-'}</td>
                <td>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={offerInputs[game.id] ?? ''}
                    onChange={e => handleOfferChange(game.id, e.target.value)}
                    style={{ width: 90 }}
                    placeholder="Sin oferta"
                  />
                  <button
                    className="btn btn-sm btn-primary ms-2"
                    onClick={() => handleSetOffer(game.id)}
                    disabled={
                      offerStatus[game.id]?.loading ||
                      (offerInputs[game.id] === '' && (game.precio_oferta === undefined || game.precio_oferta === null)) ||
                      (offerInputs[game.id] !== '' && Number(offerInputs[game.id]) === game.precio_oferta)
                    }
                  >
                    {offerStatus[game.id]?.loading ? 'Guardando...' : 'Guardar'}
                  </button>
                  {offerStatus[game.id]?.error && <div className="text-danger small mt-1">{offerStatus[game.id].error}</div>}
                  {offerStatus[game.id]?.success && <div className="text-success small mt-1">{offerStatus[game.id].success}</div>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminDashboard; 