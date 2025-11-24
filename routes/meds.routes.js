const express = require('express');
const router = express.Router();

const { 
    createMed,
    modifyMed,
    deleteMed,
    listarMedicamentos,
    listarMedicamentosActivos,
    terminarMedicamento,
    agregarRecordatorio,
    modificarRecordatorio,
    buscarRecordatorioPorMedicamento,
    eliminarRecordatorio
} = require('../controllers/meds.controller');

router.post("/registerMed", createMed);
router.post("/modifyMed", modifyMed);
router.delete("/deleteMed", deleteMed);
router.get("/listarMedicamentos/:id", listarMedicamentos);
router.get("/listarMedicamentosActivos/:id", listarMedicamentosActivos);
router.post("/terminarMedicamento/:id", terminarMedicamento);

router.post("/agregarRecordatorio", agregarRecordatorio);
router.post("/modificarRecordatorio", modificarRecordatorio);
router.get("/buscarRecordatorioPorMedicamento/:id", buscarRecordatorioPorMedicamento);
router.delete("/eliminarRecordatorio", eliminarRecordatorio);
module.exports = router;