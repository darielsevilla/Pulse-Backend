const express = require('express');
const router = express.Router();
const { 
    template, 
    createUser,
    getUsers,
    getUserById,
    updateUser,
    deleteUserAccount,
    login,
    logout,
    passwordRecovery,
} = require('../controllers/users.controller');

router.route('/').get(getUsers)
     

router.post("/createUser", createUser);
router.put("/updateUser",  updateUser);
router.post("/login", login);
router.post("/logout", logout);
router.route('/:id').get(getUserById).delete(deleteUserAccount);
router.post("/recoverPassword", passwordRecovery);
router.get('/test', template);

module.exports = router;