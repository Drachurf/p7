const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.js");
const stuffCtrl = require("../controleurs/book.js");
const multer = require('../middleware/multer-config.js')

router.get("/api/books/bestrating", stuffCtrl.bestRating);
router.get("/api/books", stuffCtrl.getAllBooks);
router.get("/api/books/:id", stuffCtrl.getOneBook);
router.post("/api/books", auth, multer, stuffCtrl.createBook);
router.put("/api/books/:id", auth, multer, stuffCtrl.modifyBook);
router.delete("/api/books/:id", auth, stuffCtrl.deleteBook);
router.post("/api/books/:id/rating", auth, stuffCtrl.Ratings);

module.exports = router;