var express = require('express');
var mongoose = require('mongoose');

var current = require('./modules/cms');

var hm = require('./hackettmill'),
    PUBLISHED = hm.workflow.PUBLISHED,
    config = hm.config;

// connect to db

var connection = mongoose.createConnection(config.mongoConnectString);

var server = express();
var app = init_app();
server.use(express.vhost('hackettmill', app));
server.listen(3000);
console.log('App started on port '+3000);

// serve express app
function init_app() {
  var app = express();
  app.set('view engine', 'ejs');
  app.set('views',__dirname + '/views');
  app.use(express.static(__dirname + '/public'));
  app.use(express.urlencoded());
  app.use(express.json());

  var meta = new current.Meta(hm.models, connection);
  var Exhibition = meta.model('Exhibition');
  var News = meta.model('News');
  var Artist = meta.model('Artist');

  app.get('/', function (req, res) {
    Exhibition.find({state: PUBLISHED}, null, {sort: 'date'}, function (err, exhibits) {
      News.find({state: PUBLISHED}, function (err, news) {
        res.render('hackettmill/index', {exhibits: exhibits, news: news});
      });
    });
  });
  app.get('/artists', function (req, res) {
    Artist.find({state: PUBLISHED}, null, {sort: 'last_name'}, function (err, artists) {
      res.render('hackettmill/artists', {artists: artists});
    });
  });
  app.get('/artist/:id', function (req, res) {
    Artist.findOne({_id: req.params.id, state: PUBLISHED}, function (err, artist) {
      res.render('hackettmill/artist', {artist: artist});
    });
  });
  return app;
}




