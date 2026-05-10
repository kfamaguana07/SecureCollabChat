require('dotenv').config();
const bcrypt = require('bcrypt');
const { Sala, Sesion, Mensaje, Archivo } = require('../models');

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
    const { nombre_real, pin, device_id, sala_id } = req.body;

    if (!nombre_real || !pin || !device_id || !sala_id) {
      return res.status(400).json({ error: 'nombre_real, pin, device_id y sala_id son requeridos.' });
    }

    const ipCliente = req.headers['x-forwarded-for'] || req.ip || req.connection.remoteAddress;

    const sala = await Sala.findByPk(sala_id);
    if (!sala) return res.status(404).json({ error: 'La sala no existe.' });

    // Verificar PIN encriptado
    const pinValido = await bcrypt.compare(String(pin), sala.pin);
    if (!pinValido) return res.status(401).json({ error: 'PIN incorrecto.' });

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

    return res.json(mensajes);
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

    // Crear mensaje con el archivo adjunto
    const mensaje = await Mensaje.create({
      contenido: `[Archivo: ${req.file.originalname}]`,
      sala_id,
      sesion_id: sesion_id || null
    });

    const archivo = await Archivo.create({
      url: urlArchivo,
      peso_bytes: req.file.size,
      mimetype: req.file.mimetype,
      mensaje_id: mensaje.id
    });

    res.status(201).json({
      mensaje: 'Archivo subido con éxito',
      archivo: {
        url: urlArchivo,
        nombre: req.file.originalname,
        mimetype: req.file.mimetype,
        peso_bytes: req.file.size
      },
      mensaje_id: mensaje.id
    });
  } catch (error) {
    console.error('[salaController.subirArchivo]', error);
    res.status(500).json({ error: 'Error al procesar la subida.' });
  }
};