import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
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
  const { user } = useContext(AuthContext);

  if (!user || user.role !== 'admin') {
    return <div className="container mt-5"><h3>No autorizado</h3></div>;
  }

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Panel de Administrador</h2>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default AdminDashboard; 