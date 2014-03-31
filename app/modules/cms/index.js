/* emits: get, save, browse, etc */
var EventEmitter = require('events').EventEmitter;
/* util */
var fs = require('fs');
var uuid = require('node-uuid');
var jsdiff = require('diff');
var mime = require('mime');
/* store */
var mongoose = require('mongoose');
var gfs, Grid = require('gridfs-stream');
/* web */
var express = require('express');
var MongoStore = require('connect-mongo')(express);
var formidable = require('formidable');
/* queuing */
var kue = require('kue');
/* cms */
var auth = require('./auth');
var Meta = require('./meta');
var utils = require('./utils');
var models = require('./models');
var logger = utils.get_logger('cms');

exports = module.exports = Cms;

function Cms() {
  this.module = null;
  this.connection = null;
  this.meta = null;
  this.workflow_info = null;
  this.config = null;
  this.client = null;
  this.gfs = null;
  this.app = null;
}

Cms.prototype.__proto__ = EventEmitter.prototype;


Cms.prototype.init = function (module) {
  logger.info('current cms 0.0.2');

  var self = this;

  self.module = module;

  self.connection = mongoose.createConnection(module.config.mongoConnectString);
  self.connection.on('error', function (e) {
    console.error(e);
  });

  self.meta = new Meta(module.models.models, self.connection);
  self.auth = new auth.Auth(self.meta.User, '/cms');

  if (module.workflow)
    self.workflow_info = module.workflow.workflow;

  if (module.config)
    self.config = module.config;

  if (self.config.kueConfig) {
    self.jobs = kue.createQueue(self.config.kueConfig);
    self.jobs.on('job complete', self.job_complete.bind(self));
    logger.info('initialed process queue')
  }

  switch (self.config.storage) {
    case "pkgcloud":
      self.client = require('pkgcloud').storage.createClient(self.config.pkgcloudConfig);
      logger.info('created pkgcloud storage client');
      break
//    case "cloudinary":
//      cloudinary = require('cloudinary');
//      cloudinary.config(config.cloudinaryConfig);
//      logger.info('initialized cloudinary api');
//      break
    case "gfs":
    default:
      self.gfs = new Grid(self.connection.db, mongoose.mongo);
      logger.info('initialized gfs storage');
      break;
  }

  var app = self.app = express();
  app.set('view engine', 'ejs');
  app.set('views', __dirname + '/views');

  app.use(express.cookieParser());
  app.use(express.session({
    secret: self.config.sessionSecret,
    store: new MongoStore({db: self.connection.db})
  }));
  app.use(express.urlencoded());
  app.use(express.json());
  app.use(express.methodOverride());
  app.use(express.static(__dirname + '/public'));

  app.configure('development', function () {
    app.use(express.logger('dev'));
    app.use(express.errorHandler());
  });


  // move session message to request locals
  // put user in request locals
  app.use(function (req, res, next) {
    res.locals.message = req.session.message;
    delete req.session.message;
    res.locals.user = req.session.user;
    res.user = req.session.user;
    res.locals.containerHttp = self.config.containerHttp;
    next();
  });
  app.get('/login', self.auth.login_get.bind(self.auth));
  app.post('/login', self.auth.login_post.bind(self.auth));
  app.all('/logout', self.auth.logout.bind(self.auth));
  //app.get('/profile', p1, auth.form.get);
  //app.post('/profile', p1, auth.form.post);
  //app.get('/register', auth.register.get);
  //app.post('/register', auth.register.post);
  //app.all ('/users', [utils.has_user, utils.is_admin], user.list);
  //app.get ('/user/:user_id', [utils.has_user, user.load, user.is_user], user.display);
  //app.get ('/user/:user_id/edit', [utils.has_user, user.load, user.is_user], user.form.get);
  //app.post('/user/:user_id/edit', [utils.has_user, user.load, user.is_user], user.form.post);

  var p1 = [auth.has_user];
  var p2 = [auth.has_user, self.add_meta.bind(self)];
  var p3 = [auth.has_user, self.add_meta.bind(self), self.add_object.bind(self)];
  app.all('/cms', p2, self.show_dashboard.bind(self));
  app.all('/cms/logs', p2, self.logs_for_user.bind(self));
  app.all('/cms/logs/:type/:id', p2, self.logs_for_record.bind(self));
  app.get('/cms/browse/:type', p2, self.browse_get.bind(self));
  app.post('/cms/browse/:type', p2, self.browse_post.bind(self));
  app.post('/cms/schema/:type', p2, self.browse_schema.bind(self));
  app.get('/cms/create/:type', p2, self.form_get.bind(self));
  app.post('/cms/create/:type', p2, self.form_post.bind(self));
  app.get('/cms/update/:type/:id', p2, self.form_get.bind(self));
  app.post('/cms/update/:type/:id', p3, self.form_post.bind(self));
  app.get('/cms/get/:type', p2, self.form_get_json.bind(self));
  app.get('/cms/get/:type/:id', p3, self.form_get_json.bind(self));
  app.post('/cms/delete_references/:type/:id', p3, self.form_delete_references.bind(self));
  app.post('/cms/delete/:type/:id', p3, self.form_delete.bind(self));
  app.post('/cms/status/:type/:id', p3, self.form_status.bind(self));
  app.post('/cms/upload', p1, self.upload.bind(self));
  app.get('/cms/download/:id', p1, self.download.bind(self));
  app.get('/cms/delete_resource/:id', p1, self.delete_resource.bind(self));

  return app;
}


