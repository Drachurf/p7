const express = require('express');
const router = express.Router();

const userCtrl = require('../controleurs/user.js');

router.post('/api/auth/signup', userCtrl.signup);
router.post('/api/auth/login', userCtrl.login);

module.exports = router;