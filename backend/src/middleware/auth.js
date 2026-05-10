const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    // El token suele venir en el header: Authorization: Bearer <TOKEN>
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ error: 'Acceso denegado. No se proporcionó un token.' });
    }

    const token = authHeader.split(' ')[1];
    // Debe ser la misma clave secreta que pusiste en adminController.js
    const decodedToken = jwt.verify(token, 'FIRMA_SECRETA_ESPE_2026'); 
    
    req.adminData = { usuario: decodedToken.usuario };
    next(); // Si todo está bien, pasa al siguiente paso (crear la sala)
  } catch (error) {
    res.status(401).json({ error: 'Token inválido o expirado.' });
  }
};