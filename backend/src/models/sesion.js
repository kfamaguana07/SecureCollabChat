const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Sesion = sequelize.define('Sesion', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  nombre_real: {
    type: DataTypes.STRING,
    allowNull: false
  },
  nickname: {
    type: DataTypes.STRING,
    allowNull: false
  },
  device_id: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  ip: {
    type: DataTypes.STRING,
    allowNull: false
  },
  sala_id: {
    type: DataTypes.STRING,
    allowNull: false
  },
  socket_id: {
    type: DataTypes.STRING,
    allowNull: true  // Se actualiza cuando el usuario conecta por WebSocket
  }
}, { 
  tableName: 'sesiones',
  underscored: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = Sesion;