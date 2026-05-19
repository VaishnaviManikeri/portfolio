// backend/routes/admin.js
const express = require('express');
const router = express.Router();
const { adminLogin } = require('../controllers/projectController');

router.post('/login', adminLogin);

module.exports = router;