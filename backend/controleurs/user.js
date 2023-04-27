const User = require("../models/user.js");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const emailValidator = require('email-validator');
require('dotenv').config();

//clef dans fichier .env
const JWT_SECRET = process.env.JWT_SECRET

// Fonction d'inscription
exports.signup = (req, res, next) => {

  // Vérifier si l'email est valide
  if (!emailValidator.validate(req.body.email)) {
   return res.status(400).json({ error: `L'adresse email fournie n'est pas valide !` });
  }
 
  // Vérifier si le mot de passe respecte les critères de sécurité
  if (!req.body.password || req.body.password.length < 8 || !/[!@#$%^&*(),.?":{}|<>]/.test(req.body.password)) {
   return res.status(400).json({ error: `Le mot de passe doit contenir au moins 8 caractères et un caractère spécial : "[!@#$%^&*(),.?":{}|<>]" !` });
 }
 
   // Hashage du mot de passe avec Bcrypt (10 est le coût de l'algorithme de hachage)
   bcrypt.hash(req.body.password, 10)
     .then(hash => {
       // Création d'un nouvel utilisateur
       const user = new User({
         email: req.body.email,
         password: hash
       });
       // Enregistrement de l'utilisateur dans la base de données
       user.save()
         .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
         .catch(error => {
           console.log(error);
           res.status(400).json({ error });
       });
     })
     .catch(error => res.status(500).json({ error }));
 };

// Fonction de connexion
exports.login = (req, res, next) => {
  // Recherche de l'utilisateur correspondant à l'email fourni
  User.findOne({ email: req.body.email })
    .then((user) => {
      // Si aucun utilisateur = une erreur
      if (!user) {
        return res.status(401).json({ error: "Utilisateur ou mot de passe non trouvé !" });
      }
      // Comparaison du mot de passe fourni avec le mot de passe hashé
      bcrypt
        .compare(req.body.password, user.password)
        .then((valid) => {
          // Si les mots de passe ne correspondent pas = erreur
          if (!valid) {
            return res.status(401).json({ error: "Utilisateur ou mot de passe non trouvé !" });
          }
          // Si les mots de passe correspondent = l'ID de l'utilisateur et token d'authentification avec JWT
          res.status(200).json({
            userId: user._id,
            token: jwt.sign({ userId: user._id }, JWT_SECRET, {expiresIn: "24h"}),
          });
        })
    
        .catch((error) => res.status(500).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};