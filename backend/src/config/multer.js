const multer = require('multer');
const path = require('path');

// Configuración de almacenamiento en disco
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Los archivos se guardan en una carpeta física en el servidor
    cb(null, 'uploads/'); 
  },
  filename: (req, file, cb) => {
    // Generamos un nombre único para evitar colisiones entre usuarios
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Filtro para validar tipos de archivo (Requisito 3.1.2)
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|pdf/; // Tipos permitidos según el PDF
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error("Error: Solo se permiten imágenes y PDFs"));
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Límite estricto de 10MB (Rúbrica 5)
  fileFilter: fileFilter
});

module.exports = upload;