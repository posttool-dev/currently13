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

exports.init = function(meta, resource_class_name, user_class_name)
{
    gfs = new Grid(mongoose.connection.db, mongoose.mongo);
    Meta = meta;
    for (var p in  meta)
    {
        console.log(p);
        var schema_data = meta[p].schema;
        var schema = mongoose.Schema(schema_data);
        add_fields_and_methods(schema, p);
        meta[p].schema = schema;
//        var d = create_form_from_schema(schema);
//        console.log(d);
    }
    Resource = mongoose.model(resource_class_name, Meta[resource_class_name].schema);
//    User = mongoose.model(user_class_name, Meta[user_class_name].schema);
}




add_fields_and_methods = function(schema, name, user_ref)
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
        return name.toLowerCase() + '/' + this.uuid;
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
};


exports.browse = function(req, res, next)
{
  req.model.find(function(err,result){
    res.render('cms/browse', {
        title: 'CMS Dashboard ',
        browser: req.browser,
        model: req.params.type,
        result: result
    });
  });
};

exports.a = function(req, res, next)
{
    req.models = Meta;
    next();
};

exports.b = function(req, res, next)
{
    req.browser = Meta[req.params.type]['browse'];
    req.form = Meta[req.params.type]['form'];
    req.model = mongoose.model(req.params.type, Meta[req.params.type].schema);
    next();
};

exports.c = function(req, res, next)
{
    var q = req.model.findOne({_id: req.params.id});
    q.exec(function(err, m)
    {
      console.log(m);
        req.object = m;
        next();
    });
};


exports.form =
{
    get: function(req, res)
    {
        var s = req.object || new req.model();
        res.render('cms/form', {title: 'Editing', object: s, form: req.form});
    },

    post: function(req, res)
    {
        var s = req.object || new req.model();
        var data = JSON.parse(req.body.val);
        for (var p in data)
        {
            console.log(p, data[p]);
            s[p] = data[p];
        }
        s.creator = req.session.user._id;
        s.save(function(err,s) {
            res.json(s);
        });
    }
};


// image and resource handling


exports.upload = function(req, res)
{
    var file = req.files.file;
    var do_save = function(e)
    {
        // create a resource with path & return id
        var r = new Resource();
        r.filename = file.name;
        r.path = file.path;
        r.size = file.size;
        r.creator = req.session.user._id;
        r.meta = e;
        r.save(function(err,s) {
            s.meta.thumb = cloudinary.image(e.public_id + "." + e.format, { width: 100, height: 150, crop: "fill" })
            res.json(s);
        });
    };
    if (use_gfs)
    {
        var ws = gfs.createWriteStream({ filename: file.path });
        ws.on('error', function(e) {
            res.send('ERR');
        });
        var rs = fs.createReadStream(file.path);
        rs.on('open', function() {
            rs.pipe(ws);
        });
        rs.on('end', function() {
            do_save(null);
        });
        rs.on('error', function(e) {
            res.send('ERR');
        });
    }
    else
    {
        var imageStream = fs.createReadStream(file.path, { encoding: 'binary' });
        var cloudStream = cloudinary.uploader.upload_stream(function(e) {
            do_save(e);
        });
        imageStream.on('data', cloudStream.write).on('end', cloudStream.end);
    }

};

exports.delete_resource = function(req, res)
{
    var q = Resource.findOne({_id: req.params.id});
    q.exec(function(err, r)
    {
        if (r)
        {
            cloudinary.uploader.destroy(r.meta.public_id, function(result) {
                console.log(result);
                res.json(result);
            });
        }
        else
        {
            res.send('ERR');
        }
    });
}


// for gfs
exports.download = function(req, res) {
    // TODO: set proper mime type + filename, handle errors, etc...
    var q = Resource.findOne({_id: req.params.id});
    q.exec(function(err, r)
    {
        if (r)
        {
            gfs
              .createReadStream({ filename: "/thumb" + r.path })
              .pipe(res);
        }
        else
        {
            res.send('ERR');
        }
    });
};



