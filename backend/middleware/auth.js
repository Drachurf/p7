const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    // Récupère le token JWT présent dans l'en-tête "Authorization" de la requête
    const token = req.headers.authorization.split(' ')[1];
    // Vérifie la validité du token en le décodant avec la clé secrète
    const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
    // Récupère l'identifiant de l'utilisateur depuis le token décodé
    const userId = decodedToken.userId;
    // Ajoute l'identifiant de l'utilisateur à la requête pour qu'il soit disponible pour les prochaines fonctions middleware
    req.auth = {userId: userId};
    next();
  } catch(error) {
    res.status(401).json({ error });
  }
};