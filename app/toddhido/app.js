var express = require('express');
var mongoose = require('mongoose');

var hm = require('./'),
    PUBLISHED = hm.workflow.PUBLISHED,
    config = hm.config;

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


  // utils
  var site = null;
  var lastTime = null;

  function getSiteMapData(next) {
    if (!site || !lastTime || lastTime.getTime() + 60000 < Date.now()) {
      Page.find({}, null, {sort: 'date'}, function (err, pages) { //state: PUBLISHED
        if (err) return next(err);
        site = getSiteMap(pages);
        next(null, site);
      });
    } else {
      next(null, site);
    }
  }

  function getSiteMap(pages, root_title) {
    if (!root_title)
      root_title = 'home';
    var m = {};
    for (var i = 0; i < pages.length; i++)
      m[pages[i].id] = pages[i];
    var root = null;
    for (var i = 0; i < pages.length; i++) {
      var p = pages[i];
      for (var j = 0; j < p.pages.length; j++) {
        if (p.title == root_title)
          root = p;
        p.pages[j] = m[p.pages[j]];
      }
    }
    // s/could go through and delete nulls (the result of unpublished children)
    return root;
  }

  // endpoints

  app.get('/', function (req, res, next) {
    getSiteMapData(function (err, site) {
      if (err) return next(err);
      News.find({}, function (err, news) {
        if (err) return next(err);
        res.render('index', {site: site, news: news});
      });
    });
  });

  app.get('/*', function (req, res, next) {
    getSiteMapData(function (err, site) {
      if (err) return next(err);
      Page.findOne({url: req.path}).populate("resources").exec(function (err, page) { //state: PUBLISHED
        if (err) return next(err);
        if (!page) return next(new Error('no such page'));
        res.render('page', {page: page, site: site});
      });
    });
  });

  return app;







}
