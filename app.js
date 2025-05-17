const express = require('express');
const app = express();
const apiRoutes = require('./routes/api');
const path = require('path');

app.use(express.static(path.join(__dirname, 'Public')));

app.use(express.json()); // para recibir JSON
app.use(express.urlencoded({ extended: true })); // para recibir datos de formularios

app.use('/api', apiRoutes);

app.listen(3000, () => {
  console.log('Servidor iniciado en puerto 3000');
});
