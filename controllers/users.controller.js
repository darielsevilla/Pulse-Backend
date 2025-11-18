module.exports = { template };
const User = require('../models/User.model');
const template = async (req, res) => {
    res.send('Hello World! - Endpoint de prueba.');
}

const createUser = async (req, res) => {
    try {
        const newUser = new User(req.body);
        const userSaved = await newUser.save();
        res.status(201).json(userSaved);
    } catch (error) {
        res.status(400).json({ 
            message: 'Error al crear el usuario', 
            details: error.message 
        });
    }
}

const getUsers = async (req, res) => {
    try {
        const users = await User.find({});
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener usuarios', details: error.message });
    }
}

const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error al buscar usuario', details: error.message });
    }
}

const updateUser = async (req, res) => {
    try {
        const userUpdated = await User.findByIdAndUpdate(req.params.id, req.body, { 
            new: true,
            runValidators: true 
        });
        
        if (!userUpdated) {
            return res.status(404).json({ message: 'Usuario no encontrado para actualizar.' });
        }
        res.status(200).json(userUpdated);
    } catch (error) {
        res.status(400).json({ message: 'Error al actualizar usuario', details: error.message });
    }
}

const deleteUser = async (req, res) => {
    try {
        const userDeleted = await User.findByIdAndDelete(req.params.id);
        
        if (!userDeleted) {
            return res.status(404).json({ message: 'Usuario no encontrado para eliminar.' });
        }
        res.status(204).send(); 
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar usuario', details: error.message });
    }
}

module.exports = { 
    template, 
    createUser,
    getUsers,
    getUserById,
    updateUser,
    deleteUser
};