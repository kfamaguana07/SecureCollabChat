const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.post('/login', adminController.login);           // POST /api/admin/login
router.post('/registrar', adminController.registrar);   // POST /api/admin/registrar (setup inicial)

module.exports = router;