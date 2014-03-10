var mongoose = require('mongoose'),
  ObjectId = mongoose.Schema.Types.ObjectId;

var schema = new mongoose.Schema({
  name: {type: String, required: true, trim: true},
  email: {type: String, required: true, trim: true, lowercase: true, unique: true},
  email_verified: {type:Boolean, default: false},
  image: {type: ObjectId, ref: 'Resource'},
  hash: {type: String},
  salt: {type: String},
  created: {type: Date, default: Date.now},
  last_login: {type: Date, default: Date.now},
  group: {type:String},
  admin: {type:Boolean, default: false},
  active: {type:Boolean, default: false}
});

exports.User = mongoose.model('User', schema);
