const express = require('express');
const {register, login, getMe, logout} = require('../controllers/auth'); 
const {protect} = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/getMe', protect, getMe);
router.get('/logout', logout); // ถ้าprotectกันunregister logout ถ้าtokenหมดอายุมันจะ logoutไม่ได้

module.exports = router;