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
            return res.status(400).json({ message: 'Faltan campos obligatorios: adultoMayorId, tipoSigno y valor.' });
        }

        let nombreSigno = "";
        let unidad = "";

        switch (tipoSigno.toLowerCase()) {
            case 'bpm':
                nombreSigno = "Frecuencia Cardíaca (BPM)";
                unidad = "BPM";
                break;
            case 'presion':
                nombreSigno = "Presión Arterial";
                unidad = "mmHg";
                break;
            case 'temperatura':
                nombreSigno = "Temperatura";
                unidad = "°C";
                break;
            default:
                nombreSigno = tipoSigno;
                unidad = "";
        }

        const mensajeAlerta = `Alerta crítica: el valor de su ${nombreSigno} es: ${valor} ${unidad}`;

        const familiar = await User.findOne({ tipoUsuario: 'FAMILIAR' }); 

        const newAlert = new Alert({
            adultoMayorId: new ObjectId(adultoMayorId),
            familiarId: familiar ? new ObjectId(familiar._id) : null,
            tipoAlerta: 'SIGNO_CRITICO',
            mensaje: mensajeAlerta,
            gravedad: 'CRITICA',
            estado: 'PENDIENTE'
        });
        
        const savedAlert = await newAlert.save();
        res.status(201).json({ 
            message: 'Alerta de Signo Crítico registrada exitosamente.', 
            alert: savedAlert 
        });

    } catch (error) {
        console.error(error);
        if (error.kind === 'ObjectId') {
             return res.status(400).json({ message: 'ID de Adulto Mayor inválido.', details: error.message });
        }
        res.status(500).json({ message: 'Error al registrar alerta de Signo Crítico.', details: error.message });
    }
};

const receiveMedicationAlert = async (req, res) => {
    try {
        const { adultoMayorId, detalleMedicamento } = req.body;

        if (!adultoMayorId || !detalleMedicamento) {
            return res.status(400).json({ message: 'Faltan campos obligatorios: adultoMayorId y detalleMedicamento.' });
        }

        const familiar = await User.findOne({ tipoUsuario: 'FAMILIAR' }); 

        const newAlert = new Alert({
            adultoMayorId: new ObjectId(adultoMayorId),
            familiarId: familiar ? new ObjectId(familiar._id) : null,
            tipoAlerta: 'MEDICACION_OLVIDADA',
            mensaje: `ALERTA de Medicación Olvidada: ${detalleMedicamento}`,
            gravedad: 'MEDIA',
            estado: 'PENDIENTE'
        });
        
        const savedAlert = await newAlert.save();
        
        res.status(201).json({ 
            message: 'Alerta de Medicación Olvidada registrada exitosamente.', 
            alert: savedAlert 
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al registrar alerta de Medicación Olvidada.', details: error.message });
    }
};

module.exports = {
    receiveVitalSignAlert,
    receiveMedicationAlert,
};