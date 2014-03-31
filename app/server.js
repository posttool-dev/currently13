var fs = require('fs');
var logger = require('winston')
var express = require('express');
var mongoose = require('mongoose');

var current = require('./modules/cms');

var domains = ['hackettmill','peter.com'];
var server = express();
for (var i=0; i<domains.length; i++)
{
  var cms = new current.Cms();
  var module = require('./'+domains[i]);
  console.log(module.config.name);
  var app = cms.init(module);
  server.use(express.vhost(domains[i], app));
}

process.on('uncaughtException', function (err) {
  console.error('uncaughtException:', err.message);
  console.error(err.stack);
  process.exit(1);
});
server.on('error', function (err) {
  console.error(err);
});

server.listen(8080);



