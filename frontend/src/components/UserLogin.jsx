/**
 * Componente UserLogin
 * Vista de login para usuarios normales (acceso a sala por PIN)
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import { validators } from '../utils/validators';
import { ERROR_MESSAGES } from '../utils/constants';

const UserLogin = () => {
  const navigate = useNavigate();
  const { loginUser, setErrorMessage, setRoom } = useAuth();

  const [credentials, setCredentials] = useState({
    pin: '',
    nickname: '',
    roomId: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Solo permitir números para el PIN
    if (name === 'pin' && !/^\d*$/.test(value)) {
      return;
    }

    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Limpiar error del campo
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
      // Validaciones
      const pinValidation = validators.validatePin(credentials.pin);
      const nicknameValidation = validators.validateNickname(credentials.nickname);
      const roomIdValidation = validators.validateRoomId(credentials.roomId);

      const newErrors = {};

      if (!pinValidation.valid) {
        newErrors.pin = pinValidation.error;
      }
      if (!nicknameValidation.valid) {
        newErrors.nickname = nicknameValidation.error;
      }
      if (!roomIdValidation.valid) {
        newErrors.roomId = roomIdValidation.error;
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setIsLoading(false);
        return;
      }

      // Intentar unirse a la sala
      const response = await userAPI.joinRoom(credentials.roomId, credentials.pin);

      if (response.success) {
        // Guardar datos del usuario
        const userData = {
          nickname: credentials.nickname,
          roomId: credentials.roomId,
          userId: response.userId || Math.random().toString(36).substr(2, 9),
        };

        // Guardar datos de la sala
        const roomData = {
          id: credentials.roomId,
          type: response.roomType || 'Texto',
          name: response.roomName || credentials.roomId,
        };

        loginUser(userData);
        setRoom(roomData);

        navigate('/chat');
      }
    } catch (error) {
      let errorMsg = error.message || ERROR_MESSAGES.NETWORK_ERROR;

      // Mapear errores específicos del backend
      if (errorMsg.includes('PIN')) {
        setErrors({ pin: ERROR_MESSAGES.INVALID_PIN });
      } else if (errorMsg.includes('nickname') || errorMsg.includes('usuario')) {
        setErrors({ nickname: ERROR_MESSAGES.NICKNAME_TAKEN });
      } else if (errorMsg.includes('sesión')) {
        setErrors({ general: ERROR_MESSAGES.SESSION_ACTIVE });
      } else {
        setErrors({ general: errorMsg });
      }

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
            <p className="text-purple-100">Acceder a una Sala</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Error General */}
            {errors.general && (
              <div className="bg-danger bg-opacity-10 border border-danger border-opacity-50 text-danger px-4 py-3 rounded-lg text-sm">
                {errors.general}
              </div>
            )}

            {/* Room ID */}
            <div className="space-y-2">
              <label htmlFor="roomId" className="block text-sm font-medium text-gray-700">
                ID de Sala
              </label>
              <input
                type="text"
                id="roomId"
                name="roomId"
                value={credentials.roomId}
                onChange={handleInputChange}
                placeholder="Ej: sala-proyecto-1"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition ${
                  errors.roomId
                    ? 'border-danger focus:ring-danger'
                    : 'border-gray-300'
                }`}
                disabled={isLoading}
              />
              {errors.roomId && (
                <p className="text-sm text-danger">{errors.roomId}</p>
              )}
            </div>

            {/* PIN */}
            <div className="space-y-2">
              <label htmlFor="pin" className="block text-sm font-medium text-gray-700">
                PIN de Sala (mínimo 4 dígitos)
              </label>
              <input
                type="text"
                id="pin"
                name="pin"
                value={credentials.pin}
                onChange={handleInputChange}
                placeholder="0000"
                maxLength="6"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition text-center text-lg tracking-widest ${
                  errors.pin
                    ? 'border-danger focus:ring-danger'
                    : 'border-gray-300'
                }`}
                disabled={isLoading}
              />
              {errors.pin && (
                <p className="text-sm text-danger">{errors.pin}</p>
              )}
            </div>

            {/* Nickname */}
            <div className="space-y-2">
              <label htmlFor="nickname" className="block text-sm font-medium text-gray-700">
                Nickname (máx 20 caracteres)
              </label>
              <input
                type="text"
                id="nickname"
                name="nickname"
                value={credentials.nickname}
                onChange={handleInputChange}
                placeholder="tu_nombre_aqui"
                maxLength="20"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition ${
                  errors.nickname
                    ? 'border-danger focus:ring-danger'
                    : 'border-gray-300'
                }`}
                disabled={isLoading}
              />
              {errors.nickname && (
                <p className="text-sm text-danger">{errors.nickname}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-primary to-secondary text-white font-semibold py-3 rounded-lg hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Conectando...' : 'Acceder a Sala'}
            </button>

            {/* Info */}
            <p className="text-center text-sm text-gray-500">
              ¿Eres administrador?{' '}
              <button
                type="button"
                onClick={() => navigate('/admin/login')}
                className="text-primary hover:text-secondary font-semibold transition"
              >
                Ir a login
              </button>
            </p>
          </form>
        </div>

        {/* Footer Info */}
        <div className="mt-6 text-center text-purple-100 text-sm space-y-1">
          <p>Ingresa los datos de la sala que te compartieron</p>
          <p className="text-xs opacity-75">Necesitarás: ID de sala, PIN y un nickname único</p>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;
