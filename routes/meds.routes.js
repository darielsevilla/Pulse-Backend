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
    getMedsForTodayForFamiliar,
    getMedsByFamiliar,
    getMedsByDate
} = require('../controllers/meds.controller');

router.post("/registerMed", createMed);
router.post("/modifyMed", modifyMed);
router.delete("/deleteMed", deleteMed);
router.get("/listarMedicamentos/:id", listarMedicamentos);
router.get("/listarMedicamentosActivos/:id", listarMedicamentosActivos);
router.post("/terminarMedicamento/:id", terminarMedicamento);
router.get("/by-date-familiar/:idFamiliar", getMedsByDateForFamiliar);
router.get("/for-today-familiar/:idFamiliar", getMedsForTodayForFamiliar);
router.get("/by-familiar/:idFamiliar", getMedsByFamiliar);
router.get("/by-date/:idUsuario", getMedsByDate);

module.exports = router;