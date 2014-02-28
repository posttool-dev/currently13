exports.process_list = function(list, target, complete, concurrent)
{
  if (!list || list.length == 0)
  {
    complete();
    return;
  }
  var c = concurrent ? concurrent : 1;
  var i = 0;
  var k = 0;
  var ff = function(){
    for (var j=0; j<c && i+j<list.length; j++) f();
  }
  var f = function()
  {
    var item = list[i];
    target(item, function(){
      k++;
      if (k < list.length)
        ff();
      else
        complete();
    });
    i++;
  }
  ff();
}


//exports.load_by_id = function(req, model, next)
//{
//    var name = model.modelName.toLowerCase();
//    var q = model.findOne({_id: req.params[name + '_id']});
//    q.exec(function(err, m)
//    {
//        exports.process_err(err);
//        if (m)
//        {
//            console.log("putting "+ m._id+" in req as "+name);
//            req[name] = m;
//            next();
//        }
//        else
//        {
//            next(new Error('cannot find ' + model.modelName +' ' + id));
//        }
//    });
//};
//
//
//
//exports.convert_to_obj_ids = function(s)
//{
//    var m = JSON.parse(s);
//    var mo = [];
//    for (var i=0; i< m.length; i++)
//        mo.push(new mongoose.Types.ObjectId(m[i]));
//    return mo;
//};
//
//
//exports.process_err = function(err)
//{
//    if (err)
//    {
//        console.error("ERROR",err);
//        throw new Error(err);
//    }
//};


