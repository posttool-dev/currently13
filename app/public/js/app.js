function init_cms() {
  var ctrlKeyDown;
  $(window).keydown(function (e) {
    ctrlKeyDown = e.ctrlKey || e.altKey || e.shiftKey || e.metaKey;
  }).keyup(function (e) {
    ctrlKeyDown = e.ctrlKey || e.altKey || e.shiftKey || e.metaKey;
  });

  var layers = new layers_layers();

  window.addEventListener("popstate", function (e) {
    var s = e.state ? e.state : location.pathname;
    var f = layers.find(s);
    if (f != -1) {
      if (f == 0 && layers.size() == 1)
        history.back();
      else
        layers.pop_to(s);
    }
    else {
      layers.clear_layers();
      var p = s.substring(1).split('/');
      if (p[1] == 'browse')
        browse(p[2])
      else if (p[1] == 'create')
        form(p[2])
      else if (p[1] == 'update')
        form(p[2], p[3]);
    }
  });

  // form
  function form(type, id) {
    var ff = new form_form(type, id);
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

  // glue the selected row back to the waiting form
  function add_object(for_field, r) {
    layers.pop_layer();
    if (r.created) {
      for_field.push(r);
      for_field.emit('change');
    }
  }

  function update_object(for_field, r) {
    layers.pop_layer();
    if (r.created) {
      for_field.update(r);
      for_field.emit('change');
    }
  }

  // root browser
  function browse(type) {
    var browser = new browse_browse(type);
    browser.add_listener('select', function (f, r) {
      if (ctrlKeyDown) {
        var url = '/cms/update/' + type + '/' + r._id;
        var win = window.open(url, ctrlKeyDown ? '_blank' : '_self');
        win.focus();
      }
      else {
        var ff = form(type, r._id);
        ff.add_listener('close', function (e, r) {
          layers.pop_layer();
        });
      }
    });
    layers.add_layer(browser);
  }

  return layers;
}