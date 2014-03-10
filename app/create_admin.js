var mongoose = require('mongoose');
var prompt = require('prompt');

var config = require('./config');
var auth = require('./modules/auth');

prompt.message = "create admin > ".cyan;
prompt.delimiter = "".grey;
var prompt_schema = {
    properties: {
      name: {
        required: true
      },
      email: {
        required: true
      },
      password: {
        hidden: true
      },
      confirm: {
        hidden: true
      }
    }
  };


prompt.start();

prompt.get(prompt_schema, function (err, result) {
  console.log('  name: ' + result.name);
  console.log('  email: ' + result.email);
  if (result.password != result.confirm)
    throw new Error('Password mismatch!');


  mongoose.connect(config.mongoConnectString, {}, function (err) {
    if (err) throw err;
    mongoose.connection.on('error', console.error.bind(console, 'connection error:'));
    auth.create_user({name: result.name, email: result.email, email_verified: true,
      password: result.password, active: true, admin: true }, function(err, user) {
        if (err)
          throw new Error(err);
        console.log('Complete', user);
      });
  });



});