import React, { useEffect, useState, useContext } from 'react';
import { apiService } from '../services/api';
import { AuthContext } from '../context/AuthContext';

const UsuariosAdmin: React.FC = () => {
  const { token, user } = useContext(AuthContext);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [usuariosLoading, setUsuariosLoading] = useState(true);
  const [usuariosError, setUsuariosError] = useState('');
  const [usuariosCount, setUsuariosCount] = useState<number>(0);
  const [countLoading, setCountLoading] = useState(true);
  const [countError, setCountError] = useState('');

  useEffect(() => {
    if (!token) return;
    setUsuariosLoading(true);
    setUsuariosError('');
    apiService.getUsuarios(token)
      .then(data => setUsuarios(data))
      .catch(() => setUsuariosError('Error al cargar la lista de usuarios'))
      .finally(() => setUsuariosLoading(false));
  }, [token]);

  useEffect(() => {
    if (!token) return;
    setCountLoading(true);
    setCountError('');
    apiService.getUsuariosCount(token)
      .then(count => setUsuariosCount(count))
      .catch(() => setCountError('Error al cargar la cantidad de usuarios'))
      .finally(() => setCountLoading(false));
  }, [token]);

  if (!user || user.role !== 'admin') {
    return <div className="container mt-5"><h3>No autorizado</h3></div>;
  }

  return (
    <div className="container my-5">
      <h2 className="mb-4">Usuarios Registrados</h2>
      <div className="mb-4">
        {countLoading ? (
          <span>Cargando cantidad de usuarios...</span>
        ) : countError ? (
          <span className="text-danger">{countError}</span>
        ) : (
          <span className="fw-bold">Cantidad total de usuarios: {usuariosCount}</span>
        )}
      </div>
      <h4>Lista de usuarios</h4>
      {usuariosLoading ? (
        <p>Cargando usuarios...</p>
      ) : usuariosError ? (
        <p className="text-danger">{usuariosError}</p>
      ) : usuarios.length === 0 ? (
        <p className="text-muted">No hay usuarios registrados.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered mt-3">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Estado</th>
                <th>Verificado</th>
                <th>Rol</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map(u => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.nombre}</td>
                  <td>{u.correo}</td>
                  <td>{u.estado === 1 ? 'Activo' : 'Inactivo'}</td>
                  <td>{u.is_verified === 1 ? 'Sí' : 'No'}</td>
                  <td>{u.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UsuariosAdmin; 