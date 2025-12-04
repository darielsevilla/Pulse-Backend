const express = require("express");
const router = express.Router();

const {
  createVitalsRecord,
  getLastVitals,
  getVitalsHistory,
} = require("../controllers/vitals.controller");

router.post("/", createVitalsRecord);

router.get("/last/:adultoMayorId", getLastVitals);

router.get("/history/:adultoMayorId", getVitalsHistory);

module.exports = router;
