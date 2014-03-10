var mongoose = require('mongoose');
var migrate = require('./mana/migrate');


mongoose.connect("mongodb://localhost/mana", {}, function (err) {
  if (err) throw err;
  mongoose.connection.on('error', console.error.bind(console, 'connection error:'));
  migrate.migrate();
});