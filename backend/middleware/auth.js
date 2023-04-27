const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Missing or invalid Authorization header');
    }
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decodedToken.userId;

    // Vérification de l'utilisateur avant la modification du livre
    if (req.params.userId && req.params.userId !== req.userId) {
      throw new Error('Unauthorized request: User ID does not match book owner');
    }

    next();
  } catch (error) {
    res.status(403).json({ error: error.message });
  }
};