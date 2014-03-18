var fs = require('fs');
var jsdiff = require('diff');
var mime = require('mime');
var uuid = require('node-uuid');
var mongoose = require('mongoose');
var gfs = null, Grid = require('gridfs-stream');
var kue;
var jobs;
var cloudinary;


var auth = require('../auth');
var meta = require('./meta');
var utils = require('./utils');
var models = require('./models');

var workflow_info = null;
var config = null;
var client = null;
exports.init = function (app, p) {
  console.log('current13 0.0.0');
  gfs = new Grid(mongoose.connection.db, mongoose.mongo);
  meta.init(p.models.models);
  if (p.workflow)
    workflow_info = p.workflow.workflow;
  if (p.config)
    config = p.config;

  if (!app)
    return;

  if (config.kueConfig) {
    kue = require('kue');
    jobs = kue.createQueue(config.kueConfig);
    jobs.on('job complete', upload_job_complete);
    console.log('initialed process queue')
  }

  if (config.usePkgcloud) {
    client = require('pkgcloud').storage.createClient(config.pkgcloudConfig);
    console.log('created pkgcloud storage client')
  }

  if (config.cloudinaryConfig) {
    cloudinary = require('cloudinary');
    cloudinary.config(config.cloudinaryConfig);
    console.log('initialized cloudinary api');
  }

  // move session message to request locals
  // put user in request locals
  app.use(function (req, res, next) {
    res.locals.message = req.session.message;
    delete req.session.message;
    res.locals.user = req.session.user;
    res.user = req.session.user;
    next();
  });
  auth.on_login = '/cms';
  app.get('/login', auth.login.get);
  app.post('/login', auth.login.post);
  //app.get('/register', auth.register.get);
  //app.post('/register', auth.register.post);
  app.all('/logout', auth.logout);
  //app.all ('/users', [utils.has_user, utils.is_admin], user.list);
  //app.get ('/user/:user_id', [utils.has_user, user.load, user.is_user], user.display);
  //app.get ('/user/:user_id/edit', [utils.has_user, user.load, user.is_user], user.form.get);
  //app.post('/user/:user_id/edit', [utils.has_user, user.load, user.is_user], user.form.post);
  app.get('/profile', [auth.has_user], auth.form.get);
  app.post('/profile', [auth.has_user], auth.form.post);
  app.all('/cms', [auth.has_user, exports.add_meta], exports.show_dashboard);
  app.all('/cms/logs', [auth.has_user, exports.add_meta], exports.logs_for_user);
  app.all('/cms/logs/:type/:id', [auth.has_user, exports.add_meta], exports.logs_for_record);
  app.get('/cms/browse/:type', [auth.has_user, exports.add_meta], exports.browse.get);
  app.post('/cms/browse/:type', [auth.has_user, exports.add_meta], exports.browse.post);
  app.post('/cms/schema/:type', [auth.has_user, exports.add_meta], exports.browse.schema);
  app.get('/cms/create/:type', [auth.has_user, exports.add_meta], exports.form.get);
  app.post('/cms/create/:type', [auth.has_user, exports.add_meta], exports.form.post);
  app.get('/cms/update/:type/:id', [auth.has_user, exports.add_meta], exports.form.get);
  app.post('/cms/update/:type/:id', [auth.has_user, exports.add_meta, exports.add_object], exports.form.post);
  app.get('/cms/get/:type', [auth.has_user, exports.add_meta], exports.form.get_json);
  app.get('/cms/get/:type/:id', [auth.has_user, exports.add_meta, exports.add_object], exports.form.get_json);
  app.post('/cms/delete_references/:type/:id', [auth.has_user, exports.add_meta, exports.add_object], exports.form.delete_references);
  app.post('/cms/delete/:type/:id', [auth.has_user, exports.add_meta, exports.add_object], exports.form.delete);
  app.post('/cms/status/:type/:id', [auth.has_user, exports.add_meta, exports.add_object], exports.form.status);
  app.post('/cms/upload', [auth.has_user], exports.upload);
  app.get('/cms/download/:id', [auth.has_user], exports.download);
  app.get('/cms/delete_resource/:id', [auth.has_user], exports.delete_resource);
}

