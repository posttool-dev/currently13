//var logger = require('./logger')
var fs = require('fs');
var express = require('express'), app = express();
var mongoose = require('mongoose');
var cloudinary = require('cloudinary');
var MongoStore = require('connect-mongo')(express);

var cms = require('./modules/cms');

var config = require('./config');
var hm = require('./hackettmill'), PUBLISHED = hm.workflow.PUBLISHED;



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

  cms.init(app, hm.models, hm.workflow.workflow);
  hm.migrate.migrate_data();

  app.get('/', function(req, res)
  {
    var Exhibition = cms.meta.model('Exhibition');
    var News = cms.meta.model('News');
    Exhibition.find({state: PUBLISHED}, function (err, exhibits) {
      News.find({state: PUBLISHED}, function (err, news) {
        res.render('hackettmill/index', {exhibits: exhibits, news: news});
      });
    });
  });

  app.get('/artists', function(req, res)
  {
    var Artist = cms.meta.model('Artist');
    Artist.find({state: PUBLISHED}, null, {sort: 'last_name'}, function (err, artists) {
      res.render('hackettmill/artists', {artists: artists});
    });
  });

  app.get('/artist/:id', function(req, res)
  {
    var Artist = cms.meta.model('Artist');
    Artist.findOne({_id: req.params.id, state: PUBLISHED}, function (err, artist) {
      res.render('hackettmill/artist', {artist: artist});
    });
  });

  app.listen(config.serverPort);
  console.log('App started on port '+config.serverPort);
}




