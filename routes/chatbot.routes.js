const express = require('express');
const router = express.Router();
const { 
     generateHealthReport,
     request
} = require('../controllers/chatbot.controller');


router.post("/generateHealthReport", generateHealthReport)
router.post("/request", request);
module.exports = router;