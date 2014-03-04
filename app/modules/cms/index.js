var fs = require('fs');
var mongoose = require('mongoose');
var gfs = null, Grid = require('gridfs-stream');
var cloudinary = require('cloudinary');
var meta = require('./meta');
var utils = require('./utils');
var use_gfs = false;

Grid.mongo = mongoose.mongo;

exports.init = function (config, resource_class_name, user_class_name) {
  gfs = new Grid(mongoose.connection.db, mongoose.mongo);
  console.log('current13 0.0.0');
  meta.init(config, resource_class_name, user_class_name);
}

exports.meta = meta;
exports.utils = utils;



/* put the meta info in every request */

exports.add_meta = function (req, res, next) {
  req.models = res.locals.models = meta.meta();
  var type = req.params.type;
  if (type)
  {
    req.type = type;
    req.schema = meta.schema(type);
    req.virtuals = meta.virtuals(type);
    req.model = meta.model(type);
    req.browser = meta.browse(type);
    req.form = meta.form(type);
  }
  next();
};

/* if an id was specified, find and populate a view of the model, with thumbnail references */
exports.add_object = function (req, res, next) {
  expand(req.schema, req.model, req.params.id, function (err, m) {
    if (err) {
      next(err);
      return;
    }
    req.object = m;
    if (m)
      related(req.type, m._id, function(r){
        req.related = r;
        next();
      });
    else
      next();
  });
};


expand = function(schema, model, id, next)
{
  var q = model.findOne({_id: id});
  var refs = meta.get_references(schema);
  if (refs)

    q.populate(meta.get_names(refs).join(" "));
  q.exec(function (err, m) {
    next(err, m);
  });
};

related = function (type, id, next) {
  var related = [];
  for (var p in meta.meta()) {
    var refs = meta.get_references(meta.schema(p));
    for (var i = 0; i < refs.length; i++) {
      if (refs[i].ref == type) {
        related.push({type: p, field: refs[i]});
      }
    }
  }
  var r = {};
  if (related) {
    utils.process_list(related, function (ref, n) {
      var c = {};
      c[ref.field.name] = {$in: [id]}
      console.log(ref.type, c);
      var q = meta.model(ref.type).find(c);
      q.exec(function (err, qr) {
        r[ref.type] = qr;
        n();
      });
    }, function () {
      next(r);
    });
  }
  else
    next(r);
};

// virtuals?
//      if (req.virtuals)
//      {
//        var keys = Object.keys(req.virtuals);
//        req.related = {};
//        utils.process_list(keys, function (e, n) {
//          var q = m[e];
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


exports.browse = {
  get: function (req, res, next) {
    var conditions = req.body.condition;
    req.model.count(conditions, function (err, count) {
      if (err){
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
    var conditions = req.body.condition;
    var fields = null;
    var options = {sort: req.body.order, skip: req.body.offset, limit: req.body.limit};
    req.model.count(conditions, function (err, count) {
      if (err){
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
  }
};

exports.schema = function (req, res, next) {
  res.json({schema: meta.get_schema_info(req.schema), browser: req.browser});
};


exports.form =
{
  get: function (req, res) {
    res.render('cms/form', {
      title: (req.object ? 'Editing' : 'Creating') + ' ' + req.type,
      ancestors: [{url:'/cms/browse/'+req.type, name:req.type}],
      type: req.type,
      id: req.id ? req.id : null,
      form: req.form});
  },

  get_json: function(req,res) {
    res.json({
      title: (req.object ? 'Editing' : 'Creating') + ' ' + req.type,
      type: req.type,
      object: req.object || new req.model(),
      related: req.related,
      form: req.form})
  },

  post: function (req, res, next) {
    var s = req.object || new req.model();
    var data = JSON.parse(req.body.val);
    for (var p in data) {
      s[p] = data[p];
    }
    s.creator = req.session.user._id;
    if (req.model == meta.Resource && s.meta)
    {
      console.log("REES");
    }
    s.save(function (err, s) {
      if (err)
        res.json(err);
      else {
        expand(req.schema, req.model, req.params.id, function (err, m) {
          if (err)
            next(err);
          else
            res.json(m ? m : s);
        });
      }
    });
  }
};


// image and resource handling


exports.get_preview_url = function(e)
{
  return cloudinary.url(e.public_id + ".jpg", { width: 200, height: 150 });
};


exports.upload = function (req, res) {
  var file = req.files.file;
  var do_save = function (e) {
    // create a resource with path & return id
    var r = new meta.Resource();
    r.path = file.name;
    r.size = file.size;
    r.creator = req.session.user._id;
    r.meta = e;
    if (e)
      r.meta.thumb = exports.get_preview_url(e);
    r.save(function (err, s) {
      res.json(s);
    });
  };
  if (use_gfs) {
    save_gfs(file, do_save);
  }
  else {
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
        console.log(result);
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
  var q = Resource.findOne({_id: req.params.id});
  q.exec(function (err, r) {
    if (r) {
      gfs
        .createReadStream({ filename: "/thumb" + r.path })
        .pipe(res);
    }
    else {
      res.send('ERR');
    }
  });
};


function save_gfs(file, next)
{
    var ws = gfs.createWriteStream({ filename: file.path });
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


