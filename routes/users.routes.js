const express = require('express');
const router = express.Router();
const { 
    template, 
    createUser,
    getUsers,
    getUserById,
    updateUser,
    deleteUser 
} = require('../controllers/users.controller');

router.route('/')
    .get(getUsers)
    .post(createUser); 


router.route('/:id')
    .get(getUserById)
    .put(updateUser)
    .delete(deleteUser);

router.get('/test', template);

module.exports = router;