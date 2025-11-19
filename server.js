require('dotenv').config(); 
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();

const port = 3000;



const { databaseConnect } = require("./database");

app.use(express.urlencoded({ extended: true }));
app.listen(port, () => {
  console.log(`Backend levantado en http://localhost:${port}`);
  databaseConnect();
});



//imports 
const usersRoutes = require('./routes/users.routes');

//endpoint groups
app.use('/users', usersRoutes);