var express = require('express');
var mongoose = require('mongoose');

var th = require('./'),
    PUBLISHED = th.workflow.PUBLISHED,
    config = th.config,
    util = require('./util');

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
      Page.find({})//state: PUBLISHED
        .populate('resources')
        .exec(function (err, pages) {
          if (err) return next(err);
          var pages_view = [];
          for (var i=0; i<pages.length; i++){
            var p = pages[i];
            pages_view.push({id: p.id, title: p.title, url: p.url, pages: p.pages, resources: p.resources});
          }
          site = getSiteMap(pages_view);
          next(null, site);
        });
    } else {
      next(null, site);
    }
  }

  function getSiteMap(pages) {
    var m = {};
    for (var i = 0; i < pages.length; i++)
      m[pages[i].id] = pages[i];
    var root = null;
    for (var i = 0; i < pages.length; i++) {
      var p = pages[i];
      if (p.url == "/")
        root = p;
      for (var j = 0; j < p.pages.length; j++) {
        p.pages[j] = m[p.pages[j]];
        p.pages[j].parent = p;
      }
    }
    // s/could go through and delete nulls (the result of unpublished children)
    return root;
  }

  function getResources(page, resources) {
    if (resources == null)
      resources = [];
    if (page.resources) {
      for (var i = 0; i < page.resources.length; i++) {
        resources.push(page.resources[i]);
      }
    }
    if (page.pages) {
      for (var i = 0; i < page.pages.length; i++) {
        getResources(page.pages[i], resources);
      }
    }
    return resources;
  }


  // endpoints

  app.get('/', function (req, res, next) {
    getSiteMapData(function (err, site) {
      if (err) return next(err);
      var resources = getResources(site);
      News.find({}, function (err, news) {
        if (err) return next(err);
        res.render('index', {site: site, news: news, images: resources, next_page: site.pages[0].pages[0]});
      });
    });
  });

  app.get('/*', function (req, res, next) {
    getSiteMapData(function (err, site) {
      if (err) return next(err);
      Page.findOne({url: req.path}).populate("resources").exec(function (err, page) { //state: PUBLISHED
        if (err) return next(err);
        if (!page) return next(new Error('no such page'));
        page = util.findById(site, page.id);
        var next_page = util.getNextNode(page);
        res.render('page', {page: page, site: site, next_page: next_page});
      });
    });
  });

  return app;







}
