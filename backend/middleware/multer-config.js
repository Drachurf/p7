const multer = require('multer');

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
    // Crée un nom unique pour le fichier en remplaçant les espaces par des underscores et 
    // en ajoutant la date et l'extension appropriée
    const name = file.originalname.split(' ').join('_');
    const extension = MIME_TYPES[file.mimetype];
    callback(null, name + Date.now() + '.' + extension);
  }
});

// Exportation du middleware multer configuré pour enregistrer une seule image
module.exports = multer({storage: storage}).single('image');