/* put the meta info in every request */

Cms.prototype.add_meta = function (req, res, next) {
  req.models = res.locals.models = this.meta.meta();
  var type = req.params.type;
  if (type) {
    req.type = type;
    req.schema = this.meta.schema(type);
    req.model = this.meta.model(type);
    req.browser = this.meta.browse(type);
    req.form = this.meta.form(type);
  }
  if (this.workflow_info) {
    var group = req.session.user.group;
    if (req.session.user.admin)
      group = this.workflow_info.groups.admin;
    req.workflow = res.locals.workflow = {states: this.workflow_info.states, transitions: this.workflow_info.groups[group].transitions};
  }
  else {
    req.workflow = res.locals.workflow = null;
  }
  next();
};

/* find and populate a "deep" view of the model as well as all "related" entities */
Cms.prototype.add_object = function (req, res, next) {
  var meta = this.meta;
  if (!req.params.id) {
    next();
    return;
  }
  meta.expand(req.type, req.params.id, function (err, m) {
    if (err) {
      next(err);
      return;
    }
    req.object = m;
    if (m)
      meta.related(req.type, m._id, function (r) {
        req.related = r;
        req.related_count = r._count;
        delete r._count;
        next();
      });
    else
      next();
  });
};


Cms.prototype.show_dashboard = function (req, res) {
  res.render('cms/dashboard', {
    title: 'CMS Dashboard ',
    models: req.models
  });
};


Cms.prototype.logs_for_user = function (req, res) {
  this.get_logs({user: req.session.user._id}, {sort: '-time'}, function (logs) {
    res.json(logs);
  });
};


Cms.prototype.logs_for_record = function (req, res) {
  this.get_logs({type: req.params.type, id: req.params.id }, {sort: '-time'}, function (logs) {
    res.json(logs);
  });
};

// browse

Cms.prototype.browse_get = function (req, res) {
  var conditions = process_conditions(req.body.condition);
  req.model.count(conditions, function (err, count) {
    res.render('cms/browse', {
      title: 'CMS Dashboard ',
      browser: req.browser,
      type: req.type,
      total: count
    });
  });
};


Cms.prototype.browse_post = function (req, res) {
  var meta = this.meta;
  var conditions = process_conditions(req.body.condition);
  var fields = null;
  var options = {sort: req.body.order, skip: req.body.offset, limit: req.body.limit};
  req.model.count(conditions, function (err, count) {
    var q = req.model.find(conditions, fields, options);
    var refs = meta.get_references(req.schema);
    if (refs)
      q.populate(meta.get_names(refs).join(" "));
    q.exec(function (err, r) {
      res.json({results: r, count: count});
    });
  });
};


Cms.prototype.browse_schema = function (req, res) {
  res.json({schema: this.meta.get_schema_info(req.schema), browser: req.browser});
};


process_conditions = function (o) {
  var c = {};
  for (var p in o) {
    var op = o[p];
    if (op.condition.charAt(0) == '$') {
      c[p] = {};
      c[p][op.condition] = op.value;
      if (op.condition == '$regex') {
        c[p]['$options'] = 'i';
      }
    }
    else if (op.condition == '=') {
      c[p] = op.value;
    }
  }
  return c;
};

// form (create/update)

