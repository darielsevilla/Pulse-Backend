const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI_DB, {
  dbName: 'Pulse',        
});
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
    tipoUsuario: {
    type: String,
    enum: ['FAMILIAR', 'ADULTO_MAYOR'],
    required: [true, 'El tipo de usuario es obligatorio.']
    },
    num_telefono: {
        type: String,
    },
    edad: {
        type: Number,
        min: [0, 'La edad no puede ser negativa.'],
    },
    encargados: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    }]
}, {
    timestamps: false
});

const User = mongoose.model('Users', UserSchema, 'Users');

module.exports = User;