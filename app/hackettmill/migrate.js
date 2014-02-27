var fs = require('fs');
var csv = require('csv');
var mongoose = require('mongoose');
var cloudinary = require('cloudinary');

var meta = require('../modules/cms/meta');

var data = {};
var path = __dirname + '/migrate/HackettMillServer_Backup_2014_02_27_100100/';

var use_existing_images = true; // false will destroy images at cloudinary & table of resources
exports.migrate_data = function () {
  if (use_existing_images)
    migrate0();
  else
    cloudinary.api.resources(function (items) {
      process_list(items.resources, delete_resource, migrate_delete_resources0, 20);
    }, {max_results: 500});
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
  process_list(data['Inventory'].array, create_inventory, migrate3);
}

function migrate3()
{
}

function migrate4()
{
}

function migraten(d)
{
  for (var p in d)
  {
    console.log(p);
    try {
      var M = mongoose.model(p);
      console.log(M.modelName);

    } catch(e){
      console.error(e);
    }
  }
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
          r.filename = x;
          r.path = p;
          r.meta = e;
          r.meta.thumb = cloudinary.url(e.public_id + "." + e.format, { width: 300, height: 200, crop: "fill" })
          r.save(function (err, r) {
            rd.model = r;
            console.log(r.meta.public_id, r.meta.thumb);
            next();
          });
        });
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

function create_inventory(inv, next)
{
  var i = create_model('Inventory', inv);
  i.save(function (err, inv) {
    i.model = inv;
    next();
  });
  console.log(i);
//  next();
}

function create_model(type, data)
{
  var M = mongoose.model(type);
  var model = new M();
  var info = meta.info(type);
  for (var p in info)
    if (p == 'creator' || p == 'modified' || p == 'created')
      continue;
    else if (data[p])
      model[p] = get_field_val(info[p], data[p]);
  return model;
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
          vals.push(get_ref_val(v[i]));
        return vals;
      }
      else
        return get_ref_val(sval);
    case 'Date':
      return new Date(sval);
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
    var vtype = vv[0].trim();
    var vid = vv[1].trim();
  console.log(vtype, vid, data[vtype].map[vid]);
    return data[vtype].map[vid].model;
}


/* helper for processing lists sequentially */

function process_list(list, target, complete, concurrent)
{
  if (!list || list.length == 0)
  {
    complete();
    return;
  }
  var c = concurrent ? concurrent : 1;
  var i = 0;
  var k = 0;
  var ff = function(){
    for (var j=0; j<c && i+j<list.length; j++) f();
  }
  var f = function()
  {
    var item = list[i];
    target(item, function(){
      k++;
      if (k < list.length)
        ff();
      else
        complete();
    });
    i++;
  }
  ff();
}