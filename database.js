const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.MONGO_URI;
let db;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


const databaseConnect = async () => {
  try {
    if(db) return db;
    await client.connect();
    db = client.db("Pulse");
    console.log("Conectado a la base de datos de Pulse");
    return db;
  } catch (e) {
    console.error(e);
  }
}

module.exports ={databaseConnect};