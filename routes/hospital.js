var express = require('express');

var mdAutenticacion = require('../middlewares/autenticacion');

//instanciamos un objeto de express
var app = express();

//modelo
var Hospital = require('../models/hospital');

// ==================================================
// GET Hospitales
// ==================================================
app.get('/', (req, resp, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Hospital.find({}, 'nombre img usuario')
        .populate('usuario', 'nombre email')
        .skip(desde)
        .limit(5)
        .exec((err, resultado) => {


            if (err) {
                return resp.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando hospitales',
                    errors: error
                });
            }


            //si no hubo error
            Hospital.count({}, (err, conteo) => {
                return resp.status(200).json({
                    ok: true,
                    total: conteo,
                    hospitales: resultado
                });
            });


        });
});

// ==================================================
// POST Crear Hospital
// ==================================================
app.post('/', mdAutenticacion.verificaToken, (req, resp, next) => {

    //obtenemos los datos del post
    var body = req.body;

    //Creamos un objeto hospital
    var objHospital = new Hospital({
        nombre: body.nombre,
        img: body.img,
        usuario: req.usuario._id
    });

    //guadamos el objeto a la bd
    objHospital.save((err, regGuardado) => {


        //si hay un error
        if (err) {
            return resp.status(400).json({
                ok: false,
                mensaje: 'Error al crear hospital',
                errors: err
            });
        }

        // si no hubo error - 201 creado
        resp.status(201).json({
            ok: true,
            hospital: regGuardado,
            usuarioToken: req.usuario
        });

    });

});

// ==================================================
// PUT Actualizar Hospital
// ==================================================
app.put('/:id', mdAutenticacion.verificaToken, (req, resp, next) => {

    //obtenemos el id que viene como parametro
    var id = req.params.id;
    // obtenemos los datos a actualizar
    var body = req.body;

    //Buscamos el hospital en la bd
    Hospital.findById(id, (err, hospitalEncontrado) => {

        if (err) {

            return resp.status(500).json({
                ok: false,
                mensaje: 'Error al buscar el hospital',
                errors: err
            });
        }

        hospitalEncontrado.nombre = body.nombre;
        hospitalEncontrado.img = body.img;
        hospitalEncontrado.usuario = req.usuario._id;

        //guardamos la actualizacion
        hospitalEncontrado.save((err, hospitalActualizado) => {

            if (err) {
                return resp.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar hospital',
                    errors: err
                });
            }


            //retornamos respuesta de guardado exitoso
            return resp.status(200).json({
                ok: true,
                hospital: hospitalActualizado
            });
        });
    });
});

// ==================================================
// DELETE hospital
// ==================================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, resp, next) => {

    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {

        // si existe error en el servidor
        if (err) {
            return resp.status(500).json({
                ok: false,
                mensaje: 'Error al borrar hospital ',
                errors: err
            });
        }

        // si no encontro el documento
        if (!hospitalBorrado) {
            return resp.status(400).json({
                ok: false,
                mensaje: 'No existe un hospital con ese id',
                errors: { message: 'No existe un hospital con ese id' }
            });
        }

        // si el borrado se realizo con exito
        resp.status(201).json({
            ok: true,
            hospital: hospitalBorrado
        });


    });

});


module.exports = app;