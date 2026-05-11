const { parentPort, workerData } = require('worker_threads');
const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

(async () => {
  try {
    require('dotenv').config({ path: path.join(__dirname, '../../.env') });

    const sequelize = new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASSWORD,
      {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT) || 5432,
        dialect: 'postgres',
        logging: false
      }
    );

    const MensajeW = sequelize.define('Mensaje', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      contenido: { type: DataTypes.TEXT, allowNull: false },
      fecha_envio: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      sala_id: { type: DataTypes.STRING },
      sesion_id: { type: DataTypes.UUID }
    }, {
      tableName: 'mensajes',
      underscored: true,
      createdAt: 'created_at',
      updatedAt: false
    });

    const ArchivoW = sequelize.define('Archivo', {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      url: { type: DataTypes.STRING, allowNull: false },
      peso_bytes: { type: DataTypes.INTEGER, allowNull: false },
      mimetype: { type: DataTypes.STRING, allowNull: false },
      mensaje_id: { type: DataTypes.INTEGER, allowNull: false }
    }, {
      tableName: 'archivos',
      underscored: true,
      timestamps: false
    });

    const mensaje = await MensajeW.create({
      contenido: workerData.contenido,
      sala_id: workerData.sala_id,
      sesion_id: workerData.sesion_id
    });

    const archivo = await ArchivoW.create({
      url: workerData.url,
      peso_bytes: workerData.peso_bytes,
      mimetype: workerData.mimetype,
      mensaje_id: mensaje.id
    });

    parentPort.postMessage({
      success: true,
      data: {
        mensaje_id: mensaje.id,
        archivo: {
          url: archivo.url,
          mimetype: archivo.mimetype,
          peso_bytes: archivo.peso_bytes
        }
      }
    });

    await sequelize.close();
  } catch (error) {
    parentPort.postMessage({ success: false, error: error.message });
  }
})();
