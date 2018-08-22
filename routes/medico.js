var express = require('express');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

//importamos el modelo
var Medico = require('../models/medico');

// ==================================================
// GET Obtener todos los medicos
// ==================================================

app.get('/', (req, resp, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Medico.find({})
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .skip(desde)
        .limit(5)
        .exec((err, resultado) => {


            if (err) {
                return resp.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando medicos',
                    errors: error
                });
            }
            //si no hubo error
            Medico.count({}, (err, conteo) => {
                return resp.status(200).json({
                    ok: true,
                    total: conteo,
                    medicos: resultado
                });
            });


        });
});

// ==================================================
// POST Crear medico
// ==================================================
app.post('/', mdAutenticacion.verificaToken, (req, resp, next) => {

    //obtenemos los datos del post
    var body = req.body;

    //Creamos un objeto hospital
    var objMedico = new Medico({
        nombre: body.nombre,
        img: body.img,
        usuario: req.usuario._id,
        hospital: body.hospital
    });

    //guadamos el objeto a la bd
    objMedico.save((err, regGuardado) => {


        //si hay un error
        if (err) {
            return resp.status(400).json({
                ok: false,
                mensaje: 'Error al crear medico',
                errors: err
            });
        }

        // si no hubo error - 201 creado
        resp.status(201).json({
            ok: true,
            medico: regGuardado,
            usuarioToken: req.usuario
        });

    });

});



// ==================================================
// PUT Actualizar medico
// ==================================================
app.put('/:id', mdAutenticacion.verificaToken, (req, resp, next) => {

    //obtenemos el id que viene como parametro
    var id = req.params.id;
    // obtenemos los datos a actualizar
    var body = req.body;

    //Buscamos el hospital en la bd
    Medico.findById(id, (err, medicoEncontrado) => {

        if (err) {

            return resp.status(500).json({
                ok: false,
                mensaje: 'Error al buscar el medico',
                errors: err
            });
        }

        medicoEncontrado.nombre = body.nombre;
        medicoEncontrado.img = body.img;
        medicoEncontrado.usuario = req.usuario._id;
        medicoEncontrado.hospital = body.hospital;

        //guardamos la actualizacion
        medicoEncontrado.save((err, medicoActualizado) => {

            if (err) {
                return resp.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar medico',
                    errors: err
                });
            }


            //retornamos respuesta de guardado exitoso
            return resp.status(200).json({
                ok: true,
                medico: medicoActualizado
            });
        });
    });
});

// ==================================================
// DELETE Borrar medico
// ==================================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, resp, next) => {

    var id = req.params.id;

    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {

        // si existe error en el servidor
        if (err) {
            return resp.status(500).json({
                ok: false,
                mensaje: 'Error al borrar medico ',
                errors: err
            });
        }

        // si no encontro el documento
        if (!medicoBorrado) {
            return resp.status(400).json({
                ok: false,
                mensaje: 'No existe un medico con ese id',
                errors: { message: 'No existe un medico con ese id' }
            });
        }

        // si el borrado se realizo con exito
        resp.status(201).json({
            ok: true,
            medico: medicoBorrado
        });


    });

});


module.exports = app;