Cms.prototype.form_get = function (req, res) {
  res.render('cms/form', {
    title: (req.object ? 'Editing' : 'Creating') + ' ' + req.type,
    ancestors: [
      {url: '/cms/browse/' + req.type, name: req.type}
    ],
    type: req.type,
    id: req.id ? req.id : null,
    form: req.form});
};


Cms.prototype.form_get_json = function (req, res) {
  var related = {};
  for (var p in req.related) {
    related[p] = req.related[p].results;
  }
  res.json({
    title: (req.object ? 'Editing' : 'Creating') + ' ' + req.type,
    type: req.type,
    object: req.object || new req.model(),
    related: related,
    form: req.form})
};


Cms.prototype.form_post = function (req, res, next) {
  var self = this;
  var meta = self.meta;
  var object = req.object || new req.model();
  var data = JSON.parse(req.body.val);
  var schema_info = meta.get_schema_info(req.schema);
  // set values and get info about differences
  var info = utils.set_values(req.form, schema_info, data, object);
  // set the creator (if unset)
  if (!object.creator)
    object.creator = req.session.user._id;
  // set the default state (if unset)
  if (!object.state && self.workflow_info && self.workflow_info.states)
    object.state = self.workflow_info.states[0].code;

  self.emit('pre save', object);
  object.save(function (err, s) {
    self.add_log(req.session.user._id, 'save', req.type, s, info, function () {
      meta.expand(req.type, s._id, function (err, s) {
        if (err)
          next(err);
        else
          res.json(s);
      });
    });
  });
};


Cms.prototype.form_delete_references = function (req, res) {
  var self = this;
  if (req.related_count == 0)
    res.json({});
  else {
    var to_update = [];
    for (var p in req.related) {
      if (req.related[p].results.length == 0)
        continue;
      var f = req.related[p].field;
      var o = {};
      o[f.name] = req.object._id;
      to_update.push({o: o, p: p});
    }
    var info = [];
    utils.forEach(to_update, function (e, n) {
      self.meta.model(e.p).update(e.o, {$pull: e.o}, { multi: true }, function (err, x) {
        info.push('Removed ' + x + ' reference(s) from ' + e.p + ".");
        n();
      });
    }, function () {
      self.add_log(req.session.user._id, 'remove references', req.type, req.object, {messages: info}, function () {
        res.json(info);
      });
    })
  }
};


Cms.prototype.form_delete = function (req, res) {
  req.object.remove(function (err, m) {
    res.json(m);
  });
};


Cms.prototype.form_status = function (req, res) {
  var self = this;
  var original_state = req.object.state;
  req.object.state = req.body.state;
  req.object.save(function (err, m) {
    self.add_log(req.session.user._id, 'change status', req.type, m,
      {message: 'From ' + original_state + 'to ' + req.object.state, reason: req.param.reason}, function (info) {
        // todo find open related requests - notify requestors & close requests
        res.json(info);
      });
  });
};

// logs


Cms.prototype.get_logs = function (query, options, complete) {
  var meta = this.meta;
  var Log = meta.Log;
  var q = Log.find(query, null, options);
  q.populate('user', 'name email');
  q.exec(function (err, logs) {
    utils.forEach(logs, function (log, n) {
      meta.model(log.type).findOne({_id: log.id}, function (err, l) {
        if (!log.info)
          log.info = {};
        log.info.object = l;
        n();
      });
    }, function () {
      complete(logs);
    });
  });
}


Cms.prototype.add_log = function (user_id, action, type, instance, info, callback) {
  var Log = this.meta.Log;
  var log = new Log({
      user: user_id,
      action: action,
      type: type,
      id: instance._id,
      info: info
    }
  );
  log.save(function (err, l) {
    callback(l);
  });
}


//  resource handling


Cms.prototype.save_resource = function (name, path, mimetype, size, creator_id, info, next) {
  var self = this;
  var meta = self.meta;
  var r = new meta.Resource();
  r.name = name;
  r.mime = mimetype ? mimetype : mime.lookup(name);
  r.path = path;
  r.size = size;
  r.creator = creator_id;
  r.meta = info ? info : {};
  self.emit('resource pre save');
  r.save(function (err, s) {
    if (err) throw err;
    self.emit('resource post save');
    var resource_jobs = meta.meta().Resource.jobs;
    if (resource_jobs) {
      if (!self.jobs) {
        logger.warn('there is no available job kue... not executing ' + resource_jobs);
        return;
      }
      var type = r.mime.split('/')[0];
      if (resource_jobs[r.mime])
        resource_jobs = resource_jobs[r.mime];
      else
        resource_jobs = resource_jobs[type];
      for (var i = 0; i < resource_jobs.length; i++) {
        var process = resource_jobs[i];
        var job_name = type + ' ' + process;
        console.log("job create", job_name);
        self.jobs.create(job_name, {
          container: self.config.container,
          filename: path,
          parent: r._id,
          creator: creator_id}).save();
      }
    }
    next(s);
  });
  return r;
}

