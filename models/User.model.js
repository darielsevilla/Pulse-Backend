const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es obligatorio.']
    },
    apellido: {
        type: String,
        required: [true, 'El apellido es obligatorio.']
    },
    correo: {
        type: String,
        required: [true, 'El correo es obligatorio.'],
        unique: true,
        trim: true,
        lowercase: true
    },
    num_telefono: {
        type: String,
    },
    edad: {
        type: Number,
        min: [0, 'La edad no puede ser negativa.'],
    }
}, {
    timestamps: true
});

const User = mongoose.model('User', UserSchema);

module.exports = User;