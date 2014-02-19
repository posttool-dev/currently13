var fs = require('fs')
    , domain = require('domain')
  , express = require('express'), app = express()
  , mongoose = require('mongoose')
  , Grid = require('gridfs-stream'), gfs = null
  , auth = require('./modules/auth')
  , user = require('./modules/user')
  , utils = require('./modules/utils')
  , index = require('./modules/index')
  , cms = require('./modules/cms')
  , hm = require('./hackettmill/models')
;

Grid.mongo = mongoose.mongo;

mongoose.connect('mongodb://localhost/test', {}, function (err) {
    if (err) throw err;
    mongoose.connection.on('error', console.error.bind(console, 'connection error:'));
    gfs = new Grid(mongoose.connection);
//    console.log('connection', db.connection);
//    console.log('gfs', gfs);
    init_app();
});

function init_app()
{
    app.set('view engine', 'ejs');
    app.use(express.logger('dev'));
    app.use(express.cookieParser());
    app.use(express.session({secret: 'nfuds9543ythhfgjghf$WH*#IRF5euyhtfgxkj'}));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.static(__dirname + '/public'));

    // General

    // move session message to request locals
    // put user in request locals
    app.use(function(req, res, next){
        res.locals.message = req.session.message;
        delete req.session.message;
        res.locals.user = req.session.user;
        next();
    });

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

for (var p in  hm.models)
{
    console.log(p);
    var schema_data = hm.models[p].schema;
    var schema = mongoose.Schema(schema_data);
    cms.add_fields_and_methods(schema);
    var d = cms.create_form_from_schema(schema);
    console.log(d);
}

    var a = function(req, res, next){
        req.models = hm.models;
        next();
    };
    var b = function(req, res, next){
        req.browser = hm.models[req.params.type]['browse'];
        req.form = hm.models[req.params.type]['form'];
        next();
   };
    var c = function(req, res, next){
        req.browser = hm.models[req.params.type]['browse'];
        req.form = hm.models[req.params.type]['form'];
        var q = model.findOne({uuid: req.params.uuid});
        q.exec(function(err, m)
        {
            exports.process_err(err);
            req.object = m;
            next();
        });
   };
    app.all ('/cms', [utils.has_user, a], cms.show_dashboard);
    app.all ('/cms/browse/:type', [utils.has_user, a, b], cms.browse);
    app.all ('/cms/create/:type', [utils.has_user, a, b], cms.form.get);
    app.get ('/cms/edit/:type/:uuid', [utils.has_user, a, b, c], cms.form.get);
    app.post('/cms/edit/:type/:uuid', [utils.has_user, a, b, c], cms.form.post);

    app.listen(3000);
    console.log('App started on port 3000');
}