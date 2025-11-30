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
    asignarFamiliarAAdultoMayor,
  getEncargadosDeAdultoMayor,
  getAdultosMayoresDeFamiliar
} = require('../controllers/users.controller');

router.route('/').get(getUsers)
     

router.post("/createUser", createUser);
router.put("/updateUser",  updateUser);
router.post("/login", login);
router.post("/logout", logout);
router.route('/:id').get(getUserById).delete(deleteUserAccount);
router.post("/recoverPassword", passwordRecovery);
router.get('/test', template);
router.post('/asignar-familiar', asignarFamiliarAAdultoMayor);
router.get('/:id/encargados', getEncargadosDeAdultoMayor);
router.get('/:id/adultos-mayores', getAdultosMayoresDeFamiliar);

module.exports = router;