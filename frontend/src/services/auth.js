import api from './api';

export async function login(email, password) {
  const { data } = await api.post('/login', { email, password });
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
  return data.user;
}

export async function register(email, password) {
  const { data } = await api.post('/register', { email, password });
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
  return data.user;
}

export async function logout() {
  try {
    await api.post('/logout');
  } finally {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
}

export function getStoredUser() {
  const raw = localStorage.getItem('user');
  return raw ? JSON.parse(raw) : null;
}
