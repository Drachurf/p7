const multer = require('multer');
const path = require('path');

// Définition des types MIME autorisés et leurs extensions
const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png'
};

// Configuration de l'enregistrement des fichiers
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    // Indique le dossier de destination pour l'enregistrement des fichiers
    callback(null, 'images');
  },
  filename: (req, file, callback) => {
    const fileInfo = path.parse(file.originalname);
    const extension = MIME_TYPES[file.mimetype];
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileName = fileInfo.name.replace(/ /g, '_');
    const newFileName = `${fileName}-${uniqueSuffix}${extension ? '.' + extension : ''}`;
    callback(null, newFileName);
  }
});

// Exportation du middleware multer configuré pour enregistrer une seule image
module.exports = multer({storage: storage}).single('image');