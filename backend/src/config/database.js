const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  'SecureCollabChat', 
  'kevin',         
  'espe123',         
  {
    host: 'localhost', 
    port: 5432,
    dialect: 'postgres',
    logging: false,    // Mantiene la consola limpia
    define: {
      timestamps: true,
      underscored: true // Importante para que coincida con tus nombres en init.sql
    }
  }
);

// Prueba rápida de conexión
sequelize.authenticate()
  .then(() => console.log('Conexión a PostgreSQL exitosa.'))
  .catch(err => console.error('Error al conectar a la DB:', err));

module.exports = sequelize;