var fs = require('fs');
var csv = require('csv');
var mongoose = require('mongoose');
var cloudinary = require('cloudinary');
var uuid = require('node-uuid');
var http = require('http');

var workflow = require('./workflow');
var cms = require('../modules/cms');

var data = {};
var path = __dirname + '/migrate/HackettMillServer_Backup_2014_02_27_100100/';

var use_existing_images = false; // false will destroy images at cloudinary & table of resources
var prefix = 'dev1';

var _job;
var _done;
exports.migrate_data = function (job, done) {
  if (_job && job)
  {
    _done(new Error('migration is in progress'));
    return;
  }
  _job = job;
  _done = done;
  if (use_existing_images)
    migrate0();
  else
      migrate_delete_resources0();

//  else
//    cloudinary.api.delete_resources_by_prefix(prefix, function (c) {
//      console.log('   ... deleted ' + c + ' cloduinary resources');
//      migrate_delete_resources0();
//    });
}


function migrate_delete_resources0() {
  var R = cms.meta.model('Resource');
  console.log("Removing existing resources...");
  R.find().remove(function (err, c) {
    console.log(" ... removed " + c);
    migrate0();
  });
}


function migrate0() {
  console.log('Reading CSVs');
  fs.readdir(path, function (err, files) {
    cms.utils.forEach(files, read_csv, migrate1);
  });
  cms.models.Log.remove(function(err,r){
    console.log("REMOVED LOGS ",err,r);
  });
}


function migrate1()
{
  cms.utils.forEach(data['Resource'].array, create_resource, migrate2, 2);
}


function migrate2()
{
  var i = 0;
  var models = ['Inventory','Artist', 'Catalog','Contact','Essay','Exhibition','News','Page'];
  cms.utils.forEach(models, function (e, next) {
    if (_job)
      _job.progress(i, models.length);
    repopulate(e, next);
    i++;
  }, function () {
    if (_done)
    {
      _job = null;
      _done();
    }
  });
}


function repopulate(type, complete)
{
  var R = cms.meta.model(type);
  R.find().remove(function (err, c) {
    console.log('Repopulating '+type+' ... removed '+c+' old records.');
    if (_job)
      _job.log('Repopulating '+type+' ... removed '+c+' old records.');
    cms.utils.forEach(data[type].array,
      function(e, next){
        create(type, e, next);},
      complete);
  });
}


function read_csv(file, next) {
  var mod = function(val){
    if (val == 'NULL')
      return null;
    else
      return val;
  }
  var a = [];
  var m = {};
  var sch;
  var name;
  csv()
    .from.path(path + file, { delimiter: ',', escape: '"' })
    .on('record', function (row, index) {
      if (index==0)
        name = row[0];
      else if (index==1)
        sch = row;
      else
      {
        var o = {}
        for (var i=0; i<sch.length; i++)
          o[sch[i]] = mod(row[i]);
        a.push(o);
        m[o.id] = o;
      }
    })
    .on('end', function (count) {
      data[name] = {name: name, array: a, map: m};
      next();
    })
    .on('error', function (error) {
      console.error("X", error.message);
      next(error);
    });
}


function create_resource(rd, next) {
  var p = rd['path-token'];
  var url = "http://www.hackettmill.com:81/hm_resources/" + p;
  var R = cms.meta.model('Resource');
  R.findOne({path:p}, function(err, r){
    if (r)
    {
      rd.model = r;
      next();
    }
    else
    {
      console.log(p);
      http.get(url, function (response) {
        //console.log(response)
        cms.write(response, p, function (err) {
          cms.save_resource(rd['filename'], p, rd['content-type'], rd['filesize'], null, {}, function (s) {
            console.log(s);
            rd.model = r;
            next();
          });
        });
      });
    }
  });
}



function create(type, data, next)
{
  var M = cms.meta.model(type);
  var model = new M();
  var info = cms.meta.info(type);
  for (var p in info)
  {
    if (p == 'creator' || p == 'modified' || p == 'created')
      continue;
    else if (data[p])
      model[p] = get_field_val(info[p], data[p]);
  }
  model.state = workflow.PUBLISHED;
  model.save(function (err, i) {
    if (err)
      console.log(err);
    data.model = i;
    next();
  });
}



function get_field_val(meta, sval)
{
  switch(meta.type)
  {
    case 'Reference':
      if (meta.is_array)
      {
        var vals = [];
        var v = sval.substring(1, sval.length-1).split(',');
        for (var i=0; i< v.length; i++)
        {
          var r = get_ref_val(v[i]);
          if (r) vals.push(r);
        }
        return vals;
      }
      else
        return get_ref_val(sval);
    case 'Date':
      var d = sval.split('.'); // parse non standard date format
      var d6 = d[5].split(' ');
      var dd = new Date(Number(d[0]),Number(d[1])-1,Number(d[2]),Number(d[3]),Number(d[4]),Number(d6[0]));
      return dd;
    case 'Number':
      return Number(sval);
    case 'Boolean':
      return Boolean(sval);
    default:
      return sval;
  }
}


function get_ref_val(ref_str)
{
  var vv = ref_str.split(':');
  try {
    var vtype = vv[0].trim();
    var vid = vv[1].trim();
    return data[vtype].map[vid].model;
  } catch (e) {
    return null;
  }
}



