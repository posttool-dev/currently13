var express = require('express');
var mongoose = require('mongoose');

var hm = require('./'),
    PUBLISHED = hm.workflow.PUBLISHED,
    config = hm.config;

// connect to db

var connection = mongoose.createConnection(config.mongoConnectString);
connection.on('error',function(){
  console.log('noooo '+config.mongoConnectString)
});

// serve express app
exports = module.exports = function(meta) {
  var app = express();
  app.set('view engine', 'ejs');
  app.set('views',__dirname + '/views');
  app.use(express.static(__dirname + '/public'));
  //app.use(favicon(__dirname + '/public/favicon.ico'));
  app.use(express.urlencoded());
  app.use(express.json());

  var Page = meta.model('Page');
  var News = meta.model('News');
//
  app.get('/', function (req, res) {
    Page.find({}, null, {sort: 'date'}, function (err, pages) { //state: PUBLISHED
      News.find({}, function (err, news) {
       res.render('index', {site: getSiteMap(pages), news: news});
      });
    });
  });
//  app.get('/artists', function (req, res) {
//    Artist.find({state: PUBLISHED}, null, {sort: 'last_name'}, function (err, artists) {
//      res.render('artists', {artists: artists});
//    });
//  });
//  app.get('/artist/:id', function (req, res) {
//    Artist.findOne({_id: req.params.id, state: PUBLISHED}, function (err, artist) {
//      res.render('artist', {artist: artist});
//    });
//  });
  return app;
}



function getSiteMap(pages, root_title) {
  if (!root_title)
    root_title = 'home';
  var m = {};
  for (var i=0; i<pages.length; i++)
    m[pages[i].id] = pages[i];
  var root = null;
  for (var i=0; i<pages.length; i++)
  {
    var p = pages[i];
    for (var j=0; j< p.pages.length; j++){
      if (p.title == root_title)
        root = p;
      p.pages[j] = m[p.pages[j]];
    }
  }
  // s/could go through and delete nulls (the result of unpublished children)
  return root;
}


