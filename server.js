require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();

const port = process.env.PORT || 3000;

const { databaseConnect } = require("./database");

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.listen(port, () => {
  console.log(`Backend levantado en http://localhost:${port}`);
  databaseConnect();
});



//imports 
const usersRoutes = require('./routes/users.routes');
const medsRoutes = require("./routes/meds.routes");
const chatbotRoutes = require("./routes/chatbot.routes");

//endpoint groups
app.use('/users', usersRoutes);
app.use('/meds', medsRoutes);
app.use("/chatbot", chatbotRoutes);
