const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Datos del administrador 
const ADMIN_USER = "admin_espe";
// Hash de la contraseña 'espe2026' (generado con bcrypt)
const ADMIN_PASS_HASH = "$2b$10$7v6NnF2.9.P8H/K7n6.puev8E/eS8Jm2H7Kj5Y3/Z1Y5H7Kj5Y3/Z"; 

exports.login = async (req, res) => {
  try {
    const { usuario, password } = req.body;

    if (usuario !== ADMIN_USER) {
      return res.status(401).json({ error: 'Usuario administrador no encontrado.' });
    }

    // Comparamos la contraseña de forma asíncrona (Uso de hilos/Event Loop)
    const esValido = await bcrypt.compare(password, ADMIN_PASS_HASH);
    
    if (!esValido) {
      return res.status(401).json({ error: 'Contraseña incorrecta.' });
    }

    // Generamos el Token JWT 
    const token = jwt.sign(
      { usuario: ADMIN_USER },
      'FIRMA_SECRETA_ESPE_2026', // Clave para firmar el token
      { expiresIn: '3h' } 
    );

    res.status(200).json({ 
      mensaje: 'Autenticación exitosa',
      token 
    });
  } catch (error) {
    res.status(500).json({ error: 'Error en el procesamiento de autenticación.' });
  }
};