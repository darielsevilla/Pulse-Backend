const mongoose = require('mongoose');
const Alert = require("../models/Alert.model");
const User = require("../models/User.model");
const { ObjectId } = require('mongodb'); 
const { Schema } = require('mongoose');

/**
 * @param {ObjectId} adultoMayorId 
 * @param {string} tipoSigno
 * @param {number} valor
 */

const receiveVitalSignAlert = async (req, res) => {
    try {
        const { adultoMayorId, tipoSigno, valor } = req.body;

        if (!adultoMayorId || !tipoSigno || valor === undefined) {
            return res.status(400).json({ message: 'Faltan campos obligatorios.' });
        }
        const adultoMayor = await User.findById(adultoMayorId).populate('encargados');

        if (!adultoMayor) {
            return res.status(404).json({ message: 'Adulto mayor no encontrado.' });
        }
        if (!adultoMayor.encargados || adultoMayor.encargados.length === 0) {
            return res.status(400).json({ 
                message: 'El adulto mayor no tiene encargados asignados para recibir la alerta.' 
            });
        }
        let nombreSigno = tipoSigno;
        let unidad = "";
        switch (tipoSigno.toLowerCase()) {
            case 'bpm': nombreSigno = "Frecuencia Cardíaca"; unidad = "BPM"; break;
            case 'presion': nombreSigno = "Presión Arterial"; unidad = "mmHg"; break;
            case 'temperatura': nombreSigno = "Temperatura"; unidad = "°C"; break;
        }
        const mensajeAlerta = `Alerta crítica: el valor de su ${nombreSigno} es: ${valor} ${unidad}`;
        const alertasCreadas = await Promise.all(adultoMayor.encargados.map(async (encargado) => {
            const newAlert = new Alert({
                adultoMayorId: new ObjectId(adultoMayorId),
                familiarId: encargado._id, // Asignamos esta copia al ID de este encargado
                tipoAlerta: 'SIGNO_CRITICO',
                mensaje: mensajeAlerta,
                gravedad: 'CRITICA',
                estado: 'PENDIENTE'
            });
            return await newAlert.save();
        }));

        res.status(201).json({ 
            message: `Alerta enviada exitosamente a ${alertasCreadas.length} encargados.`, 
            alerts: alertasCreadas 
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al registrar alerta.', details: error.message });
    }
};

const receiveMedicationAlert = async (req, res) => {
    try {
        const { adultoMayorId, detalleMedicamento } = req.body;

        if (!adultoMayorId || !detalleMedicamento) {
            return res.status(400).json({ message: 'Faltan campos obligatorios.' });
        }

        const adultoMayor = await User.findById(adultoMayorId).populate('encargados');

        if (!adultoMayor || !adultoMayor.encargados || adultoMayor.encargados.length === 0) {
            return res.status(400).json({ message: 'El adulto mayor no tiene encargados asignados.' });
        }
        const alertasCreadas = await Promise.all(adultoMayor.encargados.map(async (encargado) => {
            const newAlert = new Alert({
                adultoMayorId: new ObjectId(adultoMayorId),
                familiarId: encargado._id,
                tipoAlerta: 'MEDICACION_OLVIDADA',
                mensaje: `ALERTA de Medicación Olvidada: ${detalleMedicamento}`,
                gravedad: 'MEDIA',
                estado: 'PENDIENTE'
            });
            return await newAlert.save();
        }));
        
        res.status(201).json({ 
            message: `Alerta de medicación enviada a ${alertasCreadas.length} encargados.`, 
            alerts: alertasCreadas 
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al registrar alerta.', details: error.message });
    }
};

const getPendingAlerts = async (req, res) => {
    try {
        const { idFamiliar } = req.params;
        const familiarObjectId = new mongoose.Types.ObjectId(idFamiliar); 

        const alerts = await Alert.find({ 
            familiarId: familiarObjectId,
            estado: 'PENDIENTE' 
        })
        .populate('adultoMayorId', 'nombre apellido num_telefono')
        .sort({ fechaHora: -1 });

        res.status(200).json(alerts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener alertas pendientes.', details: error.message });
    }
};

const getAlertsByElder = async (req, res) => {
    try {
        const { idElder } = req.params;
        
        const alerts = await Alert.find({ adultoMayorId: new ObjectId(idElder) })
            .populate('familiarId', 'nombre apellido num_telefono') 
            .sort({ fechaHora: -1 });
        
        res.status(200).json(alerts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener historial de alertas.', details: error.message });
    }
};

const markAlertAsNotified = async (req, res) => {
    try {
        const { idAlert } = req.params;
        
        const updatedAlert = await Alert.findByIdAndUpdate(
            idAlert, 
            { estado: 'NOTIFICADA' }, 
            { new: true, runValidators: true }
        );

        if (!updatedAlert) {
            return res.status(404).json({ message: 'Alerta no encontrada.' });
        }

        res.status(200).json({ message: 'Alerta marcada como NOTIFICADA.', alert: updatedAlert });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar estado de alerta.', details: error.message });
    }
};

const markAlertAsResolved = async (req, res) => {
    try {
        const { idAlert } = req.params;
        
        const updatedAlert = await Alert.findByIdAndUpdate(
            idAlert, 
            { estado: 'RESUELTA' }, 
            { new: true, runValidators: true }
        );

        if (!updatedAlert) {
            return res.status(404).json({ message: 'Alerta no encontrada.' });
        }

        res.status(200).json({ message: 'Alerta marcada como RESUELTA.', alert: updatedAlert });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al resolver alerta.', details: error.message });
    }
};

module.exports = {
    receiveVitalSignAlert,
    receiveMedicationAlert,
    getPendingAlerts,
    getAlertsByElder,
    markAlertAsNotified,
    markAlertAsResolved
};