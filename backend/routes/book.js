const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.js");
const bookCtrl = require("../controleurs/book.js");
const multer = require('../middleware/multer-config.js')

// le CRUD
router.get("/api/books/bestrating", bookCtrl.bestRating);
router.get("/api/books", bookCtrl.getAllBooks);
router.get("/api/books/:id", bookCtrl.getOneBook);
router.post("/api/books", auth, multer, bookCtrl.createBook);
router.put("/api/books/:id", auth, multer, bookCtrl.modifyBook);
router.delete("/api/books/:id", auth, bookCtrl.deleteBook);
router.post("/api/books/:id/rating", auth, bookCtrl.Ratings);

module.exports = router;