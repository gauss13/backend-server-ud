var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

// ==================================================
// Verificar token - middleware
// lo colocamos aqui de forma estrategica, despues del get 
// porque cualquier ruta despues de esta, pasará aqui primero
// ==================================================

exports.verificaToken = function(req, res, next) {
    var token = req.query.token;

    jwt.verify(token, SEED, (err, decoded) => {

        if (err) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Token no valido',
                errors: err
            });
        }

        //agregamos el usuario que ejecuto la ccion en el request
        req.usuario = decoded.usuario;


        //si todo esta bien, usamos next para indicarle que puede continuar con las demas rutas, post, put, delete que estan registradas en el archivo
        next();
    });
}