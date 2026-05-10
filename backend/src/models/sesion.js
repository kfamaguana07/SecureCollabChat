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
    unique: true // Asegura que una PC solo tenga una sesión activa en la base de datos
  },
  ip: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, { 
  tableName: 'sesiones',
  timestamps: true,
  underscored: true
});

module.exports = Sesion;