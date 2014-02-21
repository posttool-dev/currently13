var mongoose = require('mongoose');
var s = {
    email:    String,
    name:     String,
    password: String,
    is_admin: Boolean,
    role:     Number,
    contact:  mongoose.Schema.Types.Mixed
};

var schema = new mongoose.Schema(s);
schema.index({email: 1, password: 1});

schema.methods.url = function()
{
    return '/user/' + this._id;
}

exports.models = {
    "User": {schema: s}
}
exports.model = mongoose.model('User', schema);
exports.User = exports.model;
