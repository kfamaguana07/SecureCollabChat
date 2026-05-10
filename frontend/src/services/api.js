/**
 * Servicio de API REST
 * Maneja todas las peticiones HTTP hacia el backend
 */

import axios from 'axios';
import { API_URL } from '../utils/constants.js';

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token de autenticación
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejo de errores
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message;
    return Promise.reject(new Error(message));
  }
);

export const adminAPI = {
  /**
   * Login de administrador
   */
  login: async (username, password) => {
    const response = await apiClient.post('/admin/login', { username, password });
    return response.data;
  },

  /**
   * Crear nueva sala
   */
  createRoom: async (roomData) => {
    const response = await apiClient.post('/admin/rooms', roomData);
    return response.data;
  },

  /**
   * Obtener todas las salas del administrador
   */
  getRooms: async () => {
    const response = await apiClient.get('/admin/rooms');
    return response.data;
  },

  /**
   * Obtener detalles de una sala
   */
  getRoomDetails: async (roomId) => {
    const response = await apiClient.get(`/admin/rooms/${roomId}`);
    return response.data;
  },

  /**
   * Actualizar sala
   */
  updateRoom: async (roomId, roomData) => {
    const response = await apiClient.put(`/admin/rooms/${roomId}`, roomData);
    return response.data;
  },

  /**
   * Eliminar sala
   */
  deleteRoom: async (roomId) => {
    const response = await apiClient.delete(`/admin/rooms/${roomId}`);
    return response.data;
  },

  /**
   * Logout de administrador
   */
  logout: async () => {
    const response = await apiClient.post('/admin/logout');
    return response.data;
  },
};

export const userAPI = {
  /**
   * Unirse a una sala (validar PIN)
   */
  joinRoom: async (roomId, pin) => {
    const response = await apiClient.post(`/salas/${roomId}/join`, { pin });
    return response.data;
  },

  /**
   * Obtener usuarios conectados en una sala
   */
  getRoomUsers: async (roomId) => {
    const response = await apiClient.get(`/salas/${roomId}/users`);
    return response.data;
  },

  /**
   * Obtener historial de mensajes de una sala
   */
  getRoomMessages: async (roomId, limit = 50, offset = 0) => {
    const response = await apiClient.get(`/salas/${roomId}/messages`, {
      params: { limit, offset },
    });
    return response.data;
  },

  /**
   * Subir archivo a una sala
   */
  uploadFile: async (roomId, file, metadata = {}) => {
    const formData = new FormData();
    formData.append('file', file);
    Object.keys(metadata).forEach((key) => {
      formData.append(key, metadata[key]);
    });

    const response = await apiClient.post(
      `/salas/${roomId}/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  /**
   * Salir de una sala
   */
  leaveRoom: async (roomId) => {
    const response = await apiClient.post(`/salas/${roomId}/leave`);
    return response.data;
  },
};

export default {
  adminAPI,
  userAPI,
};
