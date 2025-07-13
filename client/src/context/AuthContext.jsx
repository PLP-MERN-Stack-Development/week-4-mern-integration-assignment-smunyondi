import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [isConnected, setIsConnected] = useState(true);
  const disconnectTimer = useRef(null);
  const navigate = useNavigate();

  // Ping server every 10 seconds
  useEffect(() => {
    let interval = setInterval(async () => {
      try {
        const res = await fetch('/api/ping');
        if (res.ok) {
          setIsConnected(true);
          if (disconnectTimer.current) {
            clearTimeout(disconnectTimer.current);
            disconnectTimer.current = null;
          }
        } else {
          handleDisconnect();
        }
      } catch {
        handleDisconnect();
      }
    }, 10000);

    function handleDisconnect() {
      setIsConnected(false);
      if (!disconnectTimer.current) {
        disconnectTimer.current = setTimeout(() => {
          logout();
        }, 30000); // 30 seconds
      }
    }

    return () => {
      clearInterval(interval);
      if (disconnectTimer.current) clearTimeout(disconnectTimer.current);
    };
    // eslint-disable-next-line
  }, [user]);

  // Login: just update user from localStorage (already set by authService.login)
  const login = () => {
    const stored = localStorage.getItem('user');
    setUser(stored ? JSON.parse(stored) : null);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, isConnected }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}