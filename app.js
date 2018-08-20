//Requieres
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
// Inicializar variables
var app = express();


//Body Parser - esto es un midleware - funcion que se ejecutara siempre que una petion llegue al servidor siempre pasara en los midleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());



// Conexion a la base de datos
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {

    if (err) throw err;

    console.log('Base de datos: \x1b[32m%s\x1b[0m', ' online');

});


// Rutas

// app.get('/', (req, res, next) => {
//     res.status(200).json({
//         ok: true,
//         mensaje: 'Peticion realizada correctamente'
//     });
// });

//Importar rutas del archivo externo
var appRoutes = require('./routes/app');
var usuarioRoutes = require('./routes/usuario');
var loginRoute = require('./routes/login');

//midleware
app.use('/usuario', usuarioRoutes);
app.use('/login', loginRoute);
app.use('/', appRoutes);



// Escuchar peticiones
app.listen(3000, () => {
    console.log('Express Server puerto 3000: \x1b[32m%s\x1b[0m', ' online');
});