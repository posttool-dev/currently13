var mongoose = require('mongoose');
var models = require('./models');
var utils = require('./utils');
exports = module.exports = Meta;

function Meta(info, connection)
{
  this.info = info;
  this.connection = connection;
  this._init();
}

Meta.prototype._init = function () {
  for (var p in this.info) {
    var schema_data = this.info[p].schema;
    validate_meta(p, schema_data, this.info[p].browse, this.info[p].form);
    var schema = new mongoose.Schema(schema_data);
    if (this.info[p].virtuals)
      for (var q in this.info[p].virtuals)
      {
        schema.virtual(q).get(this.info[p].virtuals[q]);
      }
    add_fields_and_methods(schema, p);
    this.info[p].schema = schema;
    this.info[p].model = this.connection.model(p, schema);
    if (!this.info[p].browse)
    {
      this.info[p].browse = create_browse_info(this.info, p);
      console.log('Added generated browse for '+p);
      console.log(this.info[p].browse);
    }
    if (!this.info[p].form)
    {
      this.info[p].form = create_form_info(this.info, p);
      console.log('Added generated form for '+p);
      console.log(this.info[p].form);
    }
  }
  this.Resource = this.model('Resource');
  this.Log = this.connection.model('Log', models.LogSchema);
  this.User = this.connection.model('User', models.UserSchema);
};

Meta.prototype.browse = function(type)
{
  if (!this.info[type])
    throw new Error('no '+type);
  return this.info[type].browse;
};

Meta.prototype.form = function(type)
{
  if (!this.info[type])
    throw new Error('no '+type);
  return this.info[type].form;
};

Meta.prototype.schema = function(type)
{
  if (!this.info[type])
    throw new Error('no '+type);
  return this.info[type].schema;
};

Meta.prototype.model = function(type)
{
  if (!this.info[type])
    throw new Error('no '+type);
  return this.connection.model(type);
};

Meta.prototype.info = function(type)
{
  if (!this.info[type])
    throw new Error('no '+type);
  return this.get_schema_info(this.info[type].schema);
}

Meta.prototype.meta = function(type)
{
  if (type)
    return this.info[type].meta;
  else
    return this.info;
}


extra_fields = {
  'creator': {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  'created': Date,
  'modified': Date,
  'state': Number
};
validate_meta = function (p, schema, browse, form) {
  if (browse)
    for (var i = 0; i < browse.length; i++)
      if (browse[i].name && !schema[browse[i].name] && !extra_fields[browse[i].name]) {
        console.log(schema);
        throw new Error(p + '.browse path error: ' + browse[i].name);
      }
  if (form)
    for (var i = 0; i < form.length; i++)
      if (form[i].name && !schema[form[i].name] && !extra_fields[form[i].name]) {
        console.log(schema);
        throw new Error(p + '.form path error: ' + form[i].name);
      }
}


/**
  manages schema
   - adds fields: creator, created, modified, state
   - adds getters: url, type
   - adds pre save to set times
 */
add_fields_and_methods = function (schema, name) {
  schema.add(extra_fields);
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

Meta.prototype.get_schema_info = function(schema)
{
  var d = {};
  schema.eachPath(function (path, mtype) {
    if (path.charAt(0)!='_')
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


/**
 *
 * @param schema
 * @param type - our normalized type string
 * @returns []
 */
get_by_type = function(schema, type) {
  var d = [];
  schema.eachPath(function (path, mtype) {
    var info = get_path_info(path, mtype);
    if (info.type == type)
      d.push(info);
  });
  return d;
};


Meta.prototype.get_references = function(schema) {
  return get_by_type(schema, 'Reference');
};


Meta.prototype.get_names = function (field_info) {
  if (!field_info)
    return [];
  else return field_info.map(function (elem) {
    return elem.name;
  });
};






/// default form/browser meta data

create_browse_info = function(meta, type)
{
  var si = meta.get_schema_info(meta.schema(type));
  var s = [];
  for (var p in si)
  {
      s.push({name: si[p].name, cell: "char", filters: ["$regex", "="], order: "asc,desc,default"})
  }
  return s;
}



create_form_info = function(meta, type)
{
  var si = meta.get_schema_info(meta.schema(type));
  var s = [];
  for (var p in si)
  {
    if (p == 'creator' || p == 'created' || p == 'modified' || p == 'state')
      continue;
    if (si[p].type == 'Reference')
      s.push({name: si[p].name, widget: "choose_create", options: {type: si[p].ref, array: si[p].is_array}});
    else
      s.push({name: si[p].name, widget: "input"});
  }
  return s;
}


/*

      {name: "title", widget: "input"},
      {name: "subtitle", widget: "input"},
      {name: "body", widget: "rich_text"},
      {name: "pages", widget: "choose_create", options: {type: "Page", array: true}}

 */



Meta.prototype.expand = function (type, id, next) {
  var self = this;
  var q = self.model(type).findOne({_id: id});
  q.exec(function (err, m) {
    populate_deep(self, type, m, function () {
      next(err, m);
    });
  });
};


populate_deep = function (meta, type, instance, next, seen) {
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
          populate_deep(meta, r.ref, v, nn, seen);
        }, n);
      else
        populate_deep(meta, r.ref, o[r.name], n, seen);
    }, next);
  });
};


Meta.prototype.related = function (type, id, next) {
  var self = this;
  var related_refs = [];
  for (var p in self.meta()) {
    var refs = self.get_references(self.schema(p));
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
      var q = self.model(ref.type).find(c);
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

