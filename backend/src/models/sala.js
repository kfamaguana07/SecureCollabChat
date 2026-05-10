const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Sala = sequelize.define('Sala', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true // El ID será el texto autogenerado
  },
  pin: {
    type: DataTypes.STRING,
    allowNull: false
  },
  tipo: {
    type: DataTypes.ENUM('texto', 'multimedia'),
    allowNull: false
  }
}, { 
  tableName: 'salas',
  underscored: true, // Para que reconozca created_at en lugar de createdAt
  createdAt: 'created_at',
  updatedAt: false 
});

module.exports = Sala;