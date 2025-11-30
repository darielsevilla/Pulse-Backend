const express = require('express');
const router = express.Router();
const { 
    receiveVitalSignAlert,
    receiveMedicationAlert,
    getPendingAlerts, 
    markAlertAsNotified,
    markAlertAsResolved,
    getAlertsByElder
} = require('../controllers/alerts.controller');

router.post('/receive/vitalsign', receiveVitalSignAlert); 
router.post('/receive/medication', receiveMedicationAlert); 
router.get('/pending/:id', getPendingAlerts); 
router.get('/elder/:idElder', getAlertsByElder);      
router.put('/notified/:idAlert', markAlertAsNotified); 
router.put('/resolved/:idAlert', markAlertAsResolved); 

module.exports = router;