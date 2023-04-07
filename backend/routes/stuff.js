const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.js");
const stuffCtrl = require("../controleurs/book.js");
const multer = require('../middleware/multer-config.js')

const book = require ('../models/book.js')

router.get("/", stuffCtrl.getAllBooks);
router.get("/api/books", auth);
router.get("/api/books/:id", auth, stuffCtrl.getOneBook);
router.get("/api/books/bestrating", auth, stuffCtrl.getOneBook);
router.post("/api/books", auth, multer, book, stuffCtrl.createBook);
//router.post("/books/:id/rating", auth, mutler, stuffCtrl.createRating);
router.put("/api/books/:id", auth, stuffCtrl.modifyBook); /*Met à jour le livre avec l'_id fourni. Si une image est téléchargée, elle est capturée,
et l’ImageUrl du livre est mise à jour. Si aucun fichier n'est fourni, les informations sur le livre se trouvent directement dans le corps de la requête (req.body.title, req.body.author, etc.). Si un fichier est fourni, 
le livre transformé en chaîne de caractères se trouve dans req.body.book.Notez que le corps de la demande initiale est vide ; lorsque Multer est ajouté, il renvoie une chaîne du corps de la demande basée sur les données soumises avec le fichier.*/
router.delete("/api/books/:id", auth, stuffCtrl.deleteBook);


module.exports = router;