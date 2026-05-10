const Sala = require('./Sala');
const Sesion = require('./Sesion');
const Mensaje = require('./Mensaje');
const Archivo = require('./Archivo');
const Administrador = require('./Administrador');

// 1. Relación Sala - Sesión (Un usuario/dispositivo pertenece a una sala)
Sala.hasMany(Sesion, { foreignKey: 'sala_id', as: 'participantes' });
Sesion.belongsTo(Sala, { foreignKey: 'sala_id' });

// 2. Relación Sala - Mensaje (Los mensajes pertenecen a una sala específica)
Sala.hasMany(Mensaje, { foreignKey: 'sala_id', as: 'historial' });
Mensaje.belongsTo(Sala, { foreignKey: 'sala_id' });

// 3. Relación Sesión - Mensaje (Identifica quién envió el mensaje)
Sesion.hasMany(Mensaje, { foreignKey: 'sesion_id' });
Mensaje.belongsTo(Sesion, { foreignKey: 'sesion_id', as: 'autor' });

// 4. Relación Mensaje - Archivo (Para salas tipo multimedia)
Mensaje.hasOne(Archivo, { foreignKey: 'mensaje_id', as: 'adjunto' });
Archivo.belongsTo(Mensaje, { foreignKey: 'mensaje_id' });

module.exports = {
  Sala,
  Sesion,
  Mensaje,
  Archivo,
  Administrador
};