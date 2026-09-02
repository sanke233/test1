import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      api.get('/auth/me')
        .then((data) => setUser(data.kullanici))
        .catch(() => {
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, sifre) => {
    const data = await api.post('/auth/login', { email, sifre });
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data.kullanici);
    return data;
  };

  const register = async (ad, email, sifre) => {
    const data = await api.post('/auth/register', { ad, email, sifre });
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data.kullanici);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const isAdmin = user && user.rol === 'admin';

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isAdmin, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
