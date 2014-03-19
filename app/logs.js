
var utils = require('./modules/cms/utils');


var express = require('express'), app = express();

app.set('view engine', 'ejs');
app.set('views',__dirname + '/views');

app.use(express.methodOverride());
app.use(express.static(__dirname + '/public'));

app.configure('development', function () {
  app.use(express.logger('dev'));
  app.use(express.errorHandler());
});

app.get('/', function (req, res) {
  var options = {
//    from: new Date() - 24 * 60 * 60 * 1000,
//    until: new Date(),
    limit: 10,
    start: 0,
    order: 'desc',
//    fields: ['message']
  };

  var logger = utils.get_logger('cms');
  logger.query(options, function (err, results) {
    if (err)  throw err;
    res.json(results);
  });
});

app.listen(3002);
console.log('App started on port '+3002);
