require('dotenv').config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Administrador } = require('../models');

exports.login = async (req, res) => {
  try {
    const { usuario, password } = req.body;

    if (!usuario || !password) {
      return res.status(400).json({ error: 'Usuario y contraseña son requeridos.' });
    }

    // Buscar administrador en la base de datos
    const admin = await Administrador.findOne({ where: { usuario } });

    if (!admin) {
      return res.status(401).json({ error: 'Usuario administrador no encontrado.' });
    }

    // Comparar contraseña de forma asíncrona (usa el Event Loop / hilos internos de bcrypt)
    const esValido = await bcrypt.compare(password, admin.password);

    if (!esValido) {
      return res.status(401).json({ error: 'Contraseña incorrecta.' });
    }

    const token = jwt.sign(
      { id: admin.id, usuario: admin.usuario },
      process.env.JWT_SECRET,
      { expiresIn: '3h' }
    );

    res.status(200).json({
      mensaje: 'Autenticación exitosa',
      token
    });
  } catch (error) {
    console.error('[adminController.login]', error);
    res.status(500).json({ error: 'Error en el procesamiento de autenticación.' });
  }
};

// Endpoint para inicializar/registrar el admin (solo si no existe)
exports.registrar = async (req, res) => {
  try {
    const { usuario, password } = req.body;

    if (!usuario || !password || password.length < 6) {
      return res.status(400).json({ error: 'Usuario y contraseña (mín. 6 chars) requeridos.' });
    }

    const existe = await Administrador.findOne({ where: { usuario } });
    if (existe) {
      return res.status(409).json({ error: 'El administrador ya existe.' });
    }

    const hash = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS) || 10);
    const admin = await Administrador.create({ usuario, password: hash });

    res.status(201).json({ mensaje: 'Administrador creado.', id: admin.id });
  } catch (error) {
    console.error('[adminController.registrar]', error);
    res.status(500).json({ error: 'Error al registrar administrador.' });
  }
};