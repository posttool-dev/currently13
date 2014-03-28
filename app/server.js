var fs = require('fs');
var logger = require('winston')
var express = require('express');
var mongoose = require('mongoose');

var Cms = require('./modules/cms');

var domains = ['hackettmill','peter.com'];
var server = express();
for (var i=0; i<domains.length; i++)
{
  var cms = new Cms();
  var app = cms.init(require('./'+domains[i]));
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



