function form(type) {
  var ff = new form_form(type);
  ff.add_listener('browse', function (f, o) {
    var bb = new browse_browse(o.type);
    bb.add_listener('select', function (e, r) {
      add_object(o.field, r);
    });
    layers.add_layer(bb);
  });
  ff.add_listener('create', function (f, o) {
    var ff = form(o.type);
    ff.add_listener('close', function (e, r) {
      add_object(o.field, r);
    });
  });
  ff.add_listener('select', function (f, o) {
    var ff = form(o.type, o.id);
    ff.add_listener('close', function (e, r) {
      update_object(o.field, r);
    });
  });
  layers.add_layer(ff);
  return ff;
}

function add_object(for_field, r) {
  if (r.created) {
    for_field.push(r);
    for_field.emit('change');
  }
  layers.pop_layer();
}

function update_object(for_field, r) {
  if (r.created) {
    for_field.update(r);
    for_field.emit('change');
  }
  layers.pop_layer();
}