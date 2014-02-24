var uuid = require('node-uuid');
var fs = require('fs');
var mongoose = require('mongoose');
var gfs = null, Grid = require('gridfs-stream');
var cloudinary = require('cloudinary');
var use_gfs = false;

Grid.mongo = mongoose.mongo;


var Meta = null;
//var User = null;
var Resource = null;

/**
 holds on to meta info
 adds fields and methods to meta info
 */
exports.init = function (meta, resource_class_name, user_class_name) {
  gfs = new Grid(mongoose.connection.db, mongoose.mongo);
  Meta = meta;
  console.log('current13 0.0.0');
  for (var p in  meta) {
    console.log(p);
    var schema_data = meta[p].schema;
    var schema = mongoose.Schema(schema_data);
    add_fields_and_methods(schema, p);
    meta[p].schema = schema;
  }
  Resource = mongoose.model(resource_class_name, Meta[resource_class_name].schema);
//    User = mongoose.model(user_class_name, Meta[user_class_name].schema);
}

/**
  manages schema
   - adds fields: creator, created, modified, state
   - adds getters: url, type
   - adds pre save to set times
 */
add_fields_and_methods = function (schema, name) {
  schema.add({
    'creator': {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    'created': Date,
    'modified': Date,
    'state': Number
  });
  schema.virtual('url').get(function () {
    return name.toLowerCase() + '/' + this._id;
  });
  schema.virtual('type').get(function () {
    return name.toLowerCase() + '/' + this.uuid;
  });
  schema.pre('save', function (next) {
    this.modified = new Date();
    if (!this.created)
      this.created = new Date();
    next();
  });
}


// model meta helpers

get_schema_info = function(schema)
{
  var d = {};
  schema.eachPath(function (path, mtype) {
    d[path] = get_path_info(path, mtype);
  });
  return d;
}

/**
 * returns a simple summary of the mongoose schema info.
 * the "Reference" type is used throughout in a standardized way. TODO handle relationships between references.
 *
 * @param path the mongoose schema path
 * @param mtype the mongoose type (provided by ```schema.forEach(function(path,type)```)
 * @returns {{name: *, type: *, is_array: boolean}}
 */
get_path_info = function (path, mtype) {
  var is_array = false;
  var ftype = null;
  var stype = null;
  var ref = null;
  if (mtype.options.type) {
    is_array = Array.isArray(mtype.options.type);
    ftype = is_array ? mtype.options.type[0] : mtype.options;
  }
  if (ftype != null && ftype.ref) {
    ref = ftype.ref;
  }
  switch (ftype.type) {
    case String:
      stype = "String";
      break;
    case Number:
      stype = "Number";
      break;
    case Date:
      stype = "Date";
      break;
    case mongoose.Schema.Types.ObjectId:
      if (ref)
        stype = "Reference";
      else
        stype = "Id";
      break;
    default:
      stype = ftype.type;
      break;
  }
  var d = {
    name: path,
    type: stype,
    is_array: is_array
  };
  if (ref != null) {
    d.type = 'Reference';
    d.ref = ref;
  }
  return d;
};


get_by_type = function(schema, type) {
  var d = [];
  schema.eachPath(function (path, mtype) {
    var info = get_path_info(path, mtype);
    if (info.type == type)
      d.push(info);
  });
  return d;
};


get_references = function(schema) {
  return get_by_type(schema, 'Reference');
};


get_names = function (field_info) {
  if (!field_info)
    return [];
  else return field_info.map(function (elem) {
    return elem.name;
  });
};


add_previews = function(object, refs)
{
  if (!object)
    return;
  for (var i = 0; i < refs.length; i++) {
    if (refs[i].ref == 'Resource') {
      add_preview(object[refs[i].name]);
    }
  }
};


add_preview = function(r)
{
    if (r.meta)
    {
      r.meta.thumb = cloudinary.image(r.meta.public_id + ".jpg", { width: 100, height: 150, crop: "fill" });
    }
};


// setup chain

/* put the meta info in every request */

exports.a = function (req, res, next) {
  req.models = Meta;
  next();
};


/* if a type was specified, put all its meta info in the request */

exports.b = function (req, res, next) {
  var type = req.params.type;
  req.browser = Meta[type].browse;
  req.form = Meta[type].form;
  req.type = type;
  req.schema = Meta[type].schema;
  req.model = mongoose.model(type, Meta[type].schema);
  next();
};

/* if an id was specified, find and populate a view of the model, with thumbnail references */
exports.c = function (req, res, next) {
  var q = req.model.findOne({_id: req.params.id});
  var refs = get_references(req.schema);
  if (refs)
    q.populate(get_names(refs).join(" "));
  q.exec(function (err, m) {
    if (err) next(err);
    add_previews(m, refs);
    req.object = m;
    next();
  });
};


// the 'views'

exports.show_dashboard = function (req, res, next) {
  res.render('cms/dashboard', {
    title: 'CMS Dashboard ',
    models: req.models
  });
};

get_conditions = function (props) {
  try {
    var conditions = JSON.parse(props);
    // todo validate user conditions & join w/ limiting (like creator = you or other query)
    // add_conditions(req.object, req.session.user, conditions);
    return conditions;
  } catch (e) {
    return {};
  }
};

exports.browse = {
  get: function (req, res, next) {
    var conditions = get_conditions(req.body.conditions);
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
    var conditions = get_conditions(req.body.conditions);
    var fields = null;
    var options = {order: req.body.order, offset: req.body.offset, limit: req.body.limit};
    req.model.find(conditions, fields, options, function (err, r) {
      if (err)
        next(err);
      else
        res.json(r);
    });
  }
};

exports.schema = function (req, res, next) {
  res.json({schema: get_schema_info(req.schema), browser: req.browser});
};


exports.form =
{
  get: function (req, res) {
    res.render('cms/form', {
      title: (req.object ? 'Editing' : 'Creating') + ' ' + req.type,
      type: req.type,
      id: req.object ? req.object._id : null,
      object: req.object || new req.model(),
      form: req.form});
  },

  get_json: function(req,res) {
    res.json({
      title: (req.object ? 'Editing' : 'Creating') + ' ' + req.type,
      type: req.type,
      object: req.object || new req.model(),
      form: req.form})
  },

  post: function (req, res) {
    var s = req.object || new req.model();
    var data = JSON.parse(req.body.val);
    for (var p in data) {
      s[p] = data[p];
    }
    s.creator = req.session.user._id;
    s.save(function (err, s) {
      if (err)
        res.json(err);
      else
        res.json(s);
    });
  }
};


// image and resource handling


exports.upload = function (req, res) {
  var file = req.files.file;
  var do_save = function (e) {
    // create a resource with path & return id
    var r = new Resource();
    r.filename = file.name;
    r.path = file.path;
    r.size = file.size;
    r.creator = req.session.user._id;
    r.meta = e;
    r.save(function (err, s) {
      s.meta.thumb = cloudinary.image(e.public_id + "." + e.format, { width: 100, height: 150, crop: "fill" })
      res.json(s);
    });
  };
  if (use_gfs) {
    var ws = gfs.createWriteStream({ filename: file.path });
    ws.on('error', function (e) {
      res.send('ERR');
    });
    var rs = fs.createReadStream(file.path);
    rs.on('open', function () {
      rs.pipe(ws);
    });
    rs.on('end', function () {
      do_save(null);
    });
    rs.on('error', function (e) {
      res.send('ERR');
    });
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
  var q = Resource.findOne({_id: req.params.id});
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



