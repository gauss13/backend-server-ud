var express = require('express');

const fileUpload = require('express-fileupload');

var fs = require('fs');

var app = express();


//Modelos
var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

// default options
app.use(fileUpload());


//recibira el tipo hospital, medico o usuario
//id del tipo a asignar
app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    //tipo de coleccion
    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];

    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'tipo de coleccion no es valida',
            errors: { message: 'tipo de coleccion no es valida' }
        });
    }

    //validar si viene archivos
    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'no selecciono archivo',
            errors: { message: 'Debe de seleccionar una imagen' }
        });
    }

    // obtener nombre del archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];

    // solo estas extenciones aceptamos
    var extencionesValidad = ['png', 'jpg', 'gif', 'jpeg'];

    if (extencionesValidad.indexOf(extensionArchivo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'extencion no valida',
            errors: { message: 'las extenciones validas son ' + extencionesValidad.join(', ') }
        });
    }

    // Nombre de archivo personalizado
    var nombreArchivo = `${id}-${new Date().getMilliseconds() }.${extensionArchivo}`;

    //Mover el archivo del temporal a un path 
    var path = `./uploads/${tipo}/${nombreArchivo}`

    archivo.mv(path, err => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'error al mover el archivo',
                errors: err
            });
        }

        subirPorTipo(tipo, id, nombreArchivo, res);

        // res.status(200).json({
        //     ok: true,
        //     mensaje: 'Archivo movido',
        //     nombreCortado: nombreCortado
        // });



    });



});


function subirPorTipo(tipo, id, nombreArchivo, response) {
    if (tipo === 'usuarios') {

        Usuario.findById(id, (err, usuario) => {

            //validar si el usuario no existe retornar error
            if (!usuario) {
                return response.status(200).json({
                    ok: true,
                    mensaje: 'usuario no existe',
                    erros: { message: 'Usuario no existe' }
                });
            }

            var pathViejo = './uploads/usuarios/' + usuario.img;

            //Si existe, elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo, err => {});
            }

            //subir la imagen nueva
            usuario.img = nombreArchivo;
            usuario.save((err, usuarioActualizado) => {

                usuarioActualizado.password = ':)';

                return response.status(200).json({
                    ok: true,
                    mensaje: 'Imagen actualizado de usuario',
                    usuario: usuarioActualizado
                });
            });
        });
    }

    if (tipo === 'medicos') {

        Medico.findById(id, (err, medico) => {
            var pathViejo = './uploads/medicos/' + medico.img;

            //Si existe, elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo, err => {});
            }

            //subir la imagen nueva
            medico.img = nombreArchivo;
            medico.save((err, medicoActualizado) => {

                return response.status(200).json({
                    ok: true,
                    mensaje: 'Imagen actualizado de medico',
                    medico: medicoActualizado
                });
            });
        });

    }

    if (tipo === 'hospitales') {
        Hospital.findById(id, (err, hospital) => {
            var pathViejo = './uploads/hospitales/' + hospital.img;

            //Si existe, elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo, err => {});
            }

            //subir la imagen nueva
            hospital.img = nombreArchivo;
            hospital.save((err, hospitalActualizado) => {

                return response.status(200).json({
                    ok: true,
                    mensaje: 'Imagen actualizado de hospital',
                    hospital: hospitalActualizado
                });
            });
        });
    }


}

module.exports = app;