var fs = require('fs');
var logger = require('winston')
var cluster = require('cluster');
var express = require('express');
var mongoose = require('mongoose');

var current = require('./modules/cms');
var useCluster = false;

if (useCluster && cluster.isMaster) {
  var cpuCount = require('os').cpus().length;
  for (var i = 0; i < cpuCount; i += 1) {
    cluster.fork();
  }

  cluster.on('exit', function (worker) {
    console.log('Worker ' + worker.id + ' died');
    cluster.fork();
  });

} else {

  var server = express();
  var cms = new current.Cms(require('./tabithasoren'));
  server.use(cms.app);
  server.use(require('./tabithasoren/app'));

  server.listen(3001);

}


//iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-port 8080

//process.on('uncaughtException', function (err) {
//  console.error('uncaughtException:', err.message);
//  console.error(err.stack);
//});

//server.cms/app.on('error', function (err) {
//  console.error(err);
//});

