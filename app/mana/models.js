var mongoose = require('mongoose'),
  ObjectId = mongoose.Schema.Types.ObjectId;


var formInstanceSchema = new mongoose.Schema({
  name: {type: String, trim: true},
  type: {type: Number},
  created: {type: Date, default: Date.now}
});
formInstanceSchema.index({ name: 1, type: -1 });
exports.FormInstance = mongoose.model('FormInstance', formInstanceSchema);


var fieldInstanceSchema = new mongoose.Schema({
  form: {type: ObjectId, ref: 'FormInstance'},
  name: {type: String, trim: true},
  type: {type: Number},
  created: {type: Date, default: Date.now}
});
formInstanceSchema.index({ name: 1, type: -1 });
exports.FieldInstance = mongoose.model('FieldInstance', fieldInstanceSchema);


