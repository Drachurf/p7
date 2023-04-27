Backend API - Mon Vieux Grimoire

Ce repo contient le backend du website Mon Vieux Grimoire.

Configuration

nodeJS  cors: 2.8.5, express: 4.18.2, jsonwebtoken: 9.0.0, mongoose: 6.10.4, mongoose-unique-validator: 3.1.0, multer: 1.4.5-lts.1, sharp: 0.32.0

Lancement du projet : 

Après avoir récupéré le REPO exécutez la commande npm install pour installer les dépendances du projet.

Une fois les dépendances installées allez dans le fichier frontend, et lancer dans dans le terminal " npm start ".
Dans le fichier backend, procéder de la même façon mais inscriver " nodemon server ".

Enfin, pour faire fonctionner le backend, il vous faudra créer un fichier ".env" avec à l'intérieur : 
https://openclassrooms.com/fr/courses/6390246-passez-au-full-stack-avec-node-js-express-et-mongodb/6466348-configurez-votre-base-de-donnees

DB_CONNECT=`lien vers votre base de donnée MongoDB`
JWT_SECRET="CREER_UN_TOKEN_SECURISE"


Compétences : 
- Implémenter un modèle logique de données conformément à la réglementation
- Mettre en oeuvre des opérations CRUD de manière sécurisée
- Stocker des données de manière sécurisée
