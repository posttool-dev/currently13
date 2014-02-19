
exports.load_by_id = function(req, model, next)
{
    var name = model.modelName.toLowerCase();
    var q = model.findOne({_id: req.params[name + '_id']});
    q.exec(function(err, m)
    {
        exports.process_err(err);
        if (m)
        {
            console.log("putting "+ m._id+" in req as "+name);
            req[name] = m;
            next();
        }
        else
        {
            next(new Error('cannot find ' + model.modelName +' ' + id));
        }
    });
};



exports.convert_to_obj_ids = function(s)
{
    var m = JSON.parse(s);
    var mo = [];
    for (var i=0; i< m.length; i++)
        mo.push(new mongoose.Types.ObjectId(m[i]));
    return mo;
};


exports.process_err = function(err)
{
    if (err)
    {
        console.error("ERROR",err);
        throw new Error(err);
    }
};



/// perms

exports.has_user = function(req, res, next)
{
    if (req.session.user) {
        next();
    } else {
        req.session.message = 'Access denied!';
        res.redirect('/login?next='+encodeURIComponent(req.url));
    }
}

//TODO
exports.is_admin = function(req, res, next)
{
    if (req.session.user) {
        next();
    } else {
        req.session.message = 'Access denied!';
        res.redirect('/login?next='+encodeURIComponent(req.url));
    }
}