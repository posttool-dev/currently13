var fs = require('fs')
  , express = require('express'), app = express()
  , mongoose = require('mongoose')
  , cloudinary = require('cloudinary')

  , auth = require('./modules/auth')
  , cms = require('./modules/cms')
  , index = require('./modules/index')

  , hm = require('./hackettmill/models')
  ;


mongoose.connect('mongodb://localhost/test', {}, function (err) {
  if (err) throw err;
  mongoose.connection.on('error', console.error.bind(console, 'connection error:'));
  init_app();
});


function init_app() {


  app.set('view engine', 'ejs');
  app.use(express.logger('dev'));
  app.use(express.cookieParser());
  app.use(express.session({secret: 'nfuds9543ythhfgjghf$WH*#IRF5euyhtfgxkj'}));
  app.use(express.urlencoded());
  app.use(express.json());
  app.use(express.multipart({limit: '1099mb'}));
  app.use(express.methodOverride());
  app.use(express.static(__dirname + '/public'));

  app.configure('development', function () {
    app.use(express.errorHandler());
    cloudinary.config({ cloud_name: 'posttool', api_key: '681946288916643', api_secret: 'L08_8W3noETBoKaMk9CV8paLlx8' });
  });

  migrate_data();
  // General

  // move session message to request locals
  // put user in request locals
  app.use(function (req, res, next) {
    res.locals.message = req.session.message;
    delete req.session.message;
    res.locals.user = req.session.user;
    res.user = req.session.user;
    next();
  });


  // Index
  app.get('/', index.index);

  // Auth
  auth.on_login = '/cms';
  app.get('/login', auth.login.get);
  app.post('/login', auth.login.post);
  app.get('/register', auth.register.get);
  app.post('/register', auth.register.post);
  app.all('/logout', auth.logout);

  // User
  //app.all ('/users', [utils.has_user, utils.is_admin], user.list);
  //app.get ('/user/:user_id', [utils.has_user, user.load, user.is_user], user.display);
  //app.get ('/user/:user_id/edit', [utils.has_user, user.load, user.is_user], user.form.get);
  //app.post('/user/:user_id/edit', [utils.has_user, user.load, user.is_user], user.form.post);
  app.get('/profile', [auth.has_user], auth.form.get);
  app.post('/profile', [auth.has_user], auth.form.post);

  cms.init(hm.models, "Resource", "User");

  app.all('/cms', [auth.has_user, cms.a], cms.show_dashboard);
  app.get('/cms/browse/:type', [auth.has_user, cms.a, cms.b], cms.browse.get);
  app.post('/cms/browse/:type', [auth.has_user, cms.a, cms.b], cms.browse.post);
  app.post('/cms/schema/:type', [auth.has_user, cms.a, cms.b], cms.schema);
  app.get('/cms/create/:type', [auth.has_user, cms.a, cms.b], cms.form.get);
  app.post('/cms/create/:type', [auth.has_user, cms.a, cms.b, cms.c], cms.form.post);
  app.get ('/cms/update/:type/:id', [auth.has_user, cms.a, cms.b, cms.c], cms.form.get);
  app.post('/cms/update/:type/:id', [auth.has_user, cms.a, cms.b, cms.c], cms.form.post);
  app.get ('/cms/get/:type', [auth.has_user, cms.a, cms.b], cms.form.get_json);
  app.get ('/cms/get/:type/:id', [auth.has_user, cms.a, cms.b, cms.c], cms.form.get_json);
  app.post('/cms/upload', [auth.has_user], cms.upload);
  app.get('/cms/download/:id', [auth.has_user], cms.download);
  app.get('/cms/delete_resource/:id', [auth.has_user], cms.delete_resource);

  app.listen(3000);
  console.log('App started on port 3000');
}



function migrate_data()
{
  var fs = require('fs');
  var csv = require('csv');
  var path = __dirname+'/hackettmill/data/';
  fs.readdir(path, function(err, files){
    for (var i=0; i<files.length; i++)
    {
      console.log(files[i]);
      csv()
      .from.path(path+files[i], { delimiter: ',', escape: '"' })
//      .transform( function(row){
//        row.unshift(row.pop());
//        return row;
//      })
      .on('record', function(row,index){
        console.log('#'+index+' '+JSON.stringify(row));
      })
      .on('close', function(count){
        // when writing to a file, use the 'close' event
        // the 'end' event may fire before the file has been written
        console.log('Number of lines: '+count);
      })
      .on('error', function(error){
        console.log("X",error.message);
      });
    }
  });

}