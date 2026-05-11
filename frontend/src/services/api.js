import axios from 'axios';
import { API_URL, ENDPOINTS } from '../config/constants.js';

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
    }
    return Promise.reject(error);
  }
);

export const adminService = {
  login: async (usuario, password) => {
    const { data } = await api.post(ENDPOINTS.ADMIN_LOGIN, { usuario, password });
    localStorage.setItem('admin_token', data.token);
    return data;
  },
  registrar: async (usuario, password) => {
    const { data } = await api.post(ENDPOINTS.ADMIN_REGISTRAR, { usuario, password });
    return data;
  },
  logout: () => localStorage.removeItem('admin_token'),
  isAuthenticated: () => !!localStorage.getItem('admin_token'),
};

export const roomService = {
  crearSala:       async (pin, tipo)                          => (await api.post(ENDPOINTS.SALAS_CREAR, { pin, tipo })).data,
  listarSalas:     async ()                                   => (await api.get(ENDPOINTS.SALAS_LISTAR)).data,
  eliminarSala:    async (id)                                 => (await api.delete(ENDPOINTS.SALAS_ELIMINAR(id))).data,
  unirseSala:      async (nombre_real, pin, device_id, sala_id) => (await api.post(ENDPOINTS.SALAS_UNIRSE, { nombre_real, pin, device_id, sala_id })).data,
  obtenerMensajes: async (id)                                 => (await api.get(ENDPOINTS.SALAS_MENSAJES(id))).data,
  obtenerUsuarios: async (id)                                 => (await api.get(ENDPOINTS.SALAS_USUARIOS(id))).data,
  subirArchivo:    async (id, file, sesion_id) => {
    const form = new FormData();
    form.append('file', file);
    form.append('sesion_id', sesion_id);
    form.append('sala_id', id);
    return (await api.post(ENDPOINTS.SALAS_UPLOAD(id), form, { headers: { 'Content-Type': 'multipart/form-data' } })).data;
  },
};

export default api;