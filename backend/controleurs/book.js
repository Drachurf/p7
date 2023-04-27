const Book = require("../models/book.js");
const fs = require("fs");
const sharp = require("sharp");
const path = require("path");

exports.createBook = (req, res, next) => {
  // Vérifie que req.file existe.
  if (!req.file) {
    return res.status(400).json({ error: "Veuillez sélectionner une image." });
  }
  const bookObject = JSON.parse(req.body.book);

  // Ajoute l'identifiant utilisateur actuel aux propriétés de bookObject.
  bookObject._userId = req.userId;

  // Supprime la propriété _id de l'objet bookObject.
  delete bookObject._id;

  // Crée une nouvelle instance du modèle Book avec les propriétés de bookObject et l'URL de l'image ajoutée à la requête.
  const book = new Book({
    ...bookObject,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
    averageRating: 0,
    rating: [],
  });

  // Redimensionne l'image et l'enregistre dans le dossier d'images.
  sharp(req.file.path)
    .webp({ quality: 80 })
    .toBuffer((err, buffer) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      const parsedPath = path.parse(req.file.filename);
      const newFilename = `compressed_${parsedPath.name}.webp`;

      fs.writeFile(`images/${newFilename}`, buffer, (err) => {
        if (err) {
          return res.status(400).json({ error: err.message });
        }

        // Supprime l'image originale
        fs.unlink(req.file.path, (err) => {
          if (err) {
            console.error(err);
          }
        });

        // Met à jour l'URL de l'image pour pointer vers la nouvelle image compressée.
        book.imageUrl = `${req.protocol}://${req.get(
          "host"
        )}/images/${newFilename}`;

        // Enregistre le nouveau livre dans la base de données.
        book
          .save()
          .then(() => {
            res.status(201).json({ message: "Post saved successfully!" });
          })
          .catch((error) => {
            // En cas d'erreur, supprime l'image compressée.
            fs.unlink(`images/compressed_${req.file.filename}.webp`, (err) => {
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
  let bookObject = req.file
    ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };
  // Supprime la propriété _userId de l'objet bookObject.
  delete bookObject._userId;

  console.log("bookObject:", bookObject);

  // Vérifie si l'utilisateur est autorisé à modifier ce livre.
  Book.findOne({ _id: req.params.id }).then((book) => {
    console.log("book:", book);
    // Si l'utilisateur n'est pas autorisé à modifier ce livre : erreur 403
    if (book.userId != req.userId) {
      res.status(403).json({ message: "Action non autorisée" });
    }
    // Supprime l'ancienne image si elle existe et si la nouvelle image est différente de l'ancienne
    else if (
      book.imageUrl &&
      req.file &&
      req.file.filename !== book.imageUrl.split("/").pop()
    ) {
      const oldImagePath = book.imageUrl.split("/images/")[1];
      fs.unlinkSync(`images/${oldImagePath}`);
    }
    // Redimensionne l'image et l'enregistre dans le dossier d'images si une image est attachée à la requête POST.
    if (req.file) {
      sharp(req.file.path)
        .webp({ quality: 80 })
        .toBuffer((err, buffer) => {
          if (err) {
            return res.status(400).json({ error: err.message });
          }

          const parsedPath = path.parse(req.file.filename);
          const newFilename = `compressed_${parsedPath.name}.webp`;

          fs.writeFile(`images/${newFilename}`, buffer, (err) => {
            if (err) {
              return res.status(400).json({ error: err.message });
            }
            // Une fois l'image redimensionnée et enregistrée, supprime l'image originale si la nouvelle image est différente de l'ancienne.
            if (req.file.filename !== book.imageUrl.split("/").pop()) {
              fs.unlink(req.file.path, (err) => {
                if (err) {
                  return res.status(400).json({ error: err.message });
                }
              });
            }
            // Met à jour l'URL de l'image pour pointer vers la nouvelle image redimensionnée.
            bookObject.imageUrl = `${req.protocol}://${req.get(
              "host"
            )}/images/${newFilename}`;
            // Met à jour le livre dans la base de données avec les propriétés modifiées de bookObject.
            console.log("updating book with:", bookObject);
            Book.updateOne(
              { _id: req.params.id },
              { ...bookObject, _id: req.params.id }
            )
              .then(() => {
                console.log("book updated");
                res.status(200).json({ message: "Objet modifié!" });
              })
              .catch((error) => {
                console.error("error while updating book:", error);
                res.status(401).json({ error });
              });
          });
        });
    } else {
      // Si aucune image n'est attachée à la requête POST, met simplement à jour le livre dans la base de données avec les propriétés modifiées de bookObject.
      Book.updateOne(
        { _id: req.params.id },
        { ...bookObject, _id: req.params.id }
      )
        .then(() => {
          console.log("book updated");
          res.status(200).json({ message: "Objet modifié!" });
        })
        .catch((error) => {
          console.error("error while updating book:", error);
          res.status(401).json({ error });
        });
    }
  });
};

exports.Ratings = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      // Extraire l'identifiant utilisateur et la note de la demande
      let userId = req.body.userId;
      let grade = parseInt(req.body.rating);
      // Vérifier si userId et grade sont définis et ont une valeur
      if (!userId || isNaN(grade)) {
        return res
          .status(400)
          .json({ error: "Merci de remplir tous les champs." });
      }
      // Vérifier que la note est un entier compris entre 0 et 5
      if (grade < 0 || grade > 5) {
        return res
          .status(400)
          .json({ error: "La note doit être comprise entre 0 et 5." });
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
      // on commence a 1 pour éliminer la première note de l'auteur. 
      for (let i = 1; i < ratingsCount; i++) {
        sum += book.ratings[i].grade;
      }
      // Math.round pour convertir le chiffre en entier
      book.averageRating = Math.round(sum / ratingsCount);
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
      if (book.userId !== req.userId) {
        res.status(403).json({ message: "Unauthorized" });
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
              res.status(500).json({ error });
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
