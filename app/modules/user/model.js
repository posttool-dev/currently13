var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    email:    String,
    name:     String,
    password: String,
    is_admin: Boolean,
    role:     Number,
    contact:  mongoose.Schema.Types.Mixed
});
schema.index({email: 1, password: 1});

schema.methods.url = function()
{
    return '/user/' + this._id;
}

exports.model = mongoose.model('User', schema);
