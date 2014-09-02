var express = require('express');
var mongoose = require('mongoose');
var postera = require('../modules/postera/util');

var workflow = require('./workflow'),
    PUBLISHED = workflow.PUBLISHED,
    util = require('./util');

// serve express app
exports = module.exports = function(config, meta) {
  var app = express();
  app.set('view engine', 'ejs');
  app.set('views',__dirname + '/views');
  app.use(express.static(__dirname + '/public'));
  //app.use(favicon(__dirname + '/public/favicon.ico'));
  app.use(express.urlencoded());
  app.use(express.json());

  var Page = meta.model('Page');
  var News = meta.model('News');
  var Resource = meta.model('Resource');

//
//  var getResources = function (complete) {
//    Resource.find({for_home_page: true}, function (err, r) {
//      console.log(err,r)
//      complete(err, r);
//    });
//  }

  var getResources = function (page, resources) {
    if (resources == null)
      resources = [];
    if (page.resources) {
      for (var i = 0; i < page.resources.length; i++) {
        var r = page.resources[i];
        if (r.for_home_page) {
          r.source = {page: page._id, url: page.url, index: i};
          resources.push(r);
        }
      }
    }
    if (page.pages) {
      for (var i = 0; i < page.pages.length; i++) {
        getResources(page.pages[i], resources);
      }
    }
    return resources;
  }

  function get_res_bp(){
    return "http://res.cloudinary.com/"+config.cloudinaryConfig.cloud_name+"/image/upload";
  }

  // endpoints

  app.get('/favicon.ico', function(req, res, next){
    res.status(404).send('Not found');
  });

  app.get('/', function (req, res, next) {
    postera.getSiteMapData(Page, function (err, site) {
      if (err) return next(err);
      var resources = getResources(site.pages[0]);
      if (err) return next(err);
      News.find({}, function (err, news) {
        if (err) return next(err);
        res.render('index', {site: site, news: news, images: resources, next_page: site.pages[0].pages[0], resource_basepath: get_res_bp()});
      });
    });
  });

  app.get('/*', function (req, res, next) {
    postera.getSiteMapData(Page, function (err, site) {
      if (err) return next(err);
      Page.findOne({url: req.path}).populate("resources").exec(function (err, page) { //state: PUBLISHED
        if (err) return next(err);
        if (!page) return next(new Error('no such page'));
        page = util.findById(site, page.id);
        var next_page = util.getNextNode(page);
        res.render('page', {page: page, site: site, next_page: next_page, resource_basepath: get_res_bp()});
      });
    });
  });

  return app;



}
