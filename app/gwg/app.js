var express = require('express');
var util = require('../modules/postera/util');


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

  app.get('/', function (req, res, next) {
    util.getSiteMapData(Page, function (err, site) {
      if (err) return next(err);
      var resources = util.getResources(site);
      News.find({}, function (err, news) {
        if (err) return next(err);
        res.render('index', {site: site, news: news, images: resources, next_page: site.pages[0].pages[0], resource_basepath: util.get_res_bp(config)});
      });
    });
  });

  app.get('/page', function(req, res, next) {
    util.getSiteMapData(Page, function (err, site) {
      if (err) return next(err);
      res.json(site);
    });
  });

//  app.get('/*', function (req, res, next) {
//    util.getSiteMapData(Page, function (err, site) {
//      if (err) return next(err);
//      Page.findOne({url: req.path}).populate("resources").exec(function (err, page) { //state: PUBLISHED
//        if (err) return next(err);
//        if (!page) return next(new Error('no such page'));
//        page = util.findById(site, page.id);
//        var next_page = util.getNextNode(page);
//        res.render('page', {page: page, site: site, next_page: next_page, resource_basepath: util.get_res_bp(config)});
//      });
//    });
//  });

  return app;



}
