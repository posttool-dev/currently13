exports.forEach = function(list, target, complete, concurrent)
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



var winston = require('winston');
require('winston-mongodb').MongoDB;

exports.get_logger = function(name)
{
  return new winston.Logger({
    transports: [
      new winston.transports.Console({colorize: true}),
      new winston.transports.MongoDB({host: 'localhost', db: 'logs', collection: name})
    ]
  });
}





// id conversion

exports.just_ids = function (a) {
  var r = [];
  for (var i = 0; i < a.length; i++)
    if (a[i])
      r.push(just_id(a[i]));
  return r;
}


exports.just_id = function (a) {
  if (a && a._id)
    return String(a._id);
  else
    return a;
}

// compare arrays
exports.compareArrays = function (a, b) {
  if (!a && !b)
    return true;
  if (!a || !b)
    return false;
  if (a.length != b.length)
    return false;
  for (var i = 0; i < a.length; i++)
    if (a[i] != b[i])
      return false;
  return true;
}

exports.set_values = function(form, schema_info, data, original){
  var info = { diffs: {} };
  for (var i = 0; i < form.length; i++) {
    var f = form[i].name;
    if (!f)
      continue;
    var field_info = schema_info[f];
    var field_val = original[f];
    var match = false;
    if (field_info.type == 'Reference') {
      field_val = field_info.is_array ? exports.just_ids(field_val) : exports.just_id(field_val);
      match = exports.compareArrays(field_val, data[f])
    }
    else
      match = (data[f] == field_val) || (data[f] == '' && field_val == null);
    if (!match) {
      if (f != 'modified')//or other auto date fields...!
        info.diffs[f] = jsdiff.diffChars(field_val, data[f]);
      original[f] = data[f];
    }
  }
}