// src/config/constants.js
export const API_URL    = import.meta.env.VITE_API_URL    || 'http://localhost:3000';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

export const ENDPOINTS = {
  ADMIN_LOGIN:     '/api/admin/login',
  ADMIN_REGISTRAR: '/api/admin/registrar',
  SALAS_CREAR:     '/api/salas',
  SALAS_LISTAR:    '/api/salas',
  SALAS_ELIMINAR:  (id) => `/api/salas/${id}`,
  SALAS_UNIRSE:    '/api/salas/join',
  SALAS_MENSAJES:  (id) => `/api/salas/${id}/mensajes`,
  SALAS_USUARIOS:  (id) => `/api/salas/${id}/usuarios`,
  SALAS_UPLOAD:    (id) => `/api/salas/${id}/upload`,
};

export const SOCKET_EVENTS = {
  JOIN_ROOM:            'join_room',
  SEND_MESSAGE:         'send_message',
  ARCHIVO_SUBIDO:       'archivo_subido',
  TYPING:               'typing',
  STOP_TYPING:          'stop_typing',
  NEW_MESSAGE:          'new_message',
  NEW_FILE:             'new_file',
  USUARIO_ENTRO:        'usuario_entro',
  USUARIO_SALIO:        'usuario_salio',
  LISTA_USUARIOS:       'lista_usuarios',
  USUARIO_ESCRIBIENDO:  'usuario_escribiendo',
  USUARIO_DEJO_ESCRIBIR:'usuario_dejo_escribir',
  ERROR_EVENTO:         'error_evento',
};