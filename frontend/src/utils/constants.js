/**
 * Constantes globales de la aplicación
 */

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

export const ROOM_TYPES = {
  TEXT: 'Texto',
  MULTIMEDIA: 'Multimedia',
};

export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
};

export const SOCKET_EVENTS = {
  // Conexión
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',

  // Sala
  JOIN_ROOM: 'joinRoom',
  LEAVE_ROOM: 'leaveRoom',
  ROOM_USERS_UPDATE: 'roomUsersUpdate',
  ROOM_ERROR: 'roomError',

  // Mensajes
  SEND_MESSAGE: 'sendMessage',
  RECEIVE_MESSAGE: 'receiveMessage',

  // Archivos
  SEND_FILE: 'sendFile',
  RECEIVE_FILE: 'receiveFile',
  FILE_ERROR: 'fileError',

  // Notificaciones
  USER_JOINED: 'userJoined',
  USER_LEFT: 'userLeft',
};

export const MESSAGE_TYPES = {
  TEXT: 'text',
  FILE: 'file',
  SYSTEM: 'system',
};

export const ERROR_MESSAGES = {
  SESSION_ACTIVE: 'Ya existe una sesión activa en este dispositivo',
  INVALID_PIN: 'PIN de sala incorrecto',
  NICKNAME_TAKEN: 'El nickname ya está en uso en esta sala',
  FILE_TOO_LARGE: 'El archivo supera el límite de 10MB',
  INVALID_FILE_TYPE: 'Tipo de archivo no permitido',
  ROOM_FULL: 'La sala está llena',
  ROOM_NOT_FOUND: 'La sala no existe',
  NETWORK_ERROR: 'Error de conexión. Intenta nuevamente.',
  UNAUTHORIZED: 'No autorizado. Por favor inicia sesión.',
};

export const SUCCESS_MESSAGES = {
  ROOM_CREATED: 'Sala creada exitosamente',
  MESSAGE_SENT: 'Mensaje enviado',
  FILE_UPLOADED: 'Archivo subido exitosamente',
  LOGGED_IN: 'Sesión iniciada correctamente',
};
