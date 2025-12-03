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
  asignarFamiliar,
  obtenerFamiliaresDeUsuario,
  obtenerAdultosMayoresDeFamiliar
} = require('../controllers/users.controller');

router.route('/').get(getUsers);

router.post("/createUser", createUser);
router.put("/updateUser",  updateUser);
router.post("/login", login);
router.post("/logout", logout);
router.post("/recoverPassword", passwordRecovery);
router.get('/test', template);

router.post("/asignar-familiar", asignarFamiliar);
router.get("/:id/familiares", obtenerFamiliaresDeUsuario);
router.get("/:id/adultos-mayores", obtenerAdultosMayoresDeFamiliar);

router.route('/:id').get(getUserById).delete(deleteUserAccount);

module.exports = router;
