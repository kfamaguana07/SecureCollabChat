const express = require('express');
const router = express.Router();
const salaController = require('../controllers/salaController');
const auth = require('../middleware/auth');
const upload = require('../config/multer');

// ── Rutas de Administrador (requieren JWT) 
router.post('/', auth, salaController.crearSala);                          // Crear sala
router.get('/', auth, salaController.listarSalas);                         // Listar salas
router.delete('/:id', auth, salaController.eliminarSala);                  // Eliminar sala

// ── Rutas de Usuarios 
router.get('/sesion', salaController.obtenerSesionActiva);                 // Sesion activa por device_id
router.post('/join', salaController.unirseSala);                           // Unirse a sala con PIN
router.get('/:id/mensajes', salaController.obtenerMensajes);               // Historial de mensajes
router.get('/:id/usuarios', salaController.obtenerUsuarios);               // Usuarios conectados

// ── Multimedia
router.post('/:id/upload', upload.single('file'), salaController.subirArchivo); // Subir archivo

module.exports = router;