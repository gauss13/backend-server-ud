var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;

var hospitalSchema = new Schema({
    nombre: { type: String, required: [true, 'El nombre es necesario'] },
    img: { type: String, required: false },
    usuario: { type: Schema.Types.ObjectId, ref: 'Usuario' } //referencia al campo _id de Usuario
}, { collection: 'hospitales' }); //esto indica el nombre de como se guardara en mongo


module.exports = mongoose.model('Hospital', hospitalSchema);