exports.meta = meta;
exports.utils = utils;
exports.models = models;


/* put the meta info in every request */

exports.add_meta = function (req, res, next) {
  req.models = res.locals.models = meta.meta();
  var type = req.params.type;
  if (type) {
    req.type = type;
    req.schema = meta.schema(type);
    req.model = meta.model(type);
    req.browser = meta.browse(type);
    req.form = meta.form(type);
  }
  if (workflow_info) {
    var group = req.session.user.group;
    if (req.session.user.admin)
      group = workflow_info.groups.admin;
    req.workflow = res.locals.workflow = {states: workflow_info.states, transitions: workflow_info.groups[group].transitions};
  }
  else {
    req.workflow = res.locals.workflow = null;
  }
  next();
};

/* find and populate a "deep" view of the model as well as all "related" entities */
exports.add_object = function (req, res, next) {
  if (!req.params.id) {
    next();
    return;
  }
  expand(req.type, req.params.id, function (err, m) {
    if (err) {
      next(err);
      return;
    }
    req.object = m;
    if (m)
      related(req.type, m._id, function (r) {
        req.related = r;
        req.related_count = r._count;
        delete r._count;
        next();
      });
    else
      next();
  });
};


expand = function (type, id, next) {
  var q = meta.model(type).findOne({_id: id});
  q.exec(function (err, m) {
    populate_deep(type, m, function () {
      next(err, m);
    });
  });
};


populate_deep = function (type, instance, next, seen) {
  if (type == 'User' || !instance) {
    next();
    return;
  }
  if (!seen)
    seen = {};
  if (seen[instance._id]) {
    next();
    return;
  }
  seen[instance._id] = true;
  var refs = meta.get_references(meta.schema(type));
  if (!refs) {
    next();
    return;
  }
  var opts = [];
  for (var i = 0; i < refs.length; i++)
    opts.push({path: refs[i].name, model: refs[i].ref});
  meta.model(type).populate(instance, opts, function (err, o) {
    utils.forEach(refs, function (r, n) {
      if (r.is_array)
        utils.forEach(o[r.name], function (v, nn) {
          populate_deep(r.ref, v, nn, seen);
        }, n);
      else
        populate_deep(r.ref, o[r.name], n, seen);
    }, next);
  });
}


related = function (type, id, next) {
  var related_refs = [];
  for (var p in meta.meta()) {
    var refs = meta.get_references(meta.schema(p));
    for (var i = 0; i < refs.length; i++) {
      if (refs[i].ref == type) {
        related_refs.push({type: p, field: refs[i]});
      }
    }
  }
  var related_records = { _count: 0 };
  if (related_refs) {
    utils.forEach(related_refs, function (ref, n) {
      var c = {};
      c[ref.field.name] = {$in: [id]}
      var q = meta.model(ref.type).find(c);
      q.exec(function (err, qr) {
        related_records._count += qr.length;
        related_records[ref.type] = {field: ref.field, results: qr, query: q};
        n();
      });
    }, function () {
      next(related_records);
    });
  }
  else
    next(related_records);
};


// queries? piping results?
//      if (req.queries)
//      {
//        var keys = Object.keys(req.queries);
//        req.related = {};
//        utils.forEach(keys, function (e, n) {
//          var q = m[e](piped);
//          q.exec(function (err, r) {
//            req.related[e] = r;
//            n();
//          });
//        }, next);
//      }
//      else
//        next();


// the 'views'

exports.show_dashboard = function (req, res, next) {
  res.render('cms/dashboard', {
    title: 'CMS Dashboard ',
    models: req.models
  });
};


exports.logs_for_user = function (req, res, next) {
  get_logs({user: req.session.user._id}, {sort: '-time'}, function (logs) {
    res.json(logs);
  });
};

exports.logs_for_record = function (req, res, next) {
  get_logs({type: req.params.type, id: req.params.id }, {sort: '-time'}, function (logs) {
    res.json(logs);
  });
}


