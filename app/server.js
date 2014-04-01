var fs = require('fs');
var logger = require('winston')
var express = require('express');
var mongoose = require('mongoose');

var current = require('./modules/cms');

var server = {
  cms: express(),
  app: express(),
  kue: express()
}

function add_cms(name, info){
  var cms = new current.Cms(require(info));
  server.cms.use(express.vhost(name, cms.app));
}

function add_app(name, info){
  var app = require(info)();
  server.app.use(express.vhost(name, app));
}

function add_job(name, info){
  var config = require(info.config);
  var kue = require(info.app)(config);
  if (info.ui)
    server.kue.use(express.vhost(name, kue.app));
}

function process_sites_data(data)
{
  for (var p in data.cms)
    add_cms(p, data.cms[p]);
  for (var p in data.www)
    add_app(p, data.www[p]);
  for (var p in data.job)
    add_job(p, data.job[p]);
}

fs.readFile( __dirname + '/sites.json', 'utf8', function (err, data) {
  process_sites_data(JSON.parse(data));
});

server.cms.listen(43556);
server.kue.listen(43557);
server.app.listen(8080);
//iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-port 8080

//process.on('uncaughtException', function (err) {
//  console.error('uncaughtException:', err.message);
//  console.error(err.stack);
//});

//server.cms/app.on('error', function (err) {
//  console.error(err);
//});



