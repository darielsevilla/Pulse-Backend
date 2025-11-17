
const express = require('express');
const router = express.Router();
const { template } = require('../controllers/users.controller');
router.get('/test', template);

module.exports = router;