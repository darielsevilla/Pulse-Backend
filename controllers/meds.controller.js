const { databaseConnect } = require("../database");
const { ObjectId } = require('mongodb');

const createMed = async (req, res) => {

  let db = await databaseConnect();
  try {

    const {
      nombre,
      cantidad,
      forma,
      fecha_inicio,
      fecha_fin,
      horas_recordatorio,
      id_usuario,
    } = req.body;

    console.log(req.body)

    if (!nombre || !cantidad || !forma || !fecha_inicio || !fecha_fin || !horas_recordatorio || !id_usuario) {
      return res.status(400).json({ message: 'Faltan campos obligatorios.' });
    }

    const medicamento = {
      nombre,
      cantidad,
      forma,
      fecha_inicio: new Date(fecha_inicio),
      fecha_fin: new Date(fecha_fin),
      horas_recordatorio,
      id_usuario,

    };
    let user = await db.collection('Users').findOne({ _id: new ObjectId(id_usuario) });
    if (!user) return res.status(400).json({ message: 'Usuario no existe.' });

    const result = await db.collection('Medicamentos').insertOne(medicamento);

    return res.status(201).json({
      message: 'Medicamento creado',
      medicamento: { _id: result.insertedId, ...medicamento },
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: 'Error al crear medicamento', details: error.message });
  }
};

const modifyMed = async (req, res) => {
  let db = await databaseConnect();
  try {

    const {
      nombre,
      cantidad,
      forma,
      fecha_inicio,
      fecha_fin,
      horas_recordatorio,
      id_usuario,
      _id
    } = req.body;

    if (!_id || !nombre || !cantidad || !forma || !fecha_inicio || !fecha_fin || !horas_recordatorio) {
      return res.status(400).json({ message: 'Faltan campos obligatorios.' });
    }

    const medicamento = {
      nombre,
      cantidad,
      forma,
      fecha_inicio: new Date(fecha_inicio),
      fecha_fin: new Date(fecha_fin),
      horas_recordatorio,

    };

    const result = await db.collection('Medicamentos').findOneAndUpdate(
      { _id: new ObjectId(_id) },
      { $set: medicamento },
      { returnDocument: 'after' }
    );
    console.log(result)
    if (!result) {
      res.status(400).json({ message: "No se encontró medicamento" })
    } else {
      res.status(200).json({
        message: 'Medicamento modificado',
        medicamento: result,
      });
    }

  } catch (error) {

    res.status(500).json({ message: 'Error al crear medicamento', details: error.message });
  }
}

const deleteMed = async (req, res) => {
  const id = req.body._id;
  let db = await databaseConnect();
  try {
    if (id) {
      let result = await db.collection("Medicamentos").findOneAndDelete({ _id: new ObjectId(id) });

      res.status(200).json({
        message: "Medicamento Borrado exitosamente"
      })
    } else {
      res.status(400).json({
        message: "No envió un id"
      })
    }

  } catch (error) {
    res.status(500).json({
      message: "Error eliminando el medicamento"
    })
  }

}

const listarMedicamentosActivos = async (req, res) => {
  try {
    const id_usuario = req.params.id;
    if (id_usuario) {
      const db = await databaseConnect();

      const meds = await db.collection('Medicamentos').find({ id_usuario, tomado: { $exists: false } }).toArray();
      res.status(200).json({
        medicamentos: meds,

      });
    } else {
      res.status(400).json({
        message: 'No envió id_usuario',
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Error al obtener medicamentos',
      details: error.message,
    });
  }
};

const listarMedicamentos = async (req, res) => {
  try {
    let id_usuario = req.params.id;
    if (id_usuario) {
      let db = await databaseConnect();

      const meds = await db.collection('Medicamentos').find({ id_usuario }).toArray();
      res.status(200).json({
        medicamentos: meds,
      });
    } else {
      res.status(400).json({
        message: 'No envió id_usuario',
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Error al obtener medicamentos',
      details: error.message,
    });
  }
};

const terminarMedicamento = async (req, res) => {
  try {
    const _id = req.params.id;
    if (_id) {
      let db = await databaseConnect();

      const result = await db.collection('Medicamentos').findOneAndUpdate(
        { _id: new ObjectId(_id) },
        { $set: { tomado: true } },
        { returnDocument: 'after' }
      );

      res.status(200).json({
        medicamentos: result,
      });
    } else {
      res.status(400).json({
        message: 'No envió id medicamento',
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Error al obtener medicamentos',
      details: error.message,
    });
  }
};

function getDayNameFromDate(date) {
  const dias = [
    "DOMINGO",
    "LUNES",
    "MARTES",
    "MIERCOLES",
    "JUEVES",
    "VIERNES",
    "SABADO",
  ];
  const idx = date.getDay();
  return dias[idx];
}


const getMedsByDateForFamiliar = async (req, res) => {
  try {
    const { idFamiliar } = req.params;
    const { date } = req.query;

    if (!idFamiliar) {
      return res
        .status(400)
        .json({ message: "idFamiliar es obligatorio." });
    }

    let targetDate;
    if (date) {
      targetDate = new Date(date + "T00:00:00");
      if (isNaN(targetDate.getTime())) {
        return res
          .status(400)
          .json({ message: "Formato de fecha inválido." });
      }
    } else {
      targetDate = new Date();
    }

    const diaSemana = getDayNameFromDate(targetDate);

    const db = await databaseConnect();
    const familiaresCol = db.collection("Familiares");
    const medsCol = db.collection("Medicamentos");

    const relaciones = await familiaresCol
      .find({ id_familiar: idFamiliar })
      .toArray();

    const idsAdultos = relaciones.map((rel) => rel.id_usuario);

    if (idsAdultos.length === 0) {
      return res.status(200).json([]);
    }

    const filtro = {
      id_usuario: { $in: idsAdultos },
      diasSemana: { $in: [diaSemana] },
    };

    filtro.$and = [
      {
        $or: [
          { fecha_inicio: { $lte: targetDate } },
          { fecha_inicio: { $exists: false } },
        ],
      },
      {
        $or: [
          { fecha_fin: { $gte: targetDate } },
          { fecha_fin: { $exists: false } },
        ],
      },
    ];

    
    const meds = await medsCol.find(filtro).toArray();

    return res.status(200).json(meds);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error al obtener medicamentos por fecha para familiar.",
      details: error.message,
    });
  }
};

const getMedsForTodayForFamiliar = async (req, res) => {
  req.query.date = undefined;
  return getMedsByDateForFamiliar(req, res);
};

const getMedsByFamiliar = async (req, res) => {
  try {
    const { idFamiliar } = req.params;
    if (!idFamiliar) {
      return res.status(400).json({ message: "idFamiliar es obligatorio." });
    }

    const db = await databaseConnect();
    const familiaresCol = db.collection("Familiares");
    const medsCol = db.collection("Medicamentos");

    const relaciones = await familiaresCol
      .find({ id_familiar: idFamiliar })
      .toArray();

    const idsAdultos = relaciones.map(rel => rel.id_usuario);

    if (idsAdultos.length === 0) {
      return res.status(200).json([]);
    }

    const medicamentos = await medsCol
      .find({ id_usuario: { $in: idsAdultos } })
      .toArray();

    return res.status(200).json(medicamentos);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error al obtener medicamentos por familiar.",
      details: error.message,
    });
  }
};


module.exports = {
  createMed,
  modifyMed,
  deleteMed,
  listarMedicamentos,
  listarMedicamentosActivos,
  terminarMedicamento,
  getMedsByDateForFamiliar,
  getMedsForTodayForFamiliar,
  getMedsByFamiliar
};

