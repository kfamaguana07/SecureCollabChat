const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const { Mensaje, Sesion, Sala, Archivo } = require('./models');
const path = require('path');

/**
 * Worker Thread: procesa y persiste un mensaje en la base de datos
 * en un hilo separado para no bloquear el hilo principal.
 * Se ejecuta cuando isMainThread = false (invocado como Worker).
 */
if (!isMainThread) {
  const { contenido, sala_id, sesion_id } = workerData;

  // Importaciones dentro del worker
  const { Sequelize } = require('sequelize');
  require('dotenv').config({ path: path.join(__dirname, '../.env') });

  // El worker usa su propia conexión a la DB
  const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      dialect: 'postgres',
      logging: false
    }
  );

  const { DataTypes } = require('sequelize');

  const MensajeW = sequelize.define('Mensaje', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    contenido: { type: DataTypes.TEXT, allowNull: false },
    fecha_envio: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    sala_id: { type: DataTypes.STRING },
    sesion_id: { type: DataTypes.UUID }
  }, { 
    tableName: 'mensajes', 
    underscored: true, 
    createdAt: 'created_at',
    updatedAt: false 
  });

  MensajeW.create({ contenido, sala_id, sesion_id })
    .then(msg => {
      parentPort.postMessage({ success: true, mensaje: msg.toJSON() });
      sequelize.close();
    })
    .catch(err => {
      parentPort.postMessage({ success: false, error: err.message });
      sequelize.close();
    });
}

/**
 * Función auxiliar: persiste un mensaje usando un Worker Thread
 */
function persistirMensajeEnWorker(datos) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(__filename, { workerData: datos });
    worker.on('message', (result) => {
      if (result.success) resolve(result.mensaje);
      else reject(new Error(result.error));
    });
    worker.on('error', reject);
    worker.on('exit', (code) => {
      if (code !== 0) reject(new Error(`Worker salió con código ${code}`));
    });
  });
}

/**
 * Configura todos los eventos de Socket.io
 * @param {import('socket.io').Server} io
 */
