var fs = require('fs');
var logger = require('winston');
var cluster = require('cluster');
var express = require('express');
var mongoose = require('mongoose');
//var bugsnag = require("bugsnag");
//bugsnag.register("5c77895342af431a53b6070d90ea6280");
////bugsnag.notify(new Error("Non-fatal"));

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
  var domain = require('./' + process.argv[2]);
  var cms = new current.Cms(domain);
  server.use(cms.app);
  server.use(domain.app(cms.config, cms.meta));
  server.listen(domain.config.serverPort);
}


//iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-port 8080

//process.on('uncaughtException', function (err) {
//  console.error('uncaughtException:', err.message);
//  console.error(err.stack);
//});

//server.cms/app.on('error', function (err) {
//  console.error(err);
//});

