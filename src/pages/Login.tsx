import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login: React.FC = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', password: '' });
  const [error, setError] = useState('');
  const [view, setView] = useState<'login' | 'forgot' | 'register' | 'forgotSent' | 'registerSent'>('login');
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '' });
  const [forgotEmail, setForgotEmail] = useState('');

  // Login handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = await login(form.name, form.password);
    if (success) {
      navigate('/');
    } else {
      setError('Usuario o contraseña incorrectos');
    }
  };

  // Forgot password handlers
  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setView('forgotSent');
  };

  // Register handlers
  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRegisterForm({ ...registerForm, [e.target.name]: e.target.value });
  };
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setView('registerSent');
  };

  return (
    <div className="container mt-5" style={{ maxWidth: 400 }}>
      {view === 'login' && (
        <>
          <h2 className="mb-4">Iniciar sesión</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Usuario</label>
              <input
                type="text"
                className="form-control"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Contraseña</label>
              <input
                type="password"
                className="form-control"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>
            {error && <div className="alert alert-danger py-2">{error}</div>}
            <button type="submit" className="btn btn-primary w-100">Iniciar sesión</button>
          </form>
          <div className="d-flex flex-column align-items-center mt-3">
            <span className="text-muted" style={{fontSize: '0.95rem'}}>Usuario: <b>admin</b> o <b>usuario</b></span>
            <span className="text-muted" style={{fontSize: '0.95rem'}}>Contraseña: <b>admin123</b> o <b>usuario123</b></span>
          </div>
          <div className="text-center mt-3">
            <span>¿No tienes cuenta? </span>
            <a href="/register" className="btn btn-link">Regístrate</a>
          </div>
          <div style={{ marginTop: 16 }}>
            <Link to="/forgot-password">¿Olvidaste tu contraseña?</Link>
          </div>
        </>
      )}
      {view === 'forgot' && (
        <>
          <h2 className="mb-4">Recuperar contraseña</h2>
          <form onSubmit={handleForgotSubmit}>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                value={forgotEmail}
                onChange={e => setForgotEmail(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary w-100">Enviar instrucciones</button>
          </form>
          <button className="btn btn-link mt-3" onClick={() => setView('login')}>Volver al login</button>
        </>
      )}
      {view === 'forgotSent' && (
        <>
          <h2 className="mb-4">Recuperar contraseña</h2>
          <div className="alert alert-info">Si el correo existe, recibirás instrucciones para restablecer tu contraseña.</div>
          <button className="btn btn-link mt-3" onClick={() => setView('login')}>Volver al login</button>
        </>
      )}
      {view === 'register' && (
        <>
          <h2 className="mb-4">Registro de usuario</h2>
          <form onSubmit={handleRegisterSubmit}>
            <div className="mb-3">
              <label className="form-label">Nombre</label>
              <input
                type="text"
                className="form-control"
                name="name"
                value={registerForm.name}
                onChange={handleRegisterChange}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                name="email"
                value={registerForm.email}
                onChange={handleRegisterChange}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Contraseña</label>
              <input
                type="password"
                className="form-control"
                name="password"
                value={registerForm.password}
                onChange={handleRegisterChange}
                required
              />
            </div>
            <button type="submit" className="btn btn-success w-100">Registrarme</button>
          </form>
          <button className="btn btn-link mt-3" onClick={() => setView('login')}>Volver al login</button>
        </>
      )}
      {view === 'registerSent' && (
        <>
          <h2 className="mb-4">Registro de usuario</h2>
          <div className="alert alert-info">Te hemos enviado un correo para confirmar tu cuenta.</div>
          <button className="btn btn-link mt-3" onClick={() => setView('login')}>Volver al login</button>
        </>
      )}
    </div>
  );
};

export default Login; 