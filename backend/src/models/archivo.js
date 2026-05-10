const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Archivo = sequelize.define('Archivo', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false
  },
  peso_bytes: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  mimetype: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, { 
  tableName: 'archivos',
  underscored: true 
});

module.exports = Archivo;