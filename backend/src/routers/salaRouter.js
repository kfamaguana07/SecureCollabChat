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
router.delete('/:id/mensajes/:mid', salaController.eliminarMensaje);         // Eliminar mensaje
router.get('/:id/usuarios', salaController.obtenerUsuarios);               // Usuarios conectados

// ── Multimedia
router.post('/:id/upload', (req, res, next)=>{
    upload.single('file')(req, res, (err)=>{
        if(err){
            if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: 'El archivo es demasiado grande. El límite es de 10MB.' });
        };
        return res.status(400).json({ error: err.message });
        }
        next();
    })
}, salaController.subirArchivo); // Subir archivo

module.exports = router;