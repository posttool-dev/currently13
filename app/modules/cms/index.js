var mongoose = require('mongoose'),
    Grid = require('gridfs-stream'), gfs = null,
    fs = require('fs'),
    uuid = require('node-uuid'),
    utils = require('../utils');

Grid.mongo = mongoose.mongo;



var Meta = null;
//var User = null;
var Resource = null;

exports.init = function(meta, resource_class_name, user_class_name)
{
    gfs = new Grid(mongoose.connection, mongoose.mongo);
    Meta = meta;
    for (var p in  meta)
    {
        console.log(p);
        var schema_data = meta[p].schema;
        var schema = mongoose.Schema(schema_data);
        add_fields_and_methods(schema);
        meta[p].schema = schema;
//        var d = create_form_from_schema(schema);
//        console.log(d);
    }
    Resource = mongoose.model(resource_class_name, Meta[resource_class_name].schema);
//    User = mongoose.model(user_class_name, Meta[user_class_name].schema);
}




add_fields_and_methods = function(schema, user_ref)
{
    if (!user_ref)
        user_ref = 'User';
    schema.add({
        'creator': {type: mongoose.Schema.Types.ObjectId, ref: user_ref},
        'created': Date,
        'modified': Date,
//        'uuid': String,
        'state': Number
    });
    schema.method('url', function(){
        return this.modelName.toLowerCase() + '/' + this.uuid;
    });
    schema.pre('save', function (next) {
//        this.uuid = uuid.v1();
        this.modified = new Date();
        if (!this.created)
            this.created = new Date();
        next();
    });
}

create_form_from_schema = function(schema)
{
    var d = {};
    schema.eachPath(function(path, type){
        var is_array = false;
        var ftype = null;
        var stype = null;
        var ref = null;
        if (type.options.type)
        {
            is_array =  Array.isArray(type.options.type);
            ftype = is_array ? type.options.type[0] : type.options;
        }
        if (ftype != null && ftype.ref)
        {
            ref = ftype.ref;
        }
        switch (ftype.type)
        {
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
                    stype = "ObjectId";
                break;
        }
        d[path] = {type: stype, is_array: is_array};
        if (ref != null)
        {
            d[path]['type'] = 'Reference';
            d[path]['reference'] = ref;
        }
    });
    return d;
}


exports.show_dashboard = function(req, res, next)
{
  res.render('cms/dashboard', {
    title: 'CMS Dashboard ',
    models: req.models
  });
}


exports.browse = function(req, res, next)
{
  res.render('cms/browse', {
      title: 'CMS Dashboard ',
      browser: req.browser,
      model: req.params.type
  });
}


exports.a = function(req, res, next){
    req.models = Meta;
    next();
};

exports.b = function(req, res, next){
    req.browser = Meta[req.params.type]['browse'];
    req.form = Meta[req.params.type]['form'];
    next();
};

exports.c = function(req, res, next){
    req.browser = Meta[req.params.type]['browse'];
    req.form = Meta[req.params.type]['form'];
    var q = model.findOne({uuid: req.params.uuid});
    q.exec(function(err, m)
    {
        exports.process_err(err);
        req.object = m;
        next();
    });
};


exports.form =
{
    get: function(req, res)
    {
        var s = null;//req.obj || new req.model();
        res.render('cms/form', {title: 'Editing', object: s, form: req.form});
    },

    post: function(req, res)
    {
        var s = req.obj || new req.model();
        s.process(req.body);
        s.save(req.user, function(err,s) {
            utils.process_err(err);
            res.redirect(s.url());
        });
    }
};


exports.upload = function(req, res) {
    var tempfile    = req.files.file.path;
    var origname    = req.files.file.name;
    var writestream = gfs.createWriteStream({ filename: tempfile });
     writestream.on('open', function (d) {
      console.log("000", d);
    });
     writestream.on('progress', function (d) {
      console.log("111", d);
    });
    writestream.on('close', function (file) {
      // do something with `file`
      console.log("AAA", file.filename);
    });
   console.log(req.files.file);
    var rs = fs.createReadStream(tempfile);
    rs.on('open', function(){
        console.log("PIPING")
        rs.pipe(writestream);
    });
    rs.on('end', function()
    {
        console.log("HERE")
        // create a resource with path & return id
        var r = new Resource();
        r.path = origname;
        r.creator = req.session.user._id;
        r.save(function(err,s) {
            utils.process_err(err);
            res.json(s);
        });
    });
    rs.on('error', function(e) {
        console.log("XXXXXXXXX", e);
        res.send('ERR');
    });

};


exports.download = function(req, res) {
    // TODO: set proper mime type + filename, handle errors, etc...
    gfs
      .createReadStream({ filename: req.param('filename') })
      .pipe(res);
};
