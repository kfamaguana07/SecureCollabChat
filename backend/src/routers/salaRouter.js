const express = require('express');
const router = express.Router();
const salaController = require('../controllers/salaController');
const upload = require('../config/multer');

router.post('/', auth, salaController.crearSala);

router.post('/', salaController.crearSala); // POST /api/salas
router.post('/join', salaController.unirseSala); // POST /api/salas/join
router.get('/:id/mensajes', salaController.obtenerMensajes); // GET /api/salas/:id/mensajes

router.post('/:id/upload', upload.single('file'), salaController.subirArchivo);

module.exports = router;