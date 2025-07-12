import React, { createContext, useState, useEffect } from 'react';
import { apiService, User } from '../services/api';
import TokenNotification from '../components/TokenNotification';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (name: string, password: string) => Promise<boolean>;
  logout: () => void;
  isTokenValid: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  login: async () => false,
  logout: () => {},
  isTokenValid: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('token');
  });
  const [isTokenValid, setIsTokenValid] = useState<boolean>(false);
  const [showTokenNotification, setShowTokenNotification] = useState(false);
  const [tokenNotificationMessage, setTokenNotificationMessage] = useState('');

  // Validar token al cargar la aplicación
  useEffect(() => {
    const validateStoredToken = async () => {
      if (token) {
        try {
          const isValid = await apiService.validateToken(token);
          setIsTokenValid(isValid);
          if (!isValid) {
            // Token inválido, limpiar datos
            setUser(null);
            setToken(null);
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            setTokenNotificationMessage('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
            setShowTokenNotification(true);
          }
        } catch (error) {
          // Error al validar, limpiar datos
          setUser(null);
          setToken(null);
          setIsTokenValid(false);
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          setTokenNotificationMessage('Error al validar tu sesión. Por favor, inicia sesión nuevamente.');
          setShowTokenNotification(true);
        }
      } else {
        setIsTokenValid(false);
      }
    };

    validateStoredToken();
  }, [token]);

  // Escuchar eventos de token expirado
  useEffect(() => {
    const handleTokenExpired = () => {
      console.log('Token expirado detectado, cerrando sesión...');
      setUser(null);
      setToken(null);
      setIsTokenValid(false);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      setTokenNotificationMessage('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
      setShowTokenNotification(true);
    };

    window.addEventListener('tokenExpired', handleTokenExpired);

    return () => {
      window.removeEventListener('tokenExpired', handleTokenExpired);
    };
  }, []);

  useEffect(() => {
    if (user && token) {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  }, [user, token]);

  const login = async (name: string, password: string) => {
    try {
      const res = await apiService.login(name, password);
      setUser(res.user);
      setToken(res.token);
      setIsTokenValid(true);
      return true;
    } catch (err) {
      setUser(null);
      setToken(null);
      setIsTokenValid(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setIsTokenValid(false);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isTokenValid }}>
      {children}
      {showTokenNotification && (
        <TokenNotification
          message={tokenNotificationMessage}
          onClose={() => setShowTokenNotification(false)}
        />
      )}
    </AuthContext.Provider>
  );
}; 