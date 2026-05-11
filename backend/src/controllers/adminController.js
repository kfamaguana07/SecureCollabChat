require('dotenv').config();
const jwt = require('jsonwebtoken');
const { Worker } = require('worker_threads');
const path = require('path');
const { Administrador } = require('../models');

function ejecutarAuthWorker(datos) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(path.join(__dirname, '../workers/authWorker.js'), { workerData: datos });
    worker.on('message', (result) => {
      if (result.success) resolve(result.result);
      else reject(new Error(result.error));
    });
    worker.on('error', reject);
    worker.on('exit', (code) => {
      if (code !== 0) reject(new Error(`Worker salio con codigo ${code}`));
    });
  });
}

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

    // Comparar contraseña en worker thread
    const esValido = await ejecutarAuthWorker({
      mode: 'compare',
      password,
      hash: admin.password
    });

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

    const hash = await ejecutarAuthWorker({
      mode: 'hash',
      password,
      rounds: parseInt(process.env.BCRYPT_ROUNDS) || 10
    });
    const admin = await Administrador.create({ usuario, password: hash });

    res.status(201).json({ mensaje: 'Administrador creado.', id: admin.id });
  } catch (error) {
    console.error('[adminController.registrar]', error);
    res.status(500).json({ error: 'Error al registrar administrador.' });
  }
};