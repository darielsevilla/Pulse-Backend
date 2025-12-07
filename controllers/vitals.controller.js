// controllers/vitals.controller.js

const { databaseConnect } = require("../database");
const User = require("../models/User.model");
const { ObjectId } = require("mongodb");


const createVitalsRecord = async (req, res) => {
  try {
    const { adultoMayorId, bpm, presion, temperatura } = req.body;

    if (!adultoMayorId) {
      return res
        .status(400)
        .json({ message: "adultoMayorId es obligatorio." });
    }

    const noHayBpm = bpm === undefined || bpm === null || bpm === "";
    const noHayPresion =
      presion === undefined || presion === null || presion === "";
    const noHayTemp =
      temperatura === undefined || temperatura === null || temperatura === "";

    if (noHayBpm && noHayPresion && noHayTemp) {
      return res.status(400).json({
        message:
          "Debe enviar al menos un signo vital (bpm, presion o temperatura).",
      });
    }

    const usuario = await User.findById(adultoMayorId);
    if (!usuario) {
      return res.status(404).json({ message: "Adulto mayor no encontrado." });
    }

    const db = await databaseConnect();
    const signosCol = db.collection("SignosVitales");

    const now = new Date();

    const doc = {
      adultoMayorId: new ObjectId(adultoMayorId),
      bpm: noHayBpm ? null : bpm,
      presion: noHayPresion ? null : presion,
      temperatura: noHayTemp ? null : temperatura,
      fechaHora: now,
    };

    const result = await signosCol.insertOne(doc);

    return res.status(201).json({
      message: "Signos vitales registrados correctamente.",
      id_registro: result.insertedId,
      data: doc,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error al registrar signos vitales.",
      details: error.message,
    });
  }
};


const getLastVitals = async (req, res) => {
  try {
    const { adultoMayorId } = req.params;

    const db = await databaseConnect();
    const signosCol = db.collection("SignosVitales");

    const last = await signosCol
      .find({ adultoMayorId: new ObjectId(adultoMayorId) })
      .sort({ fechaHora: -1 })
      .limit(1)
      .toArray();

    if (last.length === 0) {
      return res.status(200).json({
        message: "No hay signos vitales registrados para este usuario.",
        data: null,
      });
    }

    return res.status(200).json(last[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error al obtener últimos signos vitales.",
      details: error.message,
    });
  }
};


const getVitalsHistory = async (req, res) => {
  try {
    const { adultoMayorId } = req.params;

    const db = await databaseConnect();
    const signosCol = db.collection("SignosVitales");

    const registros = await signosCol
      .find({ adultoMayorId: new ObjectId(adultoMayorId) })
      .sort({ fechaHora: -1 })
      .limit(50)
      .toArray();

    return res.status(200).json(registros);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error al obtener historial de signos vitales.",
      details: error.message,
    });
  }
};



const simulateVitals = async (req, res) => {
  try {
    const bpm = 60 + Math.floor(Math.random() * 41);

    const sistolica = 100 + Math.floor(Math.random() * 41); 
    const diastolica = 60 + Math.floor(Math.random() * 31); 
    const presion = `${sistolica}/${diastolica}`;

    const temperatura = Number((36 + Math.random() * 1.9).toFixed(1));

    const now = new Date();

    return res.status(200).json({
      adultoMayorId: null,
      bpm,
      presion,
      temperatura,
      fechaHora: now.toISOString(),
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error al simular signos vitales.",
      details: error.message,
    });
  }
};



module.exports = {
  createVitalsRecord,
  getLastVitals,
  getVitalsHistory,
  simulateVitals,
};
