//var logger = require('./logger')
var fs = require('fs');
var mongoose = require('mongoose');

var Cms = require('./modules/cms');

var domain = require('./peter.com');

mongoose.connect(domain.config.mongoConnectString, {}, function (err) {
  if (err) throw err;
  mongoose.connection.on('error', function (err) {
    console.error('Connection Error', err);
  });
  var cms = new Cms();
  var app = cms.init(domain);
  app.listen(8080);
  app.on('error', function (err) {
    console.error('Server Error', err);
  });

});


//process.on('uncaughtException', function (err) {
//  console.error('uncaughtException:', err.message)
//  console.error(err.stack)
//  process.exit(1)})


