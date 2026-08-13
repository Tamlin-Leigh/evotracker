import { useState, useEffect } from 'react';
import api from '../services/api';
import { getStoredUser, logout as logoutRequest } from '../services/auth';

export function useAuth() {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    if (!getStoredUser()) {
      setUser(null);
      return;
    }
    api.get('/me')
      .then(({ data }) => setUser(data))
      .catch(() => setUser(null));
  }, []);

  const logout = async () => {
    await logoutRequest();
    setUser(null);
  };

  return { user, loading: user === undefined, logout };
}
