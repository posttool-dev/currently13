var fs = require('fs');
var csv = require('csv');
var mongoose = require('mongoose');
var cloudinary = require('cloudinary');
var uuid = require('node-uuid');

var cms = require('../modules/cms'), process_list = cms.utils.process_list;

var data = {};
var path = __dirname + '/migrate/HackettMillServer_Backup_2014_02_27_100100/';

var use_existing_images = false; // false will destroy images at cloudinary & table of resources
var prefix = 'dev0';

exports.migrate_data = function () {
  if (use_existing_images)
    migrate0();
  else
    cloudinary.api.delete_resources_by_prefix(prefix, function (c) {
      console.log('   ... deleted ' + c + ' cloduinary resources');
      migrate_delete_resources0();
    });

}


function migrate_delete_resources0() {
  var R = mongoose.model('Resource');
  console.log("Removing existing resources...");
  R.find().remove(function (err, c) {
    console.log(" ... removed " + c);
    migrate0();
  });
}


function migrate0() {
  console.log('Reading CSVs');
  fs.readdir(path, function (err, files) {
    process_list(files, read_csv, migrate1);
  });
}


function migrate1()
{
  process_list(data['Resource'].array, create_resource, migrate2, 20);
}


function migrate2()
{
  var e = ['Inventory','Artist', 'Catalog','Contact','Essay','Exhibition','News','Page'];
  process_list(e, function (e, next) {
    repopulate(e, next);
  }, function () {
    'hey now'
  });
}




function repopulate(type, complete)
{
  var R = mongoose.model(type);
  R.find().remove(function (err, c) {
  console.log('Repopulating '+type+' ... removed '+c+' old records.');
    process_list(data[type].array,
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
  var x = rd['filename'];
  var url = "http://www.hackettmill.com:81/hm_resources/" + p;
  var R = mongoose.model('Resource');
  R.findOne({path:p}, function(err, r){
    if (r)
    {
      rd.model = r;
      next();
    }
    else
    {
      cloudinary.uploader.upload(url,
        function (e) {
          var r = new R();
          r.path = x;
          r.meta = e;
          r.meta.thumb = cms.get_preview_url(e);
          r.save(function (err, r) {
            rd.model = r;
            console.log(r.meta.public_id, r.meta.thumb);
            next();
          });
        }, { public_id: prefix+'/'+uuid.v4()});
    }
  });
}


function delete_resource(r, next)
{
  if (r && r.public_id)
  {
    cloudinary.uploader.destroy(r.public_id, function (result) {
      console.log('destroy', r.public_id);
      next();
    });
  }
  else
  {
    next();
  }
}


function create(type, data, next)
{
  var M = mongoose.model(type);
  var model = new M();
  var info = cms.meta.info(type);
  for (var p in info)
    if (p == 'creator' || p == 'modified' || p == 'created')
      continue;
    else if (data[p])
      model[p] = get_field_val(info[p], data[p]);
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
      var d = sval.split('.');
      var d6 = d[5].split(' ');
      var dd = new Date(Number(d[0]),Number(d[1])-1,Number(d[2]),Number(d[3]),Number(d[4]),Number(d6[0]));
      console.log(d, dd, d6);
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






/* helper for processing lists sequentially - move to cms utils */

