const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Mensaje = sequelize.define('Mensaje', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  contenido: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  fecha_envio: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW // Sequelize se encarga de enviarlo a la DB
  }
}, { 
  tableName: 'mensajes',
  underscored: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = Mensaje;