var fs = require('fs');
var csv = require('csv');
var mongoose = require('mongoose');
var cloudinary = require('cloudinary');


exports.migrate_data = function (dir) {

//  cloudinary.api.resources(function(items){
//    for (var i=0; i<items.resources.length; i++)
//    {
//      delete_resource(items.resources[i]);
//    }
//  }, {max_results:500});


  var path = dir + '/hackettmill/migrate/';
  var d = {};

  fs.readdir(path, function (err, files) {
    var i = 0;
    var f = function () {
      var ff = files[i];
      var r = ff.substring(0, ff.indexOf('-'));
      read_csv(path + ff, function (err, a) {
        if (err)
          throw new Error(err);
        d[r] = a;
        i++;
        if (i != files.length)
          f();
        else
          migrate_data2(d);
      });
    }
    f();
  });
}

function read_csv(file, next) {
  var a = [];
  csv()
    .from.path(file, { delimiter: ',', escape: '"' })
    .on('record', function (row, index) {
      a[index] = row;
    })
    .on('end', function (count) {
      next(null, a);
    })
    .on('error', function (error) {
      console.log("X", error.message);
      next(error);
    });
}

function migrate_data2(d)
{
  var rs = d['Resource'];
  var i = 0;
  var f = function(){
    create_resource(rs[i], function () {
      i++;
      if (i != rs.length)
        f();
      else
        migrate_data3(d);
    });
  };
  f();
}


function create_resource(rd, next) {
  var p = rd[6];
  var x = rd[9];
  var url = "http://www.hackettmill.com:81/hm_resources/" + x;
  var R = mongoose.model('Resource');
  R.findOne({filename: x}, function (err, r) {
    if (!r) {
      cloudinary.uploader.upload(url,
        function (e) {
          r = new R();
          r.filename = p;
          r.path = x;
          r.meta = e;
          r.save(function (err, s) {
            console.log(s);
            next();
          });
        });
    }
  });
}

function delete_resource(r)
{
  console.log(r.public_id);
  cloudinary.uploader.destroy(r.public_id, function(result) { console.log('destroy', result) });
}


function migrate_data3(d)
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