exports.browse = {

  get: function (req, res, next) {
    var conditions = req.body.condition;
    req.model.count(conditions, function (err, count) {
      if (err) {
        next(err);
        return;
      }
      res.render('cms/browse', {
        title: 'CMS Dashboard ',
        browser: req.browser,
        type: req.type,
        total: count
      });
    });
  },

  post: function (req, res, next) {
    var conditions = process_conditions(req.body.condition);
    var fields = null;
    var options = {sort: req.body.order, skip: req.body.offset, limit: req.body.limit};
    req.model.count(conditions, function (err, count) {
      if (err) {
        next(err);
        return;
      }
      var q = req.model.find(conditions, fields, options);
      var refs = meta.get_references(req.schema);
      if (refs)
        q.populate(meta.get_names(refs).join(" "));
      q.exec(function (err, r) {
        if (err)
          next(err);
        else
          res.json({results: r, count: count});
      });
    });
  },

  schema: function (req, res, next) {
    res.json({schema: meta.get_schema_info(req.schema), browser: req.browser});
  }
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
}


exports.form =
{
  get: function (req, res) {
    res.render('cms/form', {
      title: (req.object ? 'Editing' : 'Creating') + ' ' + req.type,
      ancestors: [
        {url: '/cms/browse/' + req.type, name: req.type}
      ],
      type: req.type,
      id: req.id ? req.id : null,
      form: req.form});
  },

  get_json: function (req, res) {
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
  },

  post: function (req, res, next) {
    var s = req.object || new req.model();
    var data = JSON.parse(req.body.val);
    var info = { diffs: {} };
    var schema_info = meta.get_schema_info(req.schema);
    for (var i = 0; i < req.form.length; i++) {
      var f = req.form[i].name;
      if (!f)
        continue;
      var field_info = schema_info[f];
      var field_val = s[f];
      var match = false;
      if (field_info.type == 'Reference') {
        field_val = field_info.is_array ? just_ids(field_val) : just_id(field_val);
        match = compare(field_val, data[f])
      }
      else
        match = (data[f] == field_val) || (data[f] == '' && field_val == null);
      if (!match) {
        if (f != 'modified')//or other auto date fields...!
          info.diffs[f] = jsdiff.diffChars(field_val, data[f]);
        s[f] = data[f];
      }
    }
    if (!s.creator)
      s.creator = req.session.user._id;
    if (!s.state && workflow_info && workflow_info.states)
      s.state = workflow_info.states[0].code;

    //emit('presave',s)
    s.save(function (err, s) {
      if (err) {
        res.json(err);
      }
      else {
        add_log(req.session.user._id, 'save', req.type, s, info, function () {
          expand(req.type, s._id, function (err, s) {
            if (err)
              next(err);
            else
              res.json(s);
          });
        });
      }
    });
  },

  delete_references: function (req, res, next) {
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
        meta.model(e.p).update(e.o, {$pull: e.o}, { multi: true }, function (err, x) {
          info.push('Removed ' + x + ' reference(s) from ' + e.p + ".");
          n();
        });
      }, function () {
        add_log(req.session.user._id, 'remove references', req.type, req.object, {messages: info}, function () {
          res.json(info);
        });
      })
    }
  },

  delete: function (req, res, next) {
    req.object.remove(function (err, m) {
      res.json(m);
    });
  },

  status: function (req, res, next) {
    var original_state = req.object.state;
    req.object.state = req.body.state;
    req.object.save(function (err, m) {
      add_log(req.session.user._id, 'change status', req.type, m,
        {message: 'From ' + original_state + 'to ' + req.object.state, reason: req.param.reason}, function (info) {
          // todo find open related requests - notify requestors & close requests
          res.json(info);
        });
    });
  }
};

// logs


