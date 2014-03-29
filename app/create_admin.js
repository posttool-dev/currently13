var mongoose = require('mongoose');
var prompt = require('prompt');

var models = require('./modules/cms/models');
var auth = require('./modules/cms/auth');

prompt.message = "create admin > ".cyan;
prompt.delimiter = "".grey;
var prompt_schema = {
    properties: {
      app: {
        required: true
      },
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
  if (result.password != result.confirm)
    throw new Error('Password mismatch!');

  var domain = require('./'+ result.app);
  var connection = mongoose.createConnection(domain.config.mongoConnectString);
  connection.on('error', function(e){
    console.error(e);
  });
  var User = connection.model('User', models.UserSchema);
  var a = new auth.Auth(User);
  a.create_user({name: result.name, email: result.email, email_verified: true,
      password: result.password, active: true, admin: true }, function(err, user) {
        if (err)
          throw new Error(err);
        console.log('Complete', user);
      });

});