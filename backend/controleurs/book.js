const Book = require("../models/book.js");

exports.createBook = (req, res, next) => {
  const bookObject = JSON.parse(req.body.book);
  delete bookObject._id;
  delete bookObject._userId;
  console.log(bookObject)
  const book = new Book({
    ...bookObject,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
  });
  console.log(book)
  book
    .save()
    .then(() => {
      res.status(201).json({ message: "Post saved successfully!" });
    })
    .catch((error) => {
      res.status(400).json({ error: error });
    });
};

exports.getOneBook = (req, res, next) => {
  console.log(req.params.id);
  
  Book.findOne({
    _id: req.params.id,
  })
    .then((book) => {
      res.status(200).json(book);
    })
    .catch((error) => {
      res.status(404).json({
        error: error,
      });
    });
};

exports.modifyBook = (req, res, next) => {
  const bookObject = req.file
    ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
      }
    : { ...req.body };

  delete bookObject._userId;
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(401).json({ message: "Not authorized" });
      } else {
        book
          .updateOne(
            { _id: req.params.id },
            { ...bookObject, _id: req.params.id }
          )
          .then(() => res.status(200).json({ message: "Objet modifié!" }))
          .catch((error) => res.status(401).json({ error }));
      }
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(401).json({ message: "Not authorized" });
      } else {
        const filename = book.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, () => {
          Book.deleteOne({ _id: req.params.id })
            .then(() => {
              res.status(200).json({ message: "Objet supprimé !" });
            })
            .catch((error) => res.status(401).json({ error }));
        });
      }
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

exports.getAllBooks = (req, res, next) => {
  Book.find()
    .then((books) => {
      res.status(200).json(books);
    })
    .catch((error) => {
      res.status(400).json({
        error: error,
      });
    });
};
exports.bestBooks = async (req, res, next) => {
  try {
    const bestBooks = await Book.find().sort({ average_rating: -1 }).limit(3);
    res.status(200).json(bestBooks);
  } catch (error) {
    res.status(400).json({ error: error });
  }
};
exports.Rating = (req, res, next) => {
  if (req.body.rating < 0 || req.body.rating > 5) {
    return res.status(400).json({ error: "Rating must be between 0 and 5" });
  }
  const rating = { userId: req.body.userId, rating: req.body.rating };
  Book.findById(req.params.id)
    .then((book) => {
      if (book.rating.some((r) => r.userId === req.body.userId)) {
        return res.status(400).json({ error: "User already rated this book" });
      }
      book.rating.push(rating);
      let totalRating = 0;
      book.rating.forEach((r) => (totalRating += r.rating));
      book.average_rating = totalRating / book.rating.length;
      book
        .save()
        .then(() => {
          res.status(201).json({ message: "Rating saved successfully!", book: book });
        })
        .catch((error) => {
          res.status(400).json({ error: error });
        });
    })
    .catch((error) => {
      res.status(404).json({
        error: error,
      });
    });
};