get_logs = function (query, options, complete) {
  var q = models.Log.find(query, null, options);
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


add_log = function (user_id, action, type, instance, info, callback) {
  var log = new models.Log({
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

// utils

just_ids = function (a) {
  var r = [];
  for (var i = 0; i < a.length; i++)
    if (a[i])
      r.push(just_id(a[i]));
  return r;
}


just_id = function (a) {
  if (a && a._id)
    return String(a._id);
  else
    return a;
}

function compare(a, b) {
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

// image and resource handling




exports.save_resource = function (name, path, size, creator_id, info, complete) {
  var r = new meta.Resource();
  r.mime = mime.lookup(name);
  r.path = path;
  r.name = name;
  r.size = size;
  r.creator = creator_id;
  r.meta = info ? info : {};
  if (info && config.cloudinaryConfig)
    r.meta.thumb = cloudinary.url(e.public_id + ".jpg", { width: 300, height: 200, crop: 'fit'});
  r.save(function (err, s) {
    complete(s); // but dont return
    // if pkgcloud
    var processes = meta.meta().Resource.process;
    if (processes) {
      var type = r.mime.split('/')[0];
      if (processes[r.mime])
        processes = processes[r.mime];
      else
        processes = processes[type];
      for (var i=0; i<processes.length; i++) {
        var process = processes[i];
        var job_name = type + ' ' + process;
        console.log("job create", job_name);
        jobs.create(job_name, {
          container: config.container,
          filename: path,
          parent: r._id,
          creator: creator_id}).save();
      }
    }
  });
  return r;
}

upload_job_complete = function(id) {
  console.log('job complete', id);
  kue.Job.get(id, function(err, job) {
    job.get('path', function (err, p) {
      job.get('size', function (err, s) {
        console.log('  params', p, s);
        meta.Resource.findOne({_id: job.data.parent}, null, function (err, r) {
          if (err) throw err;
          var pr = new meta.Resource();
          pr.parent = r;
          pr.mime = p ? mime.lookup(p) : null;
          pr.path = p;
          pr.size = s;
          pr.creator = job.data.creator;
          pr.meta = {generated: true, job_name: job.name};
          pr.save(function (err, ps) {
            if (err) throw err;
            console.log('removing job');
            job.remove();
          });
        });
      });
    });
  });
};


exports.upload = function (req, res) {
  var file = req.files.file;
  var filemime = mime.lookup(file.name);
  var path = uuid.v4() + file.name;
  var do_save = function (e) {
    exports.save_resource(file.name, path, file.size, req.session.user._id, e, function (s) {
      console.log(s);
      res.json(s);
    });
  };
  if (config.usePkgcloud) {
    var imageStream = fs.createReadStream(file.path);
    imageStream.pipe(client.upload({
      container: config.container,
      remote: path,
      headers: {
        'content-disposition': filemime
      }
    }, function (err, result) {
      console.log(err, result)
      do_save(result);
    }));
  }
  else if (config.useGfs) {
    save_gfs(r._id, file, do_save);
  }
  else if (config.cloudinaryConfig) {
    var imageStream = fs.createReadStream(file.path, { encoding: 'binary' });
    var cloudStream = cloudinary.uploader.upload_stream(function (e) {
      do_save(e);
    });
    imageStream.on('data', cloudStream.write).on('end', cloudStream.end);
  }
};


exports.delete_resource = function (req, res) {
  var q = meta.Resource.findOne({_id: req.params.id});
  q.exec(function (err, r) {
    if (r) {
      cloudinary.uploader.destroy(r.meta.public_id, function (result) {
        res.json(result);
      });
    }
    else {
      res.send('ERR');
    }
  });
}


// for gfs
exports.download = function (req, res) {
  // TODO: set proper mime type + filename, handle errors, etc...
  var q = meta.Resource.findOne({_id: req.params.id});
  q.exec(function (err, r) {
    if (r) {
      if (config.usePkgcloud) {

      } else if (config.useGfs) {
        res.setHeader('Content-Type', r.mime + (r.charset ? '; charset=' + r.charset : ''));
        res.setHeader('Content-Disposition', 'attachment; filename=' + r.path);
        gfs
          .createReadStream({ _id: r._id })
          .pipe(res);
      }
    }
    else {
      res.send('ERR');
    }
  });
};


function save_gfs(id, file, next) {
  var ws = gfs.createWriteStream({ _id: id, filename: file.path });
  ws.on('error', function (e) {
    next(e);
  });
  var rs = fs.createReadStream(file.path);
  rs.on('open', function () {
    rs.pipe(ws);
  });
  rs.on('end', function () {
    next(null);
  });
  rs.on('error', function (e) {
    next(e);
  });

}


