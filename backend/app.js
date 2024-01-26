const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");
const bookRoutes = require("./routes/book.js");
const userRoutes = require("./routes/user.js");
require('dotenv').config();

mongoose.set('strictQuery', false);

mongoose.connect(
  process.env.DB_CONNECT,
  { useNewUrlParser: true, useUnifiedTopology: true }
)// se connecte à la base de données MongoDB via l'URL fournie, avec les options indiquées
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));
const app = express(); 

app.use((req, res, next) => { // définit un middleware pour ajouter des entêtes de réponse pour le CORS
  res.setHeader("Access-Control-Allow-Origin", "*"); // autorise toutes les origines à accéder à l'API
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  ); // définit les types d'entêtes autorisés
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

app.use(cors()); 
app.use(bodyParser.json());
app.use("/", bookRoutes); 
app.use("/", userRoutes); 
app.use('/images', express.static(path.join(__dirname, 'images'))), // définit un dossier statique pour servir les images

module.exports = app;