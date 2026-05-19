import React, { createContext, useContext, useState, useEffect } from 'react';
import { registerUser, loginUser, fetchMe } from '../api/auth';
import api from '../api/axios';

const GameContext = createContext();

export const GameProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  // On first mount: validate stored token and restore session
  useEffect(() => {
    const token = localStorage.getItem('zealToken');
    if (!token) {
      setLoading(false);
      return;
    }
    fetchMe()
      .then(({ user }) => {
        setUser(user);
        setBalance(user.coins ?? 100);
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  // REGISTER
  const register = async ({ username, email, password }) => {
    const { token, user } = await registerUser({ username, email, password });
    localStorage.setItem('zealToken', token);
    localStorage.setItem('zealUser', user.username);
    setUser(user);
    setBalance(user.coins ?? 100);
    return user;
  };

  // LOGIN
  const login = async ({ username, password }) => {
    const { token, user } = await loginUser({ username, password });
    localStorage.setItem('zealToken', token);
    localStorage.setItem('zealUser', user.username);
    setUser(user);
    setBalance(user.coins ?? 100);
    return user;
  };

  // LOGOUT
  const logout = () => {
    localStorage.removeItem('zealToken');
    localStorage.removeItem('zealUser');
    setUser(null);
    setBalance(0);
  };

  // UPDATE BALANCE — now hits backend, updates DB
  const updateBalance = async (delta) => {
    // Optimistic UI update
    setBalance(prev => prev + delta);
    try {
      const res = await api.post('/auth/coins', { delta });
      setBalance(res.data.coins);
    } catch (err) {
      // If it fails, roll back
      setBalance(prev => prev - delta);
      console.error('Failed to update coins:', err);
    }
  };

  return (
    <GameContext.Provider
      value={{ user, balance, loading, login, register, logout, updateBalance }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => useContext(GameContext);