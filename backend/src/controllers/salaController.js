require('dotenv').config();
const bcrypt = require('bcrypt');
const { Worker } = require('worker_threads');
const path = require('path');
const { Sala, Sesion, Mensaje, Archivo } = require('../models');

function persistirArchivoEnWorker(datos) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(path.join(__dirname, '../workers/uploadWorker.js'), { workerData: datos });
    worker.on('message', (result) => {
      if (result.success) resolve(result.data);
      else reject(new Error(result.error));
    });
    worker.on('error', reject);
    worker.on('exit', (code) => {
      if (code !== 0) reject(new Error(`Worker salio con codigo ${code}`));
    });
  });
}

async function encontrarSalaPorPin(pin) {
  const salas = await Sala.findAll({ attributes: ['id', 'pin', 'tipo', 'created_at'] });
  for (const sala of salas) {
    const pinValido = await bcrypt.compare(String(pin), sala.pin);
    if (pinValido) return sala;
  }
  return null;
}

// ─────────────────────────────────────────────
// ADMIN: Crear Sala
// ─────────────────────────────────────────────
exports.crearSala = async (req, res) => {
  try {
    const { pin, tipo } = req.body;

    if (!pin || String(pin).length < 4) {
      return res.status(400).json({ error: 'El PIN debe tener al menos 4 dígitos.' });
    }
    if (!['texto', 'multimedia'].includes(tipo)) {
      return res.status(400).json({ error: 'El tipo debe ser "texto" o "multimedia".' });
    }

    const salaConPin = await encontrarSalaPorPin(pin);
    if (salaConPin) {
      return res.status(409).json({ error: 'Ya existe una sala con este PIN. Usa otro PIN.' });
    }

    // Encriptar el PIN antes de guardarlo
    const pinHash = await bcrypt.hash(String(pin), parseInt(process.env.BCRYPT_ROUNDS) || 10);

    const idUnico = `ROOM-${Math.floor(1000 + Math.random() * 9000)}`;
    const nuevaSala = await Sala.create({ id: idUnico, pin: pinHash, tipo });

    return res.status(201).json({
      id: nuevaSala.id,
      tipo: nuevaSala.tipo,
      createdAt: nuevaSala.created_at,
      mensaje: `Sala creada. Comparte el ID "${idUnico}" y el PIN a los usuarios.`
    });
  } catch (error) {
    console.error('[salaController.crearSala]', error);
    return res.status(500).json({ error: 'Error al crear la sala.' });
  }
};

// ADMIN: Listar todas las salas
exports.listarSalas = async (req, res) => {
  try {
    const salas = await Sala.findAll({
      attributes: ['id', 'tipo', 'created_at'],
      order: [['created_at', 'DESC']]
    });
    return res.json(salas);
  } catch (error) {
    console.error('[salaController.listarSalas]', error);
    return res.status(500).json({ error: 'Error al listar salas.' });
  }
};

// ADMIN: Eliminar sala
exports.eliminarSala = async (req, res) => {
  try {
    const sala = await Sala.findByPk(req.params.id);
    if (!sala) return res.status(404).json({ error: 'La sala no existe.' });

    await sala.destroy();
    return res.json({ mensaje: `Sala ${req.params.id} eliminada.` });
  } catch (error) {
    console.error('[salaController.eliminarSala]', error);
    return res.status(500).json({ error: 'Error al eliminar la sala.' });
  }
};

// ─────────────────────────────────────────────
// USUARIO: Unirse a Sala
// ─────────────────────────────────────────────
exports.unirseSala = async (req, res) => {
  try {
    const { nombre_real, pin, device_id } = req.body;

    if (!nombre_real || !pin || !device_id) {
      return res.status(400).json({ error: 'nombre_real, pin y device_id son requeridos.' });
    }

    const ipCliente = req.headers['x-forwarded-for'] || req.ip || req.connection.remoteAddress;

    const sala = await encontrarSalaPorPin(pin);


    
    if (!sala) return res.status(401).json({ error: 'PIN incorrecto.' });

    const sala_id = sala.id;

    // Verificar sesión única por dispositivo
    const sesionExistente = await Sesion.findOne({ where: { device_id } });

    if (sesionExistente) {
      if (sesionExistente.sala_id === sala_id) {
        // Reutilizar sesión existente en la misma sala
        return res.status(200).json({
          mensaje: 'Reutilizando sesión activa.',
          sesion: {
            id: sesionExistente.id,
            nickname: sesionExistente.nickname,
            sala_id: sesionExistente.sala_id,
            tipo: sala.tipo
          }
        });
      } else {
        return res.status(403).json({
          error: 'Ya tienes una sesión activa en otra sala. Ciérrala antes de unirte a una nueva.'
        });
      }
    }

    // Verificar sesión única por IP - evitar que la misma IP esté en dos salas
    const sesionPorIP = await Sesion.findOne({ where: { ip: ipCliente } });
    if (sesionPorIP && sesionPorIP.sala_id !== sala_id) {
      return res.status(403).json({
        error: 'Ya hay una sesión activa desde tu IP en otra sala. Ciérrala antes de unirte a esta sala.'
      });
    }

    // Generar nickname único dentro de la sala
    const nicknameBase = nombre_real.trim().replace(/[^a-zA-Z0-9_\-áéíóúÁÉÍÓÚñÑ ]/g, '');
    const nicknameUnico = `${nicknameBase}#${Math.floor(1000 + Math.random() * 9000)}`;

    const nuevaSesion = await Sesion.create({
      nombre_real: nicknameBase,
      nickname: nicknameUnico,
      device_id,
      ip: ipCliente,
      sala_id
    });

    return res.status(201).json({
      mensaje: 'Acceso concedido.',
      sesion: {
        id: nuevaSesion.id,
        nickname: nicknameUnico,
        sala_id,
        tipo: sala.tipo
      }
    });
  } catch (error) {
    console.error('[salaController.unirseSala]', error);
    return res.status(500).json({ error: 'Error del servidor.' });
  }
};

