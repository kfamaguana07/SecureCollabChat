/**
 * Componente AdminLogin
 * Vista de login para administradores
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminAPI } from '../services/api';
import { validators } from '../utils/validators';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../utils/constants';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { loginAdmin, setErrorMessage } = useAuth();

  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Limpiar error del campo cuando comienza a escribir
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      // Validar credenciales
      const validation = validators.validateAdminCredentials(
        credentials.username,
        credentials.password
      );

      if (!validation.valid) {
        setErrors({ general: validation.error });
        setIsLoading(false);
        return;
      }

      // Realizar login
      const response = await adminAPI.login(
        credentials.username,
        credentials.password
      );

      if (response.token && response.admin) {
        loginAdmin(response.admin, response.token);
        navigate('/admin/dashboard');
      }
    } catch (error) {
      const errorMsg = error.message || ERROR_MESSAGES.NETWORK_ERROR;
      setErrors({ general: errorMsg });
      setErrorMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-secondary flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-secondary p-8 text-center">
            <h1 className="text-3xl font-bold text-white mb-2">SecureCollabChat</h1>
            <p className="text-purple-100">Panel de Administrador</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Error General */}
            {errors.general && (
              <div className="bg-danger bg-opacity-10 border border-danger border-opacity-50 text-danger px-4 py-3 rounded-lg text-sm">
                {errors.general}
              </div>
            )}

            {/* Username */}
            <div className="space-y-2">
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Usuario
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={credentials.username}
                onChange={handleInputChange}
                placeholder="Ingresa tu usuario"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition ${
                  errors.username
                    ? 'border-danger focus:ring-danger'
                    : 'border-gray-300'
                }`}
                disabled={isLoading}
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={credentials.password}
                onChange={handleInputChange}
                placeholder="Ingresa tu contraseña"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition ${
                  errors.password
                    ? 'border-danger focus:ring-danger'
                    : 'border-gray-300'
                }`}
                disabled={isLoading}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-primary to-secondary text-white font-semibold py-3 rounded-lg hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>

            {/* Info */}
            <p className="text-center text-sm text-gray-500">
              ¿Eres usuario?{' '}
              <button
                type="button"
                onClick={() => navigate('/user/login')}
                className="text-primary hover:text-secondary font-semibold transition"
              >
                Acceder a sala
              </button>
            </p>
          </form>
        </div>

        {/* Footer Info */}
        <div className="mt-6 text-center text-purple-100 text-sm">
          <p>Plataforma segura de comunicación en tiempo real</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
