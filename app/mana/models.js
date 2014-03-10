var mongoose = require('mongoose'),
  ObjectId = mongoose.Schema.Types.ObjectId;


exports.FormInstance = mongoose.model('FormInstance', new mongoose.Schema({
  name: {type: String, required: true, trim: true},
  created: {type: Date, default: Date.now}
}));

exports.FieldInstance = mongoose.model('FieldInstance', new mongoose.Schema({
  name: {type: String, required: true, trim: true}
}));