// ─────────────────────────────────────────────
// USUARIO: Obtener sesión activa por dispositivo
// ─────────────────────────────────────────────
exports.obtenerSesionActiva = async (req, res) => {
  try {
    const { device_id } = req.query;
    if (!device_id) {
      return res.status(400).json({ error: 'device_id es requerido.' });
    }

    const sesion = await Sesion.findOne({ where: { device_id } });
    if (!sesion) return res.status(404).json({ error: 'No hay sesión activa.' });

    const sala = await Sala.findByPk(sesion.sala_id);
    if (!sala) return res.status(404).json({ error: 'La sala no existe.' });

    return res.status(200).json({
      sesion: {
        id: sesion.id,
        nickname: sesion.nickname,
        sala_id: sesion.sala_id,
        tipo: sala.tipo
      }
    });
  } catch (error) {
    console.error('[salaController.obtenerSesionActiva]', error);
    return res.status(500).json({ error: 'Error al obtener sesión activa.' });
  }
};

// ─────────────────────────────────────────────
// SALA: Historial de Mensajes
// ─────────────────────────────────────────────
exports.obtenerMensajes = async (req, res) => {
  try {
    const sala = await Sala.findByPk(req.params.id);
    if (!sala) return res.status(404).json({ error: 'La sala no existe.' });

    const mensajes = await Mensaje.findAll({
      where: { sala_id: req.params.id },
      include: [
        { model: Sesion, as: 'autor', attributes: ['nickname'] },
        { model: Archivo, as: 'adjunto', attributes: ['url', 'mimetype', 'peso_bytes'] }
      ],
      order: [['created_at', 'ASC']]
    });

    const normalizados = mensajes.map((m) => {
      const json = m.toJSON();
      if (json.adjunto) {
        json.archivo = json.adjunto;
        delete json.adjunto;
      }
      return json;
    });

    return res.json(normalizados);
  } catch (error) {
    console.error('[salaController.obtenerMensajes]', error);
    return res.status(500).json({ error: 'Error al obtener mensajes.' });
  }
};

// ─────────────────────────────────────────────
// SALA: Usuarios conectados
// ─────────────────────────────────────────────
exports.obtenerUsuarios = async (req, res) => {
  try {
    const sala = await Sala.findByPk(req.params.id);
    if (!sala) return res.status(404).json({ error: 'La sala no existe.' });

    const sesiones = await Sesion.findAll({
      where: { sala_id: req.params.id },
      attributes: ['id', 'nickname', 'created_at']
    });

    return res.json({ sala_id: req.params.id, usuarios: sesiones });
  } catch (error) {
    console.error('[salaController.obtenerUsuarios]', error);
    return res.status(500).json({ error: 'Error al obtener usuarios.' });
  }
};

// ─────────────────────────────────────────────
// SALA MULTIMEDIA: Subida de archivos
// ─────────────────────────────────────────────
exports.subirArchivo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se seleccionó ningún archivo o excede el límite de 10MB.' });
    }

    const { sesion_id, sala_id } = req.body;

    // Verificar que la sala es de tipo multimedia
    const sala = await Sala.findByPk(sala_id);
    if (!sala) return res.status(404).json({ error: 'La sala no existe.' });
    if (sala.tipo !== 'multimedia') {
      return res.status(403).json({ error: 'Esta sala no permite subir archivos.' });
    }

    const urlArchivo = `/uploads/${req.file.filename}`;

    const resultado = await persistirArchivoEnWorker({
      contenido: `[Archivo: ${req.file.originalname}]`,
      sala_id,
      sesion_id: sesion_id || null,
      url: urlArchivo,
      peso_bytes: req.file.size,
      mimetype: req.file.mimetype
    });

    const io = req.app.get('io');
    if (io) {
      const sesion = sesion_id ? await Sesion.findByPk(sesion_id) : null;
      io.to(sala_id).emit('new_file', {
        mensaje_id: resultado.mensaje_id,
        archivo: {
          url: urlArchivo,
          mimetype: req.file.mimetype,
          peso_bytes: req.file.size
        },
        nickname: sesion?.nickname || 'Anonimo',
        timestamp: new Date().toISOString()
      });
    }

    res.status(201).json({
      mensaje: 'Archivo subido con éxito',
      archivo: {
        url: urlArchivo,
        nombre: req.file.originalname,
        mimetype: req.file.mimetype,
        peso_bytes: req.file.size
      },
      mensaje_id: resultado.mensaje_id
    });
  } catch (error) {
    console.error('[salaController.subirArchivo]', error);
    res.status(500).json({ error: 'Error al procesar la subida.' });
  }
};