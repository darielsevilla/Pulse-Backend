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

      let resultBorrar = await db.collection("Medicamentos_tomados").findOneAndDelete({ id_medicamento: _id });
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
}
//recordatorios
const agregarRecordatorio = async (req, res) => {
  try {
    const db = await databaseConnect();
    const { med_id, fecha } = req.body;

    if (!med_id || !fecha) {
      return res.status(400).json({ message: "No se mandó med_id o fecha" });
    }

    let recordatorio = await db.collection("Medicamentos_tomados").insertOne({
      id_medicamento: med_id,
      tomado: false,
      proximo_recordatorio: new Date(fecha),
      recordatorio_anterior: null,
      notificacion: false
    });

    return res.status(200).json({
      message: "Recordatorio creado exitosamente",
      recordatorio: recordatorio
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error creando recordatorio",
      details: error.message
    });
  }
};

const modificarRecordatorio = async (req, res) => {
  try {
    const db = await databaseConnect();
    const { _id, proximo_recordatorio, recordatorio_anterior, tomado, notificacion } = req.body;

    if (!_id) {
      res.status(400).json({ message: "No se mandó _id del recordatorio" });
    } else {
      const update = {};

      if (proximo_recordatorio) {
        update.proximo_recordatorio = new Date(proximo_recordatorio);
      }
      if (recordatorio_anterior) {
        update.recordatorio_anterior = new Date(recordatorio_anterior);
      }
      if (tomado) {
        update.tomado = tomado;
      }
      if (notificacion) {
        update.notificacion = notificacion;
      }

      if (Object.keys(update).length === 0) {
        return res.status(400).json({ message: "No se mandaron campos para actualizar" });
      }

      const result = await db.collection("Medicamentos_tomados").findOneAndUpdate(
        { _id: new ObjectId(_id) },
        { $set: update },
        { returnDocument: "after" }
      );

      if (!result) {
        res.status(404).json({ message: "Recordatorio no encontrado" });
      } else {
        res.status(200).json({
          message: "Recordatorio modificado exitosamente",
          recordatorio: result,
        });
      }


    }


  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error modificando recordatorio",
      details: error.message,
    });
  }
};

const buscarRecordatorioPorMedicamento = async (req, res) => {
  try {
    const med_id = req.params.id;
    if (!med_id) {
      return res.status(400).json({ message: "No se mandó med_id" });
    }

    const db = await databaseConnect();

    const recordatorios = await db.collection("Medicamentos_tomados").find({ id_medicamento: med_id }).toArray();

    res.status(200).json({
      recordatorios,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error obteniendo recordatorios",
      details: error.message,
    });
  }
};

const eliminarRecordatorio = async (req, res) => {
  try {
    const { _id } = req.body;

    if (!_id) {
      res.status(400).json({ message: "No se mandó id del recordatorio" });
    } else {
      const db = await databaseConnect();

      const result = await db.collection("Medicamentos_tomados").findOneAndDelete({ _id: new ObjectId(_id) });

      if (!result) {
        res.status(404).json({ message: "Recordatorio no encontrado" });
      }

      res.status(200).json({
        message: "Recordatorio eliminado exitosamente",
        recordatorio: result,
      });
    }


  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error eliminando recordatorio",
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
  agregarRecordatorio,
  modificarRecordatorio,
  buscarRecordatorioPorMedicamento,
  eliminarRecordatorio
};

