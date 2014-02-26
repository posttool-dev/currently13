var fs = require('fs');
var csv = require('csv');
var mongoose = require('mongoose')



exports.migrate_data = function(dir) {
  var path = dir + '/hackettmill/migrate/';
  var d = {};

  fs.readdir(path, function (err, files) {
    var i = 0;
    var f = function () {
      var ff = files[i];
     var r = ff.substring(0, ff.indexOf('-'));
      read_csv(path+ff, function (err, a) {
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
  for (var i=0; i<rs.length; i++)
  {
    var p = rs[i][6];
    var url = "http://www.hackettmill.com:81/hm_resources/"+rs[i][9];
    console.log(url);
  }
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