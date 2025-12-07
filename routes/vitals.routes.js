const express = require("express");
const router = express.Router();

const {
  createVitalsRecord,
  getLastVitals,
  getVitalsHistory,
  simulateVitals,
} = require("../controllers/vitals.controller");

router.post("/", createVitalsRecord);

router.get("/last/:adultoMayorId", getLastVitals);

router.get("/history/:adultoMayorId", getVitalsHistory);

router.post("/simulate", simulateVitals);

module.exports = router;
