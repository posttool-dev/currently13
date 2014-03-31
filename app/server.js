var fs = require('fs');
var logger = require('winston')
var express = require('express');
var mongoose = require('mongoose');

var current = require('./modules/cms');

var server = {
  cms: express(),
  app: express()
}
function add_cms(name, info){
  var cms = new current.Cms(require(info));
  server.cms.use(express.vhost(name, cms.app));
}
function add_app(name, info){
  var app = require(info)();
  server.app.use(express.vhost(name, app));
}
fs.readFile( __dirname + '/sites.json', 'utf8', function (err, data) {
  data = JSON.parse(data);
  for (var p in data.cms)
    add_cms(p, data.cms[p]);
  for (var p in data.www)
    add_app(p, data.www[p]);
});

server.cms.listen(8080);
server.app.listen(3000);
//iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-port 3000

process.on('uncaughtException', function (err) {
  console.error('uncaughtException:', err.message);
  console.error(err.stack);
  process.exit(1);
});

//server.on('error', function (err) {
//  console.error(err);
//});
//
//server.listen(8080);



