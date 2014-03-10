//var logger = require('./logger')
var fs = require('fs');
var express = require('express'), app = express();
var mongoose = require('mongoose');
var cloudinary = require('cloudinary');
var MongoStore = require('connect-mongo')(express);

var auth = require('./modules/auth');
var cms = require('./modules/cms');
var index = require('./modules/index');

var config = require('./config');
var hm = require('./hackettmill');


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

  hm.migrate.migrate_data();

  app.set('view engine', 'ejs');
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
  cloudinary.config(config.cloudinaryConfig);



  // General

  // move session message to request locals
  // put user in request locals
  app.use(function (req, res, next) {
    res.locals.message = req.session.message;
    delete req.session.message;
    res.locals.user = req.session.user;
    res.user = req.session.user;
    next();
  });


  // Index
  app.get('/', index.index);

  // Auth
  auth.on_login = '/cms';
  app.get('/login', auth.login.get);
  app.post('/login', auth.login.post);
  //app.get('/register', auth.register.get);
  //app.post('/register', auth.register.post);
  app.all('/logout', auth.logout);

  // User
  //app.all ('/users', [utils.has_user, utils.is_admin], user.list);
  //app.get ('/user/:user_id', [utils.has_user, user.load, user.is_user], user.display);
  //app.get ('/user/:user_id/edit', [utils.has_user, user.load, user.is_user], user.form.get);
  //app.post('/user/:user_id/edit', [utils.has_user, user.load, user.is_user], user.form.post);
  app.get('/profile', [auth.has_user], auth.form.get);
  app.post('/profile', [auth.has_user], auth.form.post);

  cms.init(hm.models, hm.workflow);

  app.all('/cms', [auth.has_user, cms.add_meta], cms.show_dashboard);
  app.all('/cms/logs', [auth.has_user, cms.add_meta], cms.logs_for_user);
  app.all('/cms/logs/:type/:id', [auth.has_user, cms.add_meta], cms.logs_for_record);
  app.get('/cms/browse/:type', [auth.has_user, cms.add_meta], cms.browse.get);
  app.post('/cms/browse/:type', [auth.has_user, cms.add_meta], cms.browse.post);
  app.post('/cms/schema/:type', [auth.has_user, cms.add_meta], cms.schema);
  app.get('/cms/create/:type', [auth.has_user, cms.add_meta], cms.form.get);
  app.post('/cms/create/:type', [auth.has_user, cms.add_meta], cms.form.post);
  app.get ('/cms/update/:type/:id', [auth.has_user, cms.add_meta], cms.form.get);
  app.post('/cms/update/:type/:id', [auth.has_user, cms.add_meta, cms.add_object], cms.form.post);
  app.get ('/cms/get/:type', [auth.has_user, cms.add_meta], cms.form.get_json);
  app.get ('/cms/get/:type/:id', [auth.has_user, cms.add_meta, cms.add_object], cms.form.get_json);
  app.post('/cms/delete_references/:type/:id', [auth.has_user, cms.add_meta, cms.add_object], cms.form.delete_references);
  app.post('/cms/delete/:type/:id', [auth.has_user, cms.add_meta, cms.add_object], cms.form.delete);
  app.post('/cms/upload', [auth.has_user], cms.upload);
  app.get('/cms/download/:id', [auth.has_user], cms.download);
  app.get('/cms/delete_resource/:id', [auth.has_user], cms.delete_resource);

  app.listen(config.serverPort);
  console.log('App started on port 3000');
}