function configurarSockets(io) {

  const INACTIVITY_MS = parseInt(process.env.INACTIVITY_MS, 10) || 10 * 60 * 1000;
  const INACTIVITY_CHECK_MS = Math.min(60000, Math.max(10000, Math.floor(INACTIVITY_MS / 2)));

  // Almacén en memoria: { socket_id → { sesion_id, nickname, sala_id } }
  const usuariosConectados = new Map();
  const socketsPorSesion = new Map();
  const actividadPorSocket = new Map();

  const touchActividad = (socket) => {
    actividadPorSocket.set(socket.id, Date.now());
  };

  setInterval(() => {
    const now = Date.now();
    for (const [socketId, lastActivity] of actividadPorSocket.entries()) {
      if (now - lastActivity > INACTIVITY_MS) {
        const socket = io.sockets.sockets.get(socketId);
        if (socket) {
          socket.emit('error_evento', { error: 'Desconectado por inactividad.' });
          socket.disconnect(true);
        }
        actividadPorSocket.delete(socketId);
      }
    }
  }, INACTIVITY_CHECK_MS);

  io.on('connection', (socket) => {
    console.log(`🔌 Socket conectado: ${socket.id}`);
    touchActividad(socket);

    // ─── EVENTO: Unirse a sala ────────────────────────────────
    socket.on('join_room', async ({ sesion_id, sala_id }) => {
      touchActividad(socket);
      try {
        const sesion = await Sesion.findByPk(sesion_id);
        if (!sesion) {
          socket.emit('error_evento', { error: 'Sesión no encontrada. Vuelve a unirte a la sala.' });
          return;
        }
        if (sesion.sala_id !== sala_id) {
          socket.emit('error_evento', { error: 'La sesión no corresponde a esta sala.' });
          return;
        }

        // Actualizar socket_id en la sesión
        await sesion.update({ socket_id: socket.id });

        // Registrar en memoria
        usuariosConectados.set(socket.id, {
          sesion_id,
          nickname: sesion.nickname,
          sala_id
        });

        if (!socketsPorSesion.has(sesion_id)) {
          socketsPorSesion.set(sesion_id, new Set());
        }
        socketsPorSesion.get(sesion_id).add(socket.id);

        // Unir al room de Socket.io
        socket.join(sala_id);

        // Notificar a todos en la sala que alguien entró
        io.to(sala_id).emit('usuario_entro', {
          nickname: sesion.nickname,
          sala_id,
          timestamp: new Date().toISOString()
        });

        // Enviar lista actualizada de usuarios al nuevo usuario
        const sesiones = await Sesion.findAll({
          where: { sala_id },
          attributes: ['id', 'nickname']
        });
        socket.emit('lista_usuarios', { usuarios: sesiones });

        console.log(`👤 ${sesion.nickname} entró a la sala ${sala_id}`);
      } catch (err) {
        console.error('[socketHandler.join_room]', err);
        socket.emit('error_evento', { error: 'Error al unirse a la sala.' });
      }
    });

    // ─── EVENTO: Enviar mensaje de texto ─────────────────────
    socket.on('send_message', async ({ contenido, sala_id, sesion_id }) => {
      touchActividad(socket);
      try {
        if (!contenido || !contenido.trim()) {
          socket.emit('error_evento', { error: 'El mensaje no puede estar vacío.' });
          return;
        }
        if (contenido.length > 2000) {
          socket.emit('error_evento', { error: 'Mensaje demasiado largo (máx. 2000 caracteres).' });
          return;
        }

        // Verificar que el usuario pertenece a la sala
        const datosUsuario = usuariosConectados.get(socket.id);
        if (!datosUsuario || datosUsuario.sala_id !== sala_id) {
          socket.emit('error_evento', { error: 'No estás en esta sala.' });
          return;
        }

        // ★ Persistir en DB usando Worker Thread (no bloquea el hilo principal)
        const mensajeGuardado = await persistirMensajeEnWorker({
          contenido: contenido.trim(),
          sala_id,
          sesion_id
        });

        // Broadcast a todos en la sala incluyendo al emisor
        io.to(sala_id).emit('new_message', {
          id: mensajeGuardado.id,
          contenido: mensajeGuardado.contenido,
          sala_id,
          sesion_id,
          nickname: datosUsuario.nickname,
          timestamp: mensajeGuardado.created_at || new Date().toISOString()
        });

      } catch (err) {
        console.error('[socketHandler.send_message]', err);
        socket.emit('error_evento', { error: 'Error al enviar el mensaje.' });
      }
    });

    // ─── EVENTO: Notificar archivo subido (después del upload HTTP) ──
    socket.on('archivo_subido', ({ sala_id, archivo, nickname, mensaje_id }) => {
      touchActividad(socket);
      io.to(sala_id).emit('new_file', {
        mensaje_id,
        archivo,
        nickname,
        timestamp: new Date().toISOString()
      });
    });

    // ─── EVENTO: Eliminar mensaje ─────────────────────────────
    socket.on('delete_message', async ({ mensaje_id, sala_id, sesion_id }) => {
      touchActividad(socket);
      try {
        const datosUsuario = usuariosConectados.get(socket.id);
        if (!datosUsuario || datosUsuario.sala_id !== sala_id) {
          socket.emit('error_evento', { error: 'No estás en esta sala.' });
          return;
        }

        const mensaje = await Mensaje.findByPk(mensaje_id);
        if (!mensaje) {
          socket.emit('error_evento', { error: 'Mensaje no encontrado.' });
          return;
        }

        if (mensaje.sala_id !== sala_id) {
          socket.emit('error_evento', { error: 'El mensaje no pertenece a esta sala.' });
          return;
        }

        if (mensaje.sesion_id !== sesion_id) {
          socket.emit('error_evento', { error: 'Solo puedes eliminar tus propios mensajes.' });
          return;
        }

        await mensaje.destroy();

        io.to(sala_id).emit('message_deleted', {
          mensaje_id,
          sala_id,
          timestamp: new Date().toISOString()
        });

      } catch (err) {
        console.error('[socketHandler.delete_message]', err);
        socket.emit('error_evento', { error: 'Error al eliminar el mensaje.' });
      }
    });

    // ─── EVENTO: Usuario escribiendo (indicador "está escribiendo...") ──
    socket.on('typing', ({ sala_id }) => {
      touchActividad(socket);
      const datosUsuario = usuariosConectados.get(socket.id);
      if (datosUsuario) {
        socket.to(sala_id).emit('usuario_escribiendo', {
          nickname: datosUsuario.nickname
        });
      }
    });

    socket.on('stop_typing', ({ sala_id }) => {
      touchActividad(socket);
      const datosUsuario = usuariosConectados.get(socket.id);
      if (datosUsuario) {
        socket.to(sala_id).emit('usuario_dejo_escribir', {
          nickname: datosUsuario.nickname
        });
      }
    });

    // ─── EVENTO: Desconexión ──────────────────────────────────
    socket.on('disconnect', async () => {
      actividadPorSocket.delete(socket.id);
      const datosUsuario = usuariosConectados.get(socket.id);

      if (datosUsuario) {
        const { sesion_id, nickname, sala_id } = datosUsuario;
        const socketsSesion = socketsPorSesion.get(sesion_id) || new Set();

        try {
          // Eliminar sesión de la DB (desconexión automática)
          await Sesion.destroy({ where: { id: sesion_id } });
        } catch (err) {
          console.error('[socketHandler.disconnect] Error eliminando sesión:', err);
        }

        // Cerrar otras pestañas/sockets que compartan la misma sesión
        for (const otherSocketId of socketsSesion) {
          if (otherSocketId === socket.id) continue;
          const otherSocket = io.sockets.sockets.get(otherSocketId);
          if (otherSocket) {
            otherSocket.emit('sesion_cerrada', { reason: 'Sesion cerrada en otra pestaña.' });
            otherSocket.disconnect(true);
          }
          usuariosConectados.delete(otherSocketId);
          actividadPorSocket.delete(otherSocketId);
        }
        socketsPorSesion.delete(sesion_id);

        // Notificar a la sala que el usuario salió
        io.to(sala_id).emit('usuario_salio', {
          nickname,
          sala_id,
          timestamp: new Date().toISOString()
        });

        usuariosConectados.delete(socket.id);
        console.log(`🔴 ${nickname} salió de la sala ${sala_id}`);
      }

      console.log(`🔌 Socket desconectado: ${socket.id}`);
    });
  });
}

module.exports = { configurarSockets };