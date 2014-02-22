var fs = require('fs')
  , express = require('express'), app = express()
  , mongoose = require('mongoose')
//  , kue = require('kue')
  , cloudinary = require('cloudinary')
  , auth = require('./modules/auth')
  , user = require('./modules/user')
  , utils = require('./modules/utils')
  , index = require('./modules/index')
  , cms = require('./modules/cms')
  , hm = require('./hackettmill/models')
;


mongoose.connect('mongodb://localhost/test', {}, function (err) {
    if (err) throw err;
    mongoose.connection.on('error', console.error.bind(console, 'connection error:'));
    init_app();
});



function init_app()
{
    app.set('view engine', 'ejs');
    app.use(express.logger('dev'));
    app.use(express.cookieParser());
    app.use(express.session({secret: 'nfuds9543ythhfgjghf$WH*#IRF5euyhtfgxkj'}));
    app.use(express.urlencoded());
    app.use(express.json());
    app.use(express.multipart({limit: '1099mb'}));
    app.use(express.methodOverride());
    app.use(express.static(__dirname + '/public'));

    app.configure('development', function(){
        app.use(express.errorHandler());
        cloudinary.config({ cloud_name: 'posttool', api_key: '681946288916643', api_secret: 'L08_8W3noETBoKaMk9CV8paLlx8' });
        console.log(cloudinary);
    });

    // General

    // move session message to request locals
    // put user in request locals
    app.use(function(req, res, next){
        res.locals.message = req.session.message;
        delete req.session.message;
        res.locals.user = req.session.user;
        res.user = req.session.user;
        next();
    });

//    app.use(kue.app);

    // Index
    app.get('/', index.index);

    // Auth
    auth.on_login = '/cms';
    app.get ('/login', auth.login.get);
    app.post('/login', auth.login.post);
    app.get ('/register', auth.register.get);
    app.post('/register', auth.register.post);
    app.all ('/logout', auth.logout);

    // User
    app.all ('/users', [utils.has_user, utils.is_admin], user.list);
    app.get ('/user/:user_id', [utils.has_user, user.load, user.is_user], user.display);
    app.get ('/user/:user_id/edit', [utils.has_user, user.load, user.is_user], user.form.get);
    app.post('/user/:user_id/edit', [utils.has_user, user.load, user.is_user], user.form.post);

    cms.init(hm.models, "Resource", "User");

    app.all ('/cms', [utils.has_user, cms.a], cms.show_dashboard);
    app.all ('/cms/browse/:type', [utils.has_user, cms.a, cms.b], cms.browse);
    app.get ('/cms/create/:type', [utils.has_user, cms.a, cms.b], cms.form.get);
    app.post('/cms/create/:type', [utils.has_user, cms.a, cms.b, cms.c], cms.form.post);
//    app.get ('/cms/edit/:type/:uuid', [utils.has_user, a, b, c], cms.form.get);
//    app.post('/cms/edit/:type/:uuid', [utils.has_user, a, b, c], cms.form.post);
    app.post('/cms/upload', [utils.has_user], cms.upload);
    app.get ('/cms/download/:id', [utils.has_user], cms.download);
    app.get ('/cms/delete_resource/:id', [utils.has_user], cms.delete_resource);

    app.listen(3000);
    console.log('App started on port 3000');
}