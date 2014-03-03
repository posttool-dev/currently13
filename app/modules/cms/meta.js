var mongoose = require('mongoose');






var Meta = null;

//var User = null;
var Resource = null;

/**
 holds on to meta info
 adds fields and methods to meta info
 */
exports.init = function (meta, resource_class_name, user_class_name) {
  Meta = meta;
  for (var p in  meta) {
    console.log(">", p);
    var schema_data = meta[p].schema;
    validate_meta(p, schema_data, meta[p].browse, meta[p].form);
    var schema = new mongoose.Schema(schema_data);
    if (meta[p].virtuals)
      for (var q in meta[p].virtuals)
      {
        schema.virtual(q).get(meta[p].virtuals[q]);
      }
    add_fields_and_methods(schema, p);
    meta[p].schema = schema;
    meta[p].model = mongoose.model(p, schema);
    if (!meta[p].browse)
    {
      meta[p].browse = create_browse_info(p);
      console.log('Added generated browse for '+p);
    }
    if (!meta[p].form)
    {
      meta[p].form = create_form_info(p);
      console.log('Added generated form for '+p);
    }
  }
  Resource = mongoose.model(resource_class_name, Meta[resource_class_name].schema);
  exports.Resource = Resource;
  // User = mongoose.model(user_class_name, Meta[user_class_name].schema);

};

exports.browse = function(type)
{
  if (!Meta[type])
    throw new Error('no '+type);
  return Meta[type].browse;
};

exports.form = function(type)
{
  if (!Meta[type])
    throw new Error('no '+type);
  return Meta[type].form;
};

exports.schema = function(type)
{
  if (!Meta[type])
    throw new Error('no such type '+type);
  return Meta[type].schema;
};

exports.virtuals = function(type)
{
  return Meta[type].virtuals;
};

exports.model = function(type)
{
  return mongoose.model(type);
};

exports.info = function(type)
{
  return exports.get_schema_info(Meta[type].schema);
}

exports.meta = function()
{
  return Meta;
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
      if (browse[i].name && !schema[browse[i].name] && !extra_fields[browse[i].name])
        throw new Error('No path ' + browse[i].name + ' in schema ' + p);
  if (form)
    for (var i = 0; i < form.length; i++)
      if (form[i].name && !schema[form[i].name] && !extra_fields[form[i].name])
        throw new Error('No path ' + form[i].name + ' in schema ' + p);
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
  mongoose.model(name, schema);
}


// model meta helpers

exports.get_schema_info = function(schema)
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


get_by_type = function(schema, type) {
  var d = [];
  schema.eachPath(function (path, mtype) {
    var info = get_path_info(path, mtype);
    if (info.type == type)
      d.push(info);
  });
  return d;
};


exports.get_references = function(schema) {
  return get_by_type(schema, 'Reference');
};


exports.get_names = function (field_info) {
  if (!field_info)
    return [];
  else return field_info.map(function (elem) {
    return elem.name;
  });
};






/// default form/browser meta data

create_browse_info = function(type)
{
  var si = exports.get_schema_info(Meta[type].schema);
  var s = [];
  for (var p in si)
  {
      s.push({name: si[p].name, cell: "char", filters: ["$regex", "equals"], order: "asc,desc,default"})
  }
  return s;
}



create_form_info = function(type)
{
  var si = exports.get_schema_info(Meta[type].schema);
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
