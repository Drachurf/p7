const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");
const stuffRoutes = require("./routes/stuff.js");
const userRoutes = require("./routes/user.js");

mongoose
  .connect(
    "mongodb+srv://drachurf:X7UxDHPZIe736fRH@monvieuxgrimoire.n7uauz9.mongodb.net/?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));
const app = express();
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

app.use(cors());
app.use(bodyParser.json());
app.use("/", stuffRoutes);
app.use("/", userRoutes);
app.use('/images', express.static(path.join(__dirname, 'images'))),
module.exports = app;