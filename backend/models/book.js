const mongoose = require("mongoose");

const books = books.Schema({
  userId: {type: String, required: true,} /*identifiant MongoDB unique de l'utilisateur qui a créé le livre title : String - titre du livre*/,
  author: { type: String, required: true } /*auteur du livre*/,
  imageUrl: { type: String, required: true,} /*illustration/couverture du livre*/,
  year: { type: Number, required: true } /*année de publication du livre*/,
  genre: { type: String, required: true } /*Genre du livre*/,
  ratings: {
    /*Id MongoDB unique de l'utilisateur qui a noté le livre*/
    userId: { type: String, required: true },
    grade: { type: Number, required: true },
  },
  averageRating: { type: Number, required: true } /*note moyenne*/,
});

module.exports = mongoose.model("books", booksSchema);
