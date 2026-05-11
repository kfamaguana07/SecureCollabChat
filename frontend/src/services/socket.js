import { io } from 'socket.io-client';
import { SOCKET_URL, SOCKET_EVENTS } from '../config/constants.js';

let socket = null;

export const initSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      transports: ['websocket'],
    });
  }
  return socket;
};

export const getSocket   = () => socket || initSocket();
export const closeSocket = () => { socket?.disconnect(); socket = null; };

// Emitir
export const emitJoinRoom      = (sesion_id, sala_id)                        => getSocket().emit(SOCKET_EVENTS.JOIN_ROOM,       { sesion_id, sala_id });
export const emitSendMessage   = (contenido, sala_id, sesion_id)             => getSocket().emit(SOCKET_EVENTS.SEND_MESSAGE,    { contenido, sala_id, sesion_id });
export const emitTyping        = (sala_id)                                   => getSocket().emit(SOCKET_EVENTS.TYPING,          { sala_id });
export const emitStopTyping    = (sala_id)                                   => getSocket().emit(SOCKET_EVENTS.STOP_TYPING,     { sala_id });

// Escuchar (devuelven función de limpieza)
const on = (event, cb) => { const s = getSocket(); s.on(event, cb); return () => s.off(event, cb); };

export const onNewMessage         = (cb) => on(SOCKET_EVENTS.NEW_MESSAGE,          cb);
export const onNewFile            = (cb) => on(SOCKET_EVENTS.NEW_FILE,             cb);
export const onUsuarioEntro       = (cb) => on(SOCKET_EVENTS.USUARIO_ENTRO,        cb);
export const onUsuarioSalio       = (cb) => on(SOCKET_EVENTS.USUARIO_SALIO,        cb);
export const onListaUsuarios      = (cb) => on(SOCKET_EVENTS.LISTA_USUARIOS,       cb);
export const onUsuarioEscribiendo = (cb) => on(SOCKET_EVENTS.USUARIO_ESCRIBIENDO,  cb);
export const onUsuarioDejEscribir = (cb) => on(SOCKET_EVENTS.USUARIO_DEJO_ESCRIBIR,cb);
export const onSesionCerrada       = (cb) => on(SOCKET_EVENTS.SESION_CERRADA,       cb);
export const onErrorEvento        = (cb) => on(SOCKET_EVENTS.ERROR_EVENTO,         cb);