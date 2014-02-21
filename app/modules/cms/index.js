var mongoose = require('mongoose'),
    uuid = require('node-uuid');
;

exports.add_fields_and_methods = function(schema, user_ref)
{
    if (!user_ref)
        user_ref = 'User';
    schema.add({
        'creator': [{type: mongoose.Schema.Types.ObjectId, ref: user_ref}],
        'created': Date,
        'modified': Date,
        'uuid': String,
        'state': Number
    });
    schema.method('url', function(){
        return this.modelName.toLowerCase() + '/' + this.uuid;
    });
    schema.pre('save', function (next, user, callback) {
        console.log(user_ref, user)
        this.creator = user;
        this.uuid = uuid.v1();
        this.modified = new Date();
        if (!this.created)
            this.created = new Date();
        next(callback);
    });
}

exports.create_form_from_schema = function(schema)
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