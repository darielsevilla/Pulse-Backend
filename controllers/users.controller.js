

const {initializeApp} = require("firebase/app");
const {getAnalytics} = require("firebase/analytics");

const {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
   sendPasswordResetEmail,
   deleteUser,
  signOut,
} =  require("firebase/auth");
const { databaseConnect } = require("../database");

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);

//admin
const admin = require('firebase-admin');
const serviceAccount = require('../pulse-b7b87-firebase-adminsdk-fbsvc-0b9ad640b2.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

//estructura de usuario
const User = require("../models/User.model")
const template = async (req, res) => {
    res.send('Hello World! - Endpoint de prueba.');
}

const createUser = async (req, res) => {
    try {
        
        if(req.body.contraseña != undefined){
            const newUser = new User(req.body);
            
            await createUserWithEmailAndPassword(auth, req.body.correo, req.body.contraseña);
            const userSaved = await newUser.save();
            res.status(200).json({message: "usuario creado", user: userSaved});
        } else {
            res.status(400).json({ message: 'La contraseña es obligatoria.' });
        }
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
        const {_id, correo, ...data} = req.body;
        const userUpdated = await User.findByIdAndUpdate(_id, data, { 
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

const deleteUserAccount = async (req, res) => {
    try {
        let userDeleted = await User.findById(req.params.id);
        const correo = userDeleted.correo;
        
        //borrarlo de firebase
        const user = await admin.auth().getUserByEmail(correo);
        await admin.auth().deleteUser(user.uid);

         userDeleted = await User.findByIdAndDelete(req.params.id);
        if (!userDeleted) {
            return res.status(404).json({ message: 'Usuario no encontrado para eliminar.' });
        }
        res.status(200).send({
            message: "Cuenta eliminada exitosamente"
        }); 

    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar usuario', details: error.message });
    }
}

const login = async (req, res) =>{
    try {
        if(req.body.correo && req.body.contraseña){
            await signInWithEmailAndPassword(auth, req.body.correo, req.body.contraseña);
            
            const userFound = await User.find({correo: req.body.correo})
            if(userFound){
                res.status(200).json({ message: 'Sesión iniciada',user: userFound });
            }else{
                res.status(404).json({ message: 'Sesion no se pudo iniciar'});
            }
             
        }else{
            res.status(404).json({ message: 'Falta correo y/o contraseña'});
        }
    } catch (error) {
        res.status(500).json({ message: 'Error al iniciar sesión', details: error.message });
    }
}


const logout = async (req, res) =>{
    try{
        await signOut(auth);
        res.status(200).json({message: "Sesión Cerrada exitosamente", closed: true})
    }catch(error){
        res.status(500).json({ message: 'Error al cerrar sesión', closed: false });
    }
}

const passwordRecovery = async (req, res) =>{
     try{
        if(req.body.correo){
            await sendPasswordResetEmail(auth, req.body.correo);
        }else{
            res.status(401).json({message: "No envió un correo"}) 
        }
        res.status(200).json({message: "Correo enviado exitosamente"})
    }catch(error){
        res.status(500).json({ message: 'Error al enviar correo de recuperación'});
    }
}


const asignarFamiliar = async (req, res) => {
  try {
    const { id_usuario, id_familiar } = req.body;

    if (!id_usuario || !id_familiar) {
      return res.status(400).json({
        message: "Debe enviar id_usuario y id_familiar."
      });
    }

    if (id_usuario === id_familiar) {
      return res.status(400).json({
        message: "Un usuario no puede asignarse a sí mismo."
      });
    }

    const usuario = await User.findById(id_usuario);
    const familiar = await User.findById(id_familiar);

    if (!usuario || !familiar) {
      return res.status(404).json({ message: "Usuario o familiar no encontrado." });
    }

    if (usuario.tipoUsuario !== "ADULTO_MAYOR") {
      return res.status(400).json({
        message: "id_usuario debe pertenecer a un usuario de tipo ADULTO_MAYOR."
      });
    }

    if (familiar.tipoUsuario !== "FAMILIAR") {
      return res.status(400).json({
        message: "id_familiar debe pertenecer a un usuario de tipo FAMILIAR."
      });
    }

    const db = await databaseConnect();
    const familiaresCol = db.collection("Familiares");

    const existente = await familiaresCol.findOne({ id_usuario, id_familiar });

    if (existente) {
      return res.status(200).json({
        message: "La relación ya existe.",
        relacion: existente
      });
    }

    const insertResult = await familiaresCol.insertOne({ id_usuario, id_familiar });

    return res.status(201).json({
      message: "Familiar asignado correctamente.",
      relacionId: insertResult.insertedId
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error al asignar familiar.",
      details: error.message
    });
  }
};

const obtenerFamiliaresDeUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    const usuario = await User.findById(id);
    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    if (usuario.tipoUsuario !== "ADULTO_MAYOR") {
      return res.status(400).json({
        message: "El usuario no es de tipo ADULTO_MAYOR."
      });
    }

    const db = await databaseConnect();
    const familiaresCol = db.collection("Familiares");

    const relaciones = await familiaresCol.find({ id_usuario: id }).toArray();
    const idsFamiliares = relaciones.map(rel => rel.id_familiar);

    if (idsFamiliares.length === 0) {
      return res.status(200).json({
        usuario: {
          _id: usuario._id,
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          tipoUsuario: usuario.tipoUsuario
        },
        familiares: []
      });
    }

    const familiares = await User.find({
      _id: { $in: idsFamiliares }
    }).select("nombre apellido correo num_telefono edad tipoUsuario");

    return res.status(200).json({
      usuario: {
        _id: usuario._id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        tipoUsuario: usuario.tipoUsuario
      },
      familiares
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error al obtener familiares del usuario.",
      details: error.message
    });
  }
};

const obtenerAdultosMayoresDeFamiliar = async (req, res) => {
  try {
    const { id } = req.params;

    const familiar = await User.findById(id);
    if (!familiar) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    if (familiar.tipoUsuario !== "FAMILIAR") {
      return res.status(400).json({
        message: "El usuario no es de tipo FAMILIAR."
      });
    }

    const db = await databaseConnect();
    const familiaresCol = db.collection("Familiares");

    const relaciones = await familiaresCol.find({ id_familiar: id }).toArray();
    const idsAdultos = relaciones.map(rel => rel.id_usuario);

    if (idsAdultos.length === 0) {
      return res.status(200).json({
        familiar: {
          _id: familiar._id,
          nombre: familiar.nombre,
          apellido: familiar.apellido,
          tipoUsuario: familiar.tipoUsuario
        },
        adultosMayores: []
      });
    }

    const adultosMayores = await User.find({
      _id: { $in: idsAdultos }
    }).select("nombre apellido correo num_telefono edad tipoUsuario");

    return res.status(200).json({
      familiar: {
        _id: familiar._id,
        nombre: familiar.nombre,
        apellido: familiar.apellido,
        tipoUsuario: familiar.tipoUsuario
      },
      adultosMayores
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error al obtener adultos mayores del familiar.",
      details: error.message
    });
  }
};


module.exports = { 
    template,
    login,
    logout,
    createUser,
    getUsers,
    getUserById,
    updateUser,
    deleteUserAccount,
    passwordRecovery,
    asignarFamiliar,
  obtenerFamiliaresDeUsuario,
  obtenerAdultosMayoresDeFamiliar
};