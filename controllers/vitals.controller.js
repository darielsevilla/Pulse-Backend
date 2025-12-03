// controllers/vitals.controller.js

const { databaseConnect } = require("../database");
const User = require("../models/User.model");

const receiveVitalSign = async (req, res) => {
  try {
    const { id_usuario, tipoSigno, valor, unidad, origen } = req.body;

    // Validaciones básicas
    if (!id_usuario || !tipoSigno || valor === undefined) {
      return res.status(400).json({
        message: "Faltan campos obligatorios: id_usuario, tipoSigno o valor.",
      });
    }

    const usuario = await User.findById(id_usuario);
    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    if (usuario.tipoUsuario !== "ADULTO_MAYOR") {
      return res.status(400).json({
        message: "Solo se pueden registrar signos vitales de usuarios ADULTO_MAYOR.",
      });
    }

    const db = await databaseConnect();
    const signosCol = db.collection("SignosVitales");

    const ahora = new Date();

    const doc = {
      id_usuario,
      tipoSigno,           
      valor,               
      unidad: unidad || "",
      origen: origen || "DISPOSITIVO_IOT",
      fechaHora: ahora.toISOString(),
    };

    const result = await signosCol.insertOne(doc);

    return res.status(201).json({
      message: "Signo vital registrado correctamente.",
      id_registro: result.insertedId,
      data: doc,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error al registrar signo vital.",
      details: error.message,
    });
  }
};

const getLastVitals = async (req, res) => {
  try {
    const { id_usuario } = req.params;
    const { tipoSigno } = req.query;

    const usuario = await User.findById(id_usuario);
    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    const db = await databaseConnect();
    const signosCol = db.collection("SignosVitales");

    const filtro = { id_usuario };
    if (tipoSigno) {
      filtro.tipoSigno = tipoSigno;
    }

    const registros = await signosCol
      .find(filtro)
      .sort({ fechaHora: -1 }) 
      .limit(20)
      .toArray();

    return res.status(200).json({
      usuario: {
        _id: usuario._id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        tipoUsuario: usuario.tipoUsuario,
      },
      tipoSigno: tipoSigno || "TODOS",
      registros,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error al obtener signos vitales.",
      details: error.message,
    });
  }
};

module.exports = {
  receiveVitalSign,
  getLastVitals,
};
