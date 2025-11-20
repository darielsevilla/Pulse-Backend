require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();

const port = process.env.PORT || 3000;

const { databaseConnect } = require("./database");

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// Imports
const usersRoutes = require('./routes/users.routes');

app.use('/users', usersRoutes);

app.listen(port, () => {
  console.log(`Backend levantado en http://localhost:${port}`);
  databaseConnect();
});
