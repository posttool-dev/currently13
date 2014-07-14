var http = require("http")

var url = "http://postera.com/PosteraSystems/GetSiteByUserName/.json?args=%5B%22gwg%22%5D&_=1405364406226";
var url2 = "http://postera.com/PosteraTreeModule/FillSystemNode/.json?args=%5B3270988%5D&_=1405364407103";
var bp = "http://postera.s3.amazonaws.com/";

var current = require('../modules/cms');
var utils = require('../modules/cms/utils');

var cms = new current.Cms(require('./index'));
var Page = cms.meta.model('Page');
var Resource = cms.meta.model('Resource');

Page.find({}).remove(function (err, c) {
  Resource.find({}).remove(function (err, d) {
    console.log("removed ", c, d);
    http.get(url2, function (res) {
      var body = '';
      res.on('data', function (chunk) {
        body += chunk;
      });
      res.on('end', function () {
        process_site(JSON.parse(body));
      });
    }).on('error', function (e) {
      console.log("Got error: ", e);
    });
  });
});

function process_site(site) {
  utils.forEach(site.value.attributes.children, function (o, n) {
    process_node(o, n)
  }, function () {
    console.log("OK");
    process.exit(0);
  });
}

function process_node(node, next) {
  var page = new Page({
    title: node.attributes.data.attributes.title,
    body: node.attributes.data.attributes.description,
    url: node.attributes.node_id
  });
  utils.forEach(node.attributes.data.attributes.images, function (o, n) {
    //console.log(o.attributes.description);
    //console.log(o.attributes.resource.attributes.title);
    //console.log(o.attributes.resource.attributes['path-token']);
    create_resource(o.attributes.resource.attributes, o.attributes.description, function (r) {
      page.resources.push(r);
      return n();
    });
  }, function () {
    utils.forEach(node.attributes.children, function (o, n) {
      process_node(o, function (p) {
        page.pages.push(p);
        return n();
      });
    }, function () {
      page.save(function (err, p) {
        console.log(p);
        return next(page);
      })
    });
  });
}


function create_resource(rd, descr, next) {
  var p = rd['path-token'];
  var url = bp + p;
  Resource.findOne({path: p}, function (err, r) {
    if (r) {
//      r.meta = {description: descr};
//      r.save(function(err,r){
      return next(r);
//      })
    }
    else {
      http.get(url, function (response) {
        cms.write(response, p, function (meta) {
          meta.description = descr;
          cms.save_resource(rd['filename'], p, rd['content-type'], rd['filesize'], null, meta, function (r) {
            console.log(r);
            return next(r);
          });
        });
      });
    }
  });
}