const express = require("express");
const router = express.Router();

const {
  receiveVitalSign,
  getLastVitals,
} = require("../controllers/vitals.controller");

router.post("/receive", receiveVitalSign);

router.get("/last/:id_usuario", getLastVitals);

module.exports = router;