Cms.prototype.job_complete = function (id) {
  var meta = this.meta;
  logger.info('job complete', id);
  kue.Job.get(id, function (err, job) {
    job.get('path', function (err, p) {
      job.get('size', function (err, s) {
        logger.info('  params', p, s);
        meta.Resource.findOne({_id: job.data.parent}, null, function (err, r) {
          if (err) throw err;
          var pr = {};
          pr.mime = p ? mime.lookup(p) : null;
          pr.path = p;
          pr.size = s;
          pr.meta = {generated: true, job_name: job.type};
          if (err) throw err;
          meta.Resource.update({_id: job.data.parent}, {$push: {children: pr}}, function (err, r) {
            if (err) throw err;
            logger.info('removing job');
            job.remove();
          });
        });
      });
    });
  });
};

client_upload_params = function (config, path) {
  return {container: config.container,
    remote: path,
    headers: {
      'content-disposition': mime.lookup(path)
    }}
};

Cms.prototype.upload = function (req, res) {
  var self = this;
  var form = new formidable.IncomingForm();
  form.onPart = function (part) {
    if (!part.filename) {
      form.handlePart(part);
      return;
    }
    var path = uuid.v4() + '/' + part.filename;
    self.write(part, path, function (meta) {
      self.save_resource(part.filename, path, part.mime, form.bytesReceived, req.session.user._id, meta, function (s) {
        res.json(s);
      });
    });
  }
  form.parse(req, function () {
  });
};


Cms.prototype.write = function (stream, path, next) {
  var self = this;
  //stream.on('error', function (e) {
  //  next(e);
  //});
  switch (self.config.storage) {
    case "file":
      new Error('unimplemented');
      break;
    case "pkgcloud":
      stream.pipe(self.client.upload(client_upload_params(self.config, path), next));
      break;
//    case "cloudinary":
//      // untested
//      var cloudStream = cloudinary.uploader.upload_stream(next);
//      stream.on('data', cloudStream.write).on('end', cloudStream.end);
//      break;
    case "gfs":
      var ws = self.gfs.createWriteStream({ filename: path });
      stream.pipe(ws);
      stream.on('end', next);
      //ws.on('error', function (e) {
      //  next(e);
      //});
      break;
  }
}


Cms.prototype.delete_resource = function (req, res) {
  var self = this;
  var Resource = self.meta.Resource;
  var q = Resource.findOne({_id: req.params.id});
  q.exec(function (err, r) {
    if (err) throw err;
    if (r) {
      switch (config.storage) {
        case "pkgcloud":
          self.client.removeFile(config.container, r.path, function (err) {
            if (err) logger.error(err);
            r.remove(function (err, r) {
              if (err) throw err;
              logger.info('resource ' + JSON.stringify(r) + ' deleted')
              res.json({message: 'Resource deleted'});
            });
          });
          break
//        case "cloudinary":
//          cloudinary.uploader.destroy(r.meta.public_id, function (result) {
//            res.json(result);
//          });
//          break
        case "gfs":
        default:
          break;
      }
    }
    else {
      res.send('ERR');
    }
  });
};


Cms.prototype.download = function (req, res) {
  var self = this;
  var Resource = self.meta.Resource;
  var q = Resource.findOne({_id: req.params.id});
  q.exec(function (err, r) {
    if (r) {
      switch (self.config.storage) {
        case "pkgcloud":
          break
//        case "cloudinary":
//          break
        case "gfs":
        default:
          res.setHeader('Content-Type', r.mime + (r.charset ? '; charset=' + r.charset : ''));
          res.setHeader('Content-Disposition', 'attachment; filename=' + r.path);
          gfs
            .createReadStream({ _id: r._id })
            .pipe(res);
          break;
      }
    }
    else {
      res.send('ERR');
    }
  });
};
