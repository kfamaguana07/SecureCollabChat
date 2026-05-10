const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Administrador = sequelize.define('Administrador', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  usuario: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, { 
  tableName: 'administradores',
  underscored: true,
  createdAt: 'created_at',   // Usar tu columna created_at
  updatedAt: false 
});

module.exports = Administrador;