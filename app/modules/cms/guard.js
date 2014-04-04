exports.Guard = Guard;

function Guard(permissions) {
  this.permissions = permissions;
  this.map = {};
  this.browses = [];
  this.creates = [];
  this.views = [];
  this.models = [];
  this._init();
}

Guard.prototype._init = function () {
  for (var group in this.permissions) {
    var info = this.map[group] = {
      browses: {}, forms: {}, conditions: {}, permissions: {}
    };
    var perm = this.permissions[group];
    var form = perm.form;
    if (form)
      for (var i = 0; i < form.length; i++) {
        var o = form[i];
        info.forms[o.type] = o.form;
        info.permissions[o.type] = o.permission;
        if (this.models.indexOf(o.type) == -1)
          this.models.push(o.type);
        this.creates.push(o.type);
      }
    var browse = perm.browse;
    if (browse)
      for (var i = 0; i < browse.length; i++) {
        var o = browse[i];
        info.browses[o.type] = o.browse;
        info.conditions[o.type] = o.conditions;
        if (this.models.indexOf(o.type) == -1)
          this.models.push(o.type);
        this.browses.push(o.type);
      }
  }
}


Guard.prototype.browse_type = function (user, type) {
  var info = this.map[user.group];
  if (!info)
    return null;
  return info.browses[type];
}


Guard.prototype.form_type = function (user, type) {
  var info = this.map[user.group];
  if (!info)
    return null;
  return info.forms[type];
}


Guard.prototype.browse_conditions = function (user, type) {
  var info = this.map[user.group];
  if (!info)
    return null;
  return info.conditions[type];
}


Guard.prototype.form_permission = function (user, type) {
  var info = this.map[user.group];
  if (!info)
    return null;
  return info.permissions[type];
}


// prepares meta info for a user about what they can browse and not browse
Guard.prototype.get_models = function(user, meta) {
  var seen_models = {};
  var models = [];
  for (var i=0; i<this.browses.length; i++) {
    var type = this.browses[i];
    if (!seen_models[type])
    {
      var info = this.get_info(meta, type);
      info._browse = true;
      models.push(info);
      seen_models[type] = info;
    }
  }
  for (var i=0; i<this.creates.length; i++) {
    var type = this.creates[i];
    if (!seen_models[type])
    {
      var info = this.get_info(meta, type);
      info._create = true;
      models.push(info);
      seen_models[type] = info;
    } else {
      var info = seen_models[type];
      info._create = true;
    }
  }
  return models;
}


Guard.prototype.get_info = function(meta, type){
  var info = meta.schema_info(type);
  info.meta = meta.meta(type);
  info._type = type;
  return info;
}


Guard.prototype.get_admin_models = function(meta){
  var m = [];
  for (var p in meta.info){
    var i = this.get_info(meta, p);
    i._browse = true;
    i._create = true;
    m.push(i);
  }
  return m;
}