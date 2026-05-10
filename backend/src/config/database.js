require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    dialect: 'postgres',
    logging: false,
    define: {
      timestamps: true,
      underscored: true
    }
  }
);

sequelize.authenticate()
  .then(() => console.log('Conexión a PostgreSQL exitosa.'))
  .catch(err => console.error('Error al conectar a la DB:', err));

module.exports = sequelize;