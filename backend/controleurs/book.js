const Book = require("../models/book.js");
const fs = require("fs");
const sharp = require('sharp');

exports.createBook = (req, res, next) => {
  const bookObject = JSON.parse(req.body.book);
  // Supprime les propriétés _id et _userId de l'objet bookObject.
  delete bookObject._id;
  delete bookObject._userId;

  // Crée une nouvelle instance du modèle Book avec les propriétés de bookObject et l'URL de l'image ajoutée à la requête.
  const book = new Book({
    ...bookObject,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
  });

  // Redimensionne l'image et l'enregistre dans le dossier d'images.
  sharp(req.file.path)
    .resize(500, 400)
    .toFile(`images/resized_${req.file.filename}`, (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      // Une fois l'image redimensionnée et enregistrée, supprime l'image originale.
      fs.unlink(req.file.path, (err) => {
        if (err) {
          return res.status(400).json({ error: err.message });
        }
        // Met à jour l'URL de l'image pour pointer vers la nouvelle image redimensionnée.
        book.imageUrl = `${req.protocol}://${req.get("host")}/images/resized_${req.file.filename}`;
        // Enregistre le nouveau livre dans la base de données.
        book
          .save()
          .then(() => {
            res.status(201).json({ message: "Post saved successfully!" });
          })
          .catch((error) => {
            // En cas d'erreur, supprime l'image redimensionnée.
            fs.unlink(`images/resized_${req.file.filename}`, (err) => {
              if (err) {
                console.error(err);
              }
            });
            res.status(400).json({ error: error });
          });
      });
    });
};

exports.modifyBook = (req, res, next) => {
  // Vérifie si une image est attachée à la requête POST, et modifie les propriétés de l'objet bookObject en conséquence.
  const bookObject = req.file
    ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };
  // Supprime la propriété _userId de l'objet bookObject.
  delete bookObject._userId;
  // Récupère un livre de la base de données en utilisant son ID.
  Book.findOne({ _id: req.params.id })
  .then((book) => {
    // Vérifie si l'utilisateur est autorisé à modifier ce livre.
    if (book.userId != req.auth.userId) {
      res.status(401).json({ message: "Not authorized" });
    } else {
      // Supprime l'ancienne image si elle existe et si la nouvelle image est différente de l'ancienne
      if (book.imageUrl && req.file && req.file.filename !== book.imageUrl.split('/').pop()) {
        const oldImagePath = book.imageUrl.split('/images/')[1];
        fs.unlinkSync(`images/${oldImagePath}`);
      }
      // Redimensionne l'image et l'enregistre dans le dossier d'images.
      if (req.file) {
        sharp(req.file.path)
          .resize(500, 400)
          .toFile(`images/resized_${req.file.filename}`, (err) => {
            if (err) {
              return res.status(400).json({ error: err.message });
            }
            // Une fois l'image redimensionnée et enregistrée, supprime l'image originale si la nouvelle image est différente de l'ancienne.
            if (req.file.filename !== book.imageUrl.split('/').pop()) {
              fs.unlink(req.file.path, (err) => {
                if (err) {
                  return res.status(400).json({ error: err.message });
                }
              });
            }
            // Met à jour l'URL de l'image pour pointer vers la nouvelle image redimensionnée.
            bookObject.imageUrl = `${req.protocol}://${req.get("host")}/images/resized_${req.file.filename}`;
            // Met à jour le livre dans la base de données avec les propriétés modifiées de bookObject.
            Book.updateOne(
              { _id: req.params.id },
              { ...bookObject, _id: req.params.id }
            )
              .then(() => res.status(200).json({ message: "Objet modifié!" }))
              .catch((error) => res.status(401).json({ error }));
          });
      } else {
        // Si aucune nouvelle image n'a été ajoutée, met simplement à jour les propriétés du livre sans redimensionner l'image.
        Book.updateOne(
          { _id: req.params.id },
          { ...bookObject, _id: req.params.id }
        )
          .then(() => res.status(200).json({ message: "Objet modifié!" }))
          .catch((error) => res.status(401).json({ error }));
      }
    }
  })
  .catch((error) => {
    res.status(400).json({ error });
  });
}
exports.getAllBooks = (req, res, next) => {
  // Récupère tous les livres de la base de données.
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

exports.getOneBook = (req, res, next) => {
  // Récupère un livre de la base de données en utilisant son ID.
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

exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      // Vérifie si l'utilisateur qui veut supprimer le livre est bien le propriétaire du livre
      if (book.userId != req.auth.userId) {
        res.status(401).json({ message: "Not authorized" });
      } else {
        // Supprime l'image associée au livre depuis le dossier images
        const filename = book.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, () => {
          // Supprime le livre de la base de données
          Book.deleteOne({ _id: req.params.id })
            .then(() => {
              res.status(200).json({ message: "Objet supprimé !" });
            })
            .catch((error) => {
              res.status(401).json({ error });
            });
        });
      }
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

exports.bestRating = async (req, res, next) => {
  try {
    // find pour récupérer les books, puis trie selon averageRating dans l'ordre décroissant + limit de 3
    const bestRatings = await Book.find().sort({ averageRating: -1 }).limit(3);
    res.status(200).json(bestRatings);
  } catch (error) {
    res.status(400).json({ error: error });
  }
};

exports.Ratings = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      // Extraire l'identifiant utilisateur et la note de la demande
      let userId = req.body.userId;
      let grade = req.body.rating;
      // Vérifier si userId et grade sont définis et ont une valeur
      if (!userId || !grade) {
        return res
          .status(400)
          .json({ error: "Merci de remplir tous les champs." });
      }
      const alreadyRated = book.ratings.some(
        (rating) => rating.userId === userId
      );
      if (alreadyRated) {
        return res.status(400).json({ error: "Vous avez déjà voté." });
      }
      const newRating = { userId, grade };
      // Ajouter la nouvelle note à la liste des notes du livre
      book.ratings.push(newRating);
      // Mettre à jour la note moyenne du livre
      const ratingsCount = book.ratings.length;
      let sum = 0;
      for (let i = 0; i < ratingsCount; i++) {
        sum += book.ratings[i].grade;
      }
      book.averageRating = sum / ratingsCount;
      // Convertir le livre dans le format attendu
      const cloneBook = Object.assign({}, book.toObject());
      cloneBook.ratings = book.ratings;
      // Mettre à jour l'objet du livre dans la base de données avec la nouvelle note moyenne et la nouvelle liste de notes
      return Book.updateOne({ _id: req.params.id }, cloneBook).then(() =>
        res.status(201).json(cloneBook)
      );
    })
    .catch((err) => next(err));
};
