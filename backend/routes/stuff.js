const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.js");
const stuffCtrl = require("../controleurs/book.js");
const multer = require('../middleware/multer-config.js')

const book = require ('../models/book.js')


router.get("/api/books", stuffCtrl.getAllBooks);
router.get("/api/books/:id", stuffCtrl.getOneBook);
router.get("/api/books/bestrating", stuffCtrl.bestBooks); //le problème est ici
router.post("/api/books", auth, multer, stuffCtrl.createBook);
router.post("/books/:id/rating", auth, stuffCtrl.Rating);
router.put("/api/books/:id", auth, multer, stuffCtrl.modifyBook);
router.delete("/api/books/:id", auth, stuffCtrl.deleteBook);


module.exports = router;