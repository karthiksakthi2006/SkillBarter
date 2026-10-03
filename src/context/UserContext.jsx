import { createContext, useContext, useEffect, useState } from 'react';
import { api, getToken } from '../utils/api.js';

const UserContext = createContext(null);
const STORAGE_KEY = 'skillbarter_current_user';

export function UserProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(Boolean(getToken()));
  const [error, setError] = useState('');

  useEffect(() => {
    if (!getToken()) {
      setLoading(false);
      return;
    }

    api('/auth/me')
      .then((data) => setUser(data.user))
      .catch(() => {
        localStorage.removeItem('skillbarter_token');
        localStorage.removeItem(STORAGE_KEY);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    else localStorage.removeItem(STORAGE_KEY);
  }, [user]);

  async function login(username, password) {
    setError('');
    const data = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    localStorage.setItem('skillbarter_token', data.token);
    setUser(data.user);
    return data.user;
  }

  async function register(payload) {
    setError('');
    const data = await api('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    localStorage.setItem('skillbarter_token', data.token);
    setUser(data.user);
    return data.user;
  }

  function logout() {
    localStorage.removeItem('skillbarter_token');
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }

  async function updateProfile(updates) {
    const data = await api('/users/me', {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
    setUser(data.user);
    return data.user;
  }

  async function refreshUser() {
    const data = await api('/auth/me');
    setUser(data.user);
    return data.user;
  }

  return (
    <UserContext.Provider value={{
      user,
      loading,
      error,
      setError,
      login,
      register,
      logout,
      updateProfile,
      refreshUser
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used inside UserProvider');
  return ctx;
}
