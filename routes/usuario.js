var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

// var SEED = require('../config/config').SEED;

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

//importamos el modelo
var Usuario = require('../models/usuario');

// ==================================================
// Obtener todos los usuarios
// ==================================================
app.get('/', (req, res, next) => {

    //consultamos la db
    // {} indica todos 
    // pasamos un callbak que recibe un error, o la coleccion de usuarios
    // para evitar que regrese el campo password en la consulta
    // le indicamos que campos queremos mostrar
    // y agregamos la fucion exec
    Usuario.find({}, 'nombre email img role')
        .exec(
            (err, usuarios) => {

                //si hay un error
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando usuarios',
                        errors: err
                    });
                }

                // si no hubo error
                res.status(200).json({
                    ok: true,
                    usuarios: usuarios
                });

            });
});


// ==================================================
// Verificar token - middleware
// lo colocamos aqui de forma estrategica, despues del get 
// porque cualquier ruta despues de esta, pasará aqui primero
// ==================================================
// app.use('/', (req, res, next) => {

//     var token = req.query.token;

//     jwt.verify(token, SEED, (err, decoded) => {

//         if (err) {
//             return res.status(401).json({
//                 ok: false,
//                 mensaje: 'Token no valido',
//                 errors: err
//             });
//         }

//         //si todo esta bien, usamos next para indicarle que puede continuar con las demas rutas, post, put, delete que estan registradas en el archivo
//         next();
//     });
// });
//pasamos este codigo al archivo middlewares/autenticacion.js






// ==================================================
// Actualizar usuario
// ==================================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    //obtenemos el id
    var id = req.params.id;
    var body = req.body;

    //buscamos el usuario en bd

    Usuario.findById(id, (err, usuarioRes) => {

        //si hay un error en el servidor 
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        //si usuario viene nulo o no encontró
        if (!usuarioRes) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Usuario no encontrado',
                errors: { mensaje: 'No existe un usuario con ese id' }
            });
        }

        //Actualizar el dato

        usuarioRes.nombre = body.nombre;
        usuarioRes.email = body.email;
        usuarioRes.role = body.role;
        usuarioRes.img = body.img;
        // usuarioRes.password = body.password;

        usuarioRes.save((err, usuarioActualizado) => {

            //si hay un error 400 porque puede ser que los datos no sean correctos
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar usuarios',
                    errors: err
                });
            }


            usuarioActualizado.password = ":)";

            // si no hubo error - 201 creado
            res.status(201).json({
                ok: true,
                usuario: usuarioActualizado
            });

        });
    });

});

// ==================================================
// Crear un nuevo usuario
// ==================================================
app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    //del modelo de dato creado
    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    //guardar el usuario en la bd
    // recordar que en el modelo esta implementado mongoose
    usuario.save((err, usuarioGuardado) => {

        //si hay un error
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear usuario',
                errors: err
            });
        }

        // si no hubo error - 201 creado
        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuarioToken: req.usuario
        });


    });


});




// ==================================================
// DELETE - borrar un usuario por id
// ==================================================

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {

        //si hay un error
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar usuario id ',
                errors: err
            });
        }


        //si hay un error
        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un usuario con ese id ',
                errors: { message: 'No existe un usuario con ese id' }
            });
        }


        // si no hubo error - 201 creado
        res.status(201).json({
            ok: true,
            usuario: usuarioBorrado
        });

    });

});


module.exports = app;