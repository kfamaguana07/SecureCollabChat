/**
 * Servicio de WebSocket con Socket.io
 * Maneja la comunicación bidireccional en tiempo real
 */

import io from 'socket.io-client';
import { SOCKET_URL, SOCKET_EVENTS } from '../utils/constants.js';

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.listeners = {};
  }

  /**
   * Conectar a servidor Socket.io
   */
  connect(token) {
    return new Promise((resolve, reject) => {
      try {
        this.socket = io(SOCKET_URL, {
          auth: {
            token,
          },
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: 5,
        });

        this.socket.on(SOCKET_EVENTS.CONNECT, () => {
          this.connected = true;
          console.log('Socket conectado:', this.socket.id);
          resolve(this.socket);
        });

        this.socket.on(SOCKET_EVENTS.DISCONNECT, () => {
          this.connected = false;
          console.log('Socket desconectado');
        });

        this.socket.on('error', (error) => {
          console.error('Error de socket:', error);
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Desconectar del servidor
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.connected = false;
    }
  }

  /**
   * Unirse a una sala
   */
  joinRoom(roomId, nickname, userId) {
    if (!this.socket) return;

    this.socket.emit(SOCKET_EVENTS.JOIN_ROOM, {
      roomId,
      nickname,
      userId,
    });
  }

  /**
   * Salir de una sala
   */
  leaveRoom(roomId, nickname) {
    if (!this.socket) return;

    this.socket.emit(SOCKET_EVENTS.LEAVE_ROOM, {
      roomId,
      nickname,
    });
  }

  /**
   * Enviar mensaje
   */
  sendMessage(roomId, message, messageType = 'text') {
    if (!this.socket) return;

    this.socket.emit(SOCKET_EVENTS.SEND_MESSAGE, {
      roomId,
      message,
      messageType,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Enviar archivo
   * NOTA: Idealmente se usa HTTP para archivos grandes,
   * pero dejamos placeholder para integración
   */
  sendFile(roomId, fileData) {
    if (!this.socket) return;

    this.socket.emit(SOCKET_EVENTS.SEND_FILE, {
      roomId,
      fileData,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Escuchar evento de recepción de mensajes
   */
  onReceiveMessage(callback) {
    if (!this.socket) return;

    this.socket.on(SOCKET_EVENTS.RECEIVE_MESSAGE, (data) => {
      callback(data);
    });
  }

  /**
   * Escuchar actualización de usuarios en la sala
   */
  onRoomUsersUpdate(callback) {
    if (!this.socket) return;

    this.socket.on(SOCKET_EVENTS.ROOM_USERS_UPDATE, (users) => {
      callback(users);
    });
  }

  /**
   * Escuchar usuario que se unió
   */
  onUserJoined(callback) {
    if (!this.socket) return;

    this.socket.on(SOCKET_EVENTS.USER_JOINED, (data) => {
      callback(data);
    });
  }

  /**
   * Escuchar usuario que se fue
   */
  onUserLeft(callback) {
    if (!this.socket) return;

    this.socket.on(SOCKET_EVENTS.USER_LEFT, (data) => {
      callback(data);
    });
  }

  /**
   * Escuchar errores de sala
   */
  onRoomError(callback) {
    if (!this.socket) return;

    this.socket.on(SOCKET_EVENTS.ROOM_ERROR, (error) => {
      callback(error);
    });
  }

  /**
   * Escuchar errores de archivo
   */
  onFileError(callback) {
    if (!this.socket) return;

    this.socket.on(SOCKET_EVENTS.FILE_ERROR, (error) => {
      callback(error);
    });
  }

  /**
   * Verificar si está conectado
   */
  isConnected() {
    return this.connected && this.socket?.connected;
  }
}

export const socketService = new SocketService();

export default socketService;
