const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid'); // Generar UUID

const app = express();

// Leer el puerto desde variables de entorno o usar 3000 como predeterminado
const PORT = process.env.PORT || 3000;

// Configuración de CORS
app.use(cors());

// Servir archivos estáticos (frontend y carpeta de imágenes)
app.use(express.static(path.join(__dirname, 'frontend')));
app.use('/imagenes', express.static(path.join(__dirname, 'imagenes')));

// Configuración de multer para subir imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'imagenes/');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`; // Nombre único con UUID
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

// Endpoint para subir imágenes
app.post('/upload', upload.single('image'), (req, res) => {
  const file = req.file;
  const metadataFile = path.join(__dirname, 'imagenes', 'metadata.json');

  if (!file) {
    return res.status(400).json({ error: 'No se ha subido ninguna imagen' });
  }

  // Leer o crear archivo de metadata
  const metadata = fs.existsSync(metadataFile)
    ? JSON.parse(fs.readFileSync(metadataFile))
    : { images: [] };

  metadata.images.push(file.filename); // Agregar el nombre único al metadata
  fs.writeFileSync(metadataFile, JSON.stringify(metadata, null, 2)); // Actualizar metadata.json

  res.json({ message: 'Imagen subida correctamente', fileName: file.filename });
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
