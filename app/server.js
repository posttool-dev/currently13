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

  var server = {
    cms: express(),
    app: express(),
    kue: express()
  }

  fs.readFile(__dirname + '/sites.json', 'utf8', function (err, data) {
    process_sites_data(JSON.parse(data), true);
  });

  server.cms.listen(43556);
  server.kue.listen(43557);
  server.app.listen(8080);

}


//iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-port 8080

//process.on('uncaughtException', function (err) {
//  console.error('uncaughtException:', err.message);
//  console.error(err.stack);
//});

//server.cms/app.on('error', function (err) {
//  console.error(err);
//});



// utils


function add_cms(name, info, use_vhost) {
  var cms = new current.Cms(require(info));
  if (use_vhost)
    server.cms.use(express.vhost(name, cms.app));
  else
    server.cms.use(cms.app);
}

function add_app(name, info, use_vhost) {
  var app = require(info)();
  if (use_vhost)
    server.app.use(express.vhost(name, app));
  else
    server.cms.use(app);
}

function add_job(name, info, use_vhost) {
  var config = require(info.config);
  var kue = require(info.app)(config);
  if (info.ui)
    if (use_vhost)
      server.kue.use(express.vhost(name, kue.app));
    else
      server.cms.use(kue.app);
}

function process_sites_data(data, use_vhost) {
  for (var p in data.job)
    add_job(p, data.job[p], use_vhost);
  for (var p in data.cms)
    add_cms(p, data.cms[p], use_vhost);
  for (var p in data.www)
    add_app(p, data.www[p], use_vhost);
}