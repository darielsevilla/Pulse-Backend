// controllers/vitals.controller.js

const { databaseConnect } = require("../database");
const User = require("../models/User.model");
const { ObjectId } = require("mongodb");
const Alert = require("../models/Alert.model");

function parsePresion(presion) {
  if (!presion) return null;

  if (typeof presion === "string") {
    const parts = presion.split("/");
    if (parts.length !== 2) return null;
    const s = Number(parts[0]);
    const d = Number(parts[1]);
    if (Number.isNaN(s) || Number.isNaN(d)) return null;
    return { sistolica: s, diastolica: d };
  }

  if (typeof presion === "object") {
    const s = Number(presion.sistolica);
    const d = Number(presion.diastolica);
    if (Number.isNaN(s) || Number.isNaN(d)) return null;
    return { sistolica: s, diastolica: d };
  }

  return null;
}

function evaluarVitales({ bpm, temperatura, presion }) {
  const issues = [];

  if (bpm !== null && bpm !== undefined && bpm !== "") {
    const bpmN = Number(bpm);
    if (!Number.isNaN(bpmN)) {
      if (bpmN < 50) issues.push({ tipo: "BPM", estado: "BAJO", gravedad: bpmN < 40 ? "CRITICA" : "MEDIA", valor: bpmN, umbral: "< 50" });
      if (bpmN > 120) issues.push({ tipo: "BPM", estado: "ALTO", gravedad: bpmN > 140 ? "CRITICA" : "MEDIA", valor: bpmN, umbral: "> 120" });
    }
  }

  if (temperatura !== null && temperatura !== undefined && temperatura !== "") {
    const t = Number(temperatura);
    if (!Number.isNaN(t)) {
      if (t < 35.5) issues.push({ tipo: "TEMPERATURA", estado: "BAJA", gravedad: t < 35.0 ? "CRITICA" : "MEDIA", valor: t, umbral: "< 35.5°C" });
      if (t >= 38.0) issues.push({ tipo: "TEMPERATURA", estado: "ALTA", gravedad: t >= 39.5 ? "CRITICA" : "MEDIA", valor: t, umbral: ">= 38.0°C" });
    }
  }

  const p = parsePresion(presion);
  if (p) {
    const { sistolica, diastolica } = p;

    if (sistolica < 90 || diastolica < 60) {
      issues.push({
        tipo: "PRESION",
        estado: "BAJA",
        gravedad: (sistolica < 80 || diastolica < 50) ? "CRITICA" : "MEDIA",
        valor: `${sistolica}/${diastolica}`,
        umbral: "< 90/60"
      });
    }

    if (sistolica >= 140 || diastolica >= 90) {
      issues.push({
        tipo: "PRESION",
        estado: "ALTA",
        gravedad: (sistolica >= 180 || diastolica >= 120) ? "CRITICA" : "MEDIA",
        valor: `${sistolica}/${diastolica}`,
        umbral: ">= 140/90"
      });
    }
  }

  return issues;
}



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

const issues = evaluarVitales({
  bpm: doc.bpm,
  presion: doc.presion,
  temperatura: doc.temperatura
});

if (issues.length > 0) {
  const familiaresCol = db.collection("Familiares");

  const relaciones = await familiaresCol
    .find({ id_usuario: adultoMayorId })
    .toArray();

  const familiaresIds = relaciones.map(r => r.id_familiar);

  const mensajes = issues.map(i =>
    `${i.tipo} ${i.estado}: ${i.valor} (umbral ${i.umbral})`
  ).join(" | ");

  const gravedadFinal =
    issues.some(i => i.gravedad === "CRITICA") ? "CRITICA" :
    issues.some(i => i.gravedad === "MEDIA") ? "MEDIA" : "BAJA";

  await Alert.create({
    adultoMayorId: new ObjectId(adultoMayorId),
    tipoAlerta: "SIGNOS_VITALES",
    mensaje: `Alerta: signos vitales fuera de rango. ${mensajes}`,
    gravedad: gravedadFinal,
    estado: "PENDIENTE",
    fechaHora: now
  });

  for (const famId of familiaresIds) {
    await Alert.create({
      adultoMayorId: new ObjectId(adultoMayorId),
      tipoAlerta: "SIGNOS_VITALES",
      mensaje: `Alerta del adulto mayor: signos vitales fuera de rango. ${mensajes}`,
      gravedad: gravedadFinal,
      estado: "PENDIENTE",
      fechaHora: now,
      familiarId: new ObjectId(famId)
    });
  }
}



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
