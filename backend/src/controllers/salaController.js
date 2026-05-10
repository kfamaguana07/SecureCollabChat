const { Sala, Sesion, Mensaje } = require('../models');

// Crear Sala (Admin)
exports.crearSala = async (req, res) => {
  try {
    const { pin, tipo } = req.body;
    if (!pin || pin.length < 4) {
      return res.status(400).json({ error: 'El PIN debe tener al menos 4 dígitos.' });
    }
    const idUnico = `ROOM-${Math.floor(1000 + Math.random() * 9000)}`;
    const nuevaSala = await Sala.create({ id: idUnico, pin, tipo });
    return res.status(201).json(nuevaSala);
  } catch (error) {
    return res.status(500).json({ error: 'Error al crear la sala.' });
  }
};

// Unirse a Sala (Usuario)
exports.unirseSala = async (req, res) => {
  try {
    const { nombre_real, pin, device_id, sala_id } = req.body;
    const ipCliente = req.ip || req.connection.remoteAddress;

    const sala = await Sala.findByPk(sala_id);
    if (!sala) return res.status(404).json({ error: 'La sala no existe.' });
    if (sala.pin !== pin) return res.status(401).json({ error: 'PIN incorrecto.' });

    const sesionExistente = await Sesion.findOne({ where: { device_id } });

    if (sesionExistente) {
      if (sesionExistente.sala_id === sala_id) {
        return res.status(200).json({ mensaje: 'Reutilizando sesión activa.', sesion: sesionExistente });
      } else {
        return res.status(403).json({ error: 'Acceso denegado. Sesión activa en otra sala.' });
      }
    }

    const nicknameUnico = `${nombre_real}#${Math.floor(1000 + Math.random() * 9000)}`;
    const nuevaSesion = await Sesion.create({
      nombre_real, nickname: nicknameUnico, device_id, ip: ipCliente, sala_id
    });

    return res.status(201).json({ mensaje: 'Acceso concedido.', sesion: nuevaSesion });
  } catch (error) {
    return res.status(500).json({ error: 'Error del servidor.' });
  }
};

// Historial de Mensajes
exports.obtenerMensajes = async (req, res) => {
  try {
    const mensajes = await Mensaje.findAll({
      where: { sala_id: req.params.id },
      include: [{ model: Sesion, as: 'autor', attributes: ['nickname'] }],
      order: [['created_at', 'ASC']] 
    });
    return res.json(mensajes);
  } catch (error) {
    return res.status(500).json({ error: 'Error al obtener mensajes.' });
  }
};

exports.subirArchivo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se seleccionó ningún archivo o excede el límite.' });
    }

    // El archivo ya está en 'uploads/'. Aquí podrías guardar la ruta en la DB.
    res.status(201).json({
      mensaje: 'Archivo subido con éxito',
      archivo: req.file.filename
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al procesar la subida.' });
  }
};