const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth.js');
const booksCtrl = require('../controleurs/book.js');


router.get('/', auth, booksCtrl.getAllBooks);

router.get('/books')
router.get('/books/:id', auth, booksCtrl.getOneBook);
router.get('/books/bestrating', auth, booksCtrl.getOneBook);

router.post('/books', auth, multer, booksCtrl.createBook);/*Capture et enregistre l'image, 
analyse le livre transformé en chaîne de caractères, 
et l'enregistre dans la base de données en définissant correctement son ImageUrl.*/

router.post('', auth, booksCtrl.createRating)

router.put('/books/:id', auth, multer, booksCtrl.modifyBook);/*Met à jour le livre avec 
l'_id fourni. Si une image est téléchargée, elle est capturée, et l’ImageUrl 
du livre est mise à jour. Si aucun fichier n'est fourni, les informations sur 
le livre se trouvent directement dans le corps de la requête 
(req.body.title, req.body.author, etc.). Si un fichier est fourni, 
le livre transformé en chaîne de caractères se trouve dans req.body.book.
Notez que le corps de la demande initiale est vide ; lorsque Multer est ajouté, 
il renvoie une chaîne du corps de la demande basée sur les données soumises avec le fichier.*/

router.delete('/books/:id', auth, booksCtrl.deleteBook);

module.exports = router;