require('dotenv').config(); 
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
let db;

app.listen(port, () => {
  console.log(`Backend levantado en http://localhost:${port}`);
  backendConnect();
});

const backendConnect = async () => {
  try {
    await client.connect();
    db = client.db("Pulse");
    console.log("Conectado a la base de datos de Pulse");
  } catch (e) {
    console.error(e);
  }
}

//imports 
const usersRoutes = require('./routes/users.routes');

//endpoint groups
app.use('/users', usersRoutes);