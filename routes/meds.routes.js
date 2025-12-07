const express = require('express');
const router = express.Router();

const { 
    createMed,
    modifyMed,
    deleteMed,
    listarMedicamentos,
    listarMedicamentosActivos,
    terminarMedicamento,
    getMedsByDateForFamiliar,
    getMedsForTodayForFamiliar
} = require('../controllers/meds.controller');

router.post("/registerMed", createMed);
router.post("/modifyMed", modifyMed);
router.delete("/deleteMed", deleteMed);
router.get("/listarMedicamentos/:id", listarMedicamentos);
router.get("/listarMedicamentosActivos/:id", listarMedicamentosActivos);
router.post("/terminarMedicamento/:id", terminarMedicamento);
router.get("/by-date-familiar/:idFamiliar", getMedsByDateForFamiliar);
router.get("/for-today-familiar/:idFamiliar", getMedsForTodayForFamiliar);

module.exports = router;