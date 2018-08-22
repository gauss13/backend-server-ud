var express = require('express');

var app = express();

//
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');


// ==================================================
// Busqueda Especifica
// ==================================================
app.get('/coleccion/:tabla/:busqueda', (req, res, next) => {

    var tabla = req.params.tabla;
    var busqueda = req.params.busqueda;

    var regex = new RegExp(busqueda, 'i');

    var promesa;
    switch (tabla) {
        case 'hospital':
            promesa = buscarHospitales(regex);
            break;
        case 'medico':
            promesa = buscarMedicos(regex);
            break;
        case 'usuario':
            promesa = buscarUsuario(regex);
            break;
        default:
            res.status(400).json({
                ok: false,
                mensaje: 'Tipo de busque no es correcto',
                error: { message: 'Tipo incorrecto' }
            });
    }

    promesa.then(datos => {

        res.status(200).json({
            ok: true,
            [tabla]: datos
        });

    });


});





// ==================================================
// Busqueda General
// ==================================================
app.get('/todo/:busqueda', (req, res, next) => {

    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');

    Promise.all([buscarHospitales(regex),
            buscarMedicos(regex),
            buscarUsuario(regex)
        ])
        .then(respuestas => {
            res.status(200).json({
                ok: true,
                hospitales: respuestas[0],
                medicos: respuestas[1],
                usuarios: respuestas[2]
            });
        });

    // buscarHospitales(regex)
    //     .then(hospitales => {
    //         res.status(200).json({
    //             ok: true,
    //             hospitales: hospitales
    //         });
    //     });



    // Hospital.find({ nombre: regex }, (err, hospitalesEncontrado) => {

    //     res.status(200).json({
    //         ok: true,
    //         hospitales: hospitalesEncontrado
    //     });

    // });

});

// metod asincrono
function buscarHospitales(regex) {
    return new Promise((resolve, reject) => {
        Hospital.find({ nombre: regex })
            .populate('usuario', 'nombre email') //une la colleccion usuario, pero nos aseguramos de no mostrar el password
            .exec((err, hospitalesEncontrado) => {

                if (err) {
                    reject('Error al cargar los hospitales', err);
                } else {
                    resolve(hospitalesEncontrado);
                }
            });




    });
}

function buscarMedicos(regex) {
    return new Promise((resolve, reject) => {
        Medico.find({ nombre: regex })
            .populate('usuario', 'nombre email') //une la colleccion usuario, pero nos aseguramos de no mostrar el password
            .populate('hospital')
            .exec(

                (err, medicosEncontrados) => {

                    if (err) {
                        reject('Error al cargar los hospitales', err);
                    } else {
                        resolve(medicosEncontrados);
                    }
                });
    });
}

function buscarUsuario(regex) {
    return new Promise((resolve, reject) => {
        Usuario.find({}, 'nombre email role')
            .or([{ 'nombre': regex }, { 'email': regex }])
            .exec((err, usuariosEncontrados) => {


                if (err)
                    reject('Error al cargar los usuarios');
                else {
                    resolve(usuariosEncontrados);
                }


            });

    });

}

module.exports = app;