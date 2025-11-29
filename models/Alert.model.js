const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({
    adultoMayorId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'El ID del adulto mayor es obligatorio.'],
        ref: 'Users'
    },
    familiarId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    },
    tipoAlerta: {
        type: String,
        enum: ['SIGNO_CRITICO', 'MEDICACION_OLVIDADA'],
        required: [true, 'El tipo de alerta es obligatorio.']
    },
    mensaje: {
        type: String,
        required: [true, 'El mensaje de la alerta es obligatorio.']
    },
    gravedad: {
        type: String,
        enum: ['BAJA', 'MEDIA', 'CRITICA'],
        default: 'MEDIA'
    },
    estado: {
        type: String,
        enum: ['PENDIENTE', 'NOTIFICADA', 'RESUELTA'],
        default: 'PENDIENTE'
    },
    fechaHora: {
        type: Date,
        default: Date.now,
        required: true
    }
}, {
    collection: 'Alerts'
});

const Alert = mongoose.model('Alert', AlertSchema, 'Alerts');
module.exports = Alert;