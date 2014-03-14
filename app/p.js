//var logger = require('./logger')
var fs = require('fs');
var express = require('express'), app = express();
var mongoose = require('mongoose');
var cloudinary = require('cloudinary');
var MongoStore = require('connect-mongo')(express);

var cms = require('./modules/cms');

var p = require('./peter'),
  config = p.config;



mongoose.connect(config.mongoConnectString, {}, function (err) {
  if (err) throw err;
  mongoose.connection.on('error', console.error.bind(console, 'connection error:'));
  init_app();
});


//process.on('uncaughtException', function (err) {
//  console.error('uncaughtException:', err.message)
//  console.error(err.stack)
//  process.exit(1)})
//server.on('error', function (err) {
//  console.error(err)
//})


function init_app() {
  app.set('view engine', 'ejs');
  app.set('views',__dirname + '/views');

  app.use(express.cookieParser());
  app.use(express.session({
    secret: config.sessionSecret,
    store: new MongoStore({db: mongoose.connection.db})
  }));
  app.use(express.urlencoded());
  app.use(express.json());
  app.use(express.multipart({limit: config.multipartLimit}));
  app.use(express.methodOverride());
  app.use(express.static(__dirname + '/public'));

  app.configure('development', function () {
    app.use(express.logger('dev'));
    app.use(express.errorHandler());
  });
//  cloudinary.config(config.cloudinaryConfig);

  cms.init(app, p);

  app.listen(config.serverPort);
  console.log('App started on port '+config.serverPort);
}




