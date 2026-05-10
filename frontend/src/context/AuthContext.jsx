/**
 * Contexto de Autenticación y Estado Global
 * Gestiona la autenticación del usuario, administrador y estado de la sesión
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [isAuthenticated, isSetAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar datos de sesión del localStorage al montar el componente
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedAdmin = localStorage.getItem('admin');
    const storedRoom = localStorage.getItem('currentRoom');

    if (storedUser) {
      setUser(JSON.parse(storedUser));
      isSetAuthenticated(true);
    }
    if (storedAdmin) {
      setAdmin(JSON.parse(storedAdmin));
      isSetAuthenticated(true);
    }
    if (storedRoom) {
      setCurrentRoom(JSON.parse(storedRoom));
    }
  }, []);

  /**
   * Login de administrador
   */
  const loginAdmin = (adminData, token) => {
    setAdmin(adminData);
    localStorage.setItem('admin', JSON.stringify(adminData));
    localStorage.setItem('authToken', token);
    isSetAuthenticated(true);
    setError(null);
  };

  /**
   * Login de usuario en sala
   */
  const loginUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    isSetAuthenticated(true);
    setError(null);
  };

  /**
   * Establecer sala actual
   */
  const setRoom = (room) => {
    setCurrentRoom(room);
    localStorage.setItem('currentRoom', JSON.stringify(room));
  };

  /**
   * Logout
   */
  const logout = () => {
    setUser(null);
    setAdmin(null);
    setCurrentRoom(null);
    isSetAuthenticated(false);
    localStorage.removeItem('user');
    localStorage.removeItem('admin');
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentRoom');
    setError(null);
  };

  /**
   * Establecer error
   */
  const setErrorMessage = (errorMessage) => {
    setError(errorMessage);
    setTimeout(() => setError(null), 5000); // Auto-clear después de 5 segundos
  };

  /**
   * Limpiar error
   */
  const clearError = () => {
    setError(null);
  };

  const value = {
    // Estado
    user,
    admin,
    currentRoom,
    isAuthenticated,
    isLoading,
    error,

    // Métodos
    loginAdmin,
    loginUser,
    logout,
    setRoom,
    setErrorMessage,
    clearError,
    setIsLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook personalizado para usar el contexto de autenticación
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};

export default AuthContext;
