var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

var app = express();

//importamos el modelo
var Usuario = require('../models/usuario');


app.post('/', (req, res) => {

    var body = req.body;

    //buscamos en la bd el correo
    // condicion: mientras el email = al parametro pasado
    Usuario.findOne({ email: body.email }, (err, usuarioEncontrado) => {

        // si se produjo un error en el servidor
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuarios',
                errors: err
            });
        }


        //Si no lo encontró
        if (!usuarioEncontrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - email',
                errors: { mensaje: 'Credenciales incorrectas - email' }
            });
        }

        // validamos la contraseña que nos enstan enviado
        if (!bcrypt.compareSync(body.password, usuarioEncontrado.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - pass',
                errors: { mensaje: 'Credenciales incorrectas - pass' }
            });
        }


        //Crear token !!!
        // le pasamos DATA-SEED-TIEMPOExpiracion
        usuarioEncontrado.password = ';)'; //nos aseguramos de no enviar el password en el token, lo reemplazamos con carita feliz
        var token = jwt.sign({ usuario: usuarioEncontrado }, SEED, { expiresIn: 14400 }); //4 horas

        res.status(200).json({
            ok: true,
            usuario: usuarioEncontrado,
            token: token,
            id: usuarioEncontrado._id
        });

    });




});

module.exports = app;