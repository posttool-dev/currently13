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