var upload_url = "/cms/upload";
var delete_url = "/cms/delete_resource/";

function form_form(type, id) {
  var self = this;
  self.type = type;
  self.toString = function(){ return 'Edit '+type; }
  form_make_listener(self);
  var $el = $$('form');
  self.$el = function () {
    return $el;
  }

  var _id = id;
  var _created = null;
  var _modified = null;
  var idx = {};

  var $controls = $$('form-controls', {parent: $el});
//  var $title = $$('title', {el: 'span', parent: $controls}).text(type);
  var $save = $$('btn btn-primary', {el: 'button', parent: $controls}).prop('disabled', true).text('SAVE');
  var $time = $$('time', {el: 'span', parent: $controls}).text('Last modified...');
  var $delete = $$('btn btn-right', {el: 'button', parent: $controls}).text('X');
  var $form = $$('form', {parent: $el});

  function set_meta(meta_data) {
    idx = {};
    $form.empty();
    var $t = $form;
    var s = [];
    idx = {};
    for (var i = 0; i < meta_data.length; i++) {
      var d = meta_data[i];
      if (d.begin) {
        var $x = $("<div></div>");
        $t.append($x);
        s.push($t);
        $t = $x;
      }
      else if (d.end) {
        $t = s.pop();
      }
      else {
        var f = create_field(d);
        var $fel = f.$el();
        $t.append($fel);
        idx[d.name] = f;
      }
    }
  }

  function create_field(d) {
    var f = new indicated_field(d);
    f.add_listener('change', function () {
      $save.prop('disabled', false);
      self.emit('change');
    });
    // for reference fields
    f.add_listener('add', function (f) {
      self.emit('create', {type: d.options.type, field: f.field});
    });
    f.add_listener('browse', function (f) {
      self.emit('browse', {type: d.options.type, field: f.field})
    });
    f.add_listener('select', function(f, o){
      self.emit('select', {type: d.options.type, id: o._id, field: f.field});
    })
    return f;
  }

  Object.defineProperty(self, "data", {
    get: function () {
      var d = {_id: _id, created: _created, modified: _modified};
      for (var p in idx)
        d[p] = idx[p].data;
      return d;
    },
    set: function (n) {
      if (n == null)
        return;
      _id = n._id;
      _created = n.created;
      _modified = n.modified;
      for (var p in n) {
        if (idx[p])
          idx[p].data = n[p];
      }
      // todo updateui
      if (n.modified)
        $time.text(' Last modified ' + timeSince(new Date(n.modified)) + ' ago.');
      else
        $time.text(' New record.');
    }
  });

  self.error = function (o) {
      $time.text(' ERROR - see fields for details');
    idx[o.path].error = JSON.stringify(o);
  }

  self.update = function (o) {
    if (location.href.indexOf('cms/create') != -1)
      location.href = '/cms/update/' + type + '/' + o._id;
    else
    {
      self.data = o;
      $save.prop('disabled', true);
    }
  }

  self.url = function()
  {
      var url = '/cms';
      if (id)
        url += '/update/' + type + '/' + id;
      else
        url += '/create/' + type;
    return url;
  }

  var url = '/cms/get/' + type;
  if (id)
    url += '/' + id;

  $$ajax(url).done(function (o) {
    set_meta(o.form);
    self.data = o.object;
  });

  $save.click(function () {
    $.ajax({
      url: self.url(),
      data: { val: JSON.stringify(self.data) },
      method: 'post',
      success: function (o) {
        if (o.name && o.name.indexOf("Error") != -1)
          self.error(o);
        else {
          self.update(o);
        }
      },
      error: function (o) {
        console.error(o);
      }
    })
  });

  $delete.click(function(){
    self.emit('close', self.data);
  });
}


function indicated_field(d)//, settings_callback)
{
  var self = this;
  var name = d.name;
  var label = d.label ? d.label : d.name;
  var type = d.widget;
  var $el = $$('control-group');
  self.$el = function () {
    return $el;
  }
  form_make_listener(self);

  var $label = $('<label></label>').addClass('control-label').attr('for', name).text(label);
  if (!form_fields[type + "_field"])
    throw Error("no field for " + type);
  var field = new form_fields[type + "_field"](d.options);
  form_make_listener(field);
  field.bubble_listener(self);
  self.field = field;
  $el.append($label, field.$el());
  field.$el().addClass('controls');

  Object.defineProperty(this, "data", {
    get: function () {
      return field.data;
    },
    set: function (n) {
      field.data = n;
    }
  });

  var lastCols = null;
  var cols = null;

  function columns_update_ui() {
    $el.removeClass(lastCols);
    lastCols = 'col-1-' + cols;
    $el.addClass(lastCols);
  }

  Object.defineProperty(this, "columns", {
    get: function () {
      return  cols;
    },
    set: function (n) {
      cols = n;
      columns_update_ui();
    }
  });

  var showLabel = true;

  function label_update_ui() {
    $label.text(label);
    if (showLabel)
      $label.show();
    else
      $label.hide();
  }

  Object.defineProperty(this, "label", {
    get: function () {
      return  label;
    },
    set: function (n) {
      label = n;
      label_update_ui();
    }
  });
  Object.defineProperty(this, "showLabel", {
    get: function () {
      return  showLabel;
    },
    set: function (n) {
      showLabel = n;
      label_update_ui();
    }
  });
  Object.defineProperty(this, "field", {
    get: function () {
      return field;
    }
  });
  Object.defineProperty(this, "name", {
    get: function () {
      return name;
    }
  });
  Object.defineProperty(this, "error", {
    set: function (e) {
      field.$el().append('<span class="help-inline">' + e + '</span>');
      $el.addClass('error');
    }
  });

}



var form_fields = {

  boolean_field: function (options) {
    var self = this;
    var $el = $$('field boolean');
    self.$el = function () {
      return $el;
    }

    var $c = $("<i class='fa fa-check-square-o'></i>");
    var $d = $("<span>description</span>");
    $el.append($c, $d);

    var _b = false;
    Object.defineProperty(self, "data",
      {
        get: function () {
          return _b;
        },
        set: function (n) {
          _b = n;
          update_ui();
        }
      });
    function update_ui() {
      if (_b) $c.removeClass('fa-square-o').addClass('fa-check-square-o');
      else $c.removeClass('fa-check-square-o').addClass('fa-square-o');
    }

    $c.click(function () {
      self.data = !self.data;
      update_ui();
      self.emit('change');
    });
  },

  number_field: function (options) {
    var self = this;
    var $el = $$('field number');
    this.$el = function () {
      return $el;
    }

    var $c = $("<input type='number'/>").addClass("form-control");
    $el.append($c);

    var _n = 0;
    Object.defineProperty(this, "data",
      {
        get: function () {
          return _n;
        },
        set: function (n) {
          _n = n;
          update_ui();
        }
      });
    function update_ui() {
      $c.val(_n);
    }

    $c.keyup(function () {
      _n = $c.val();
      self.emit('change');
    });
  },

  input_field: function (options) {
    var self = this;
    var $el = $$('field string');
    this.$el = function () {
      return $el;
    }

    var $c = $("<input type='text'/>").addClass("form-control");
    $el.append($c);

    var _n = "";
    Object.defineProperty(this, "data",
      {
        get: function () {
          return _n;
        },
        set: function (n) {
          _n = n;
          update_ui();
        }
      });
    function update_ui() {
      $c.val(_n);
    }

    $c.keyup(function () {
      _n = $c.val();
      self.emit('change');
    });
  },


  code_field: function (options) {
    // super
    var self = this;
    var $el = $$('field code');
    self.$el = function () {
      return $el;
    }
    // widget
    var $w = $("<textarea></textarea>").addClass("form-control");
    $el.append($w); //code mirror requires the appending before...
    var cm = CodeMirror.fromTextArea($w[0], $.extend({}, _properties));

    var _s = "";
    Object.defineProperty(self, "data",
      {
        get: function () {
          return _s;
        },
        set: function (n) {
          _s = n;
          update_ui();
        }
      });
    function update_ui() {
      cm.setValue(_s);
    }

    cm.on('change', function () {
      _s = cm.getValue();
      self.emit('change');
    });

  },

  rich_text_field: function (options) {
    var self = this;
    var $el = $$('field rich-text');
    self.$el = function () {
      return $el;
    }

    var $w = $("<textarea></textarea>");
    $el.append($w);
    var _ck = CKEDITOR.replace($w[0]);

    var _s = "";
    Object.defineProperty(self, "data",
      {
        get: function () {
          return _s;
        },
        set: function (n) {
          _s = n;
          update_ui();
        }
      });
    function update_ui() {
      _ck.setData(_s);
    }

    _ck.on('change', function () {
      _s = _ck.getData();
      self.emit('change');
    });


  },

  date_field: function (options) {
    var self = this;
    var $el = $$('field date');
    this.$el = function () {
      return $el;
    }

    var $c = $("<input type='date'/>").addClass("form-control");
    $el.append($c);

    var _d = new Date();
    Object.defineProperty(this, "data", {
      get: function () {
        return new Date(_d);
      },
      set: function (n) {
        _d = n.substring(0,10);
        update_ui();
      }
    });
    function update_ui() {
      $c.val(_d);
    }

    $c.keyup(function () {
      _d = $c.val();
      self.emit('change');
    });
  },

  upload_field: function (options) {
    var self = this;
    var $el = $$('field resource');
    this.$el = function () {
      return $el;
    }
    console.log(options)

    var $progress = $$('progress');
    var $progressbar = $$('bar', { css: { width: '0%' }, parent: $progress });
    var $info = $$('multi-drop-area file-input-drop');
    var $btn = $$('btn btn-small file-input-button', { children: [ $('<span><i class="fa fa-arrow-circle-o-up"></i> Upload file...</span>') ] });
    var $fileupload = $$('multi_upload', { el: 'input', parent: $btn,
      data: { url: upload_url },
      attributes: { type: 'file', name: 'file', multiple: 'multiple' }});
    $el.append($progress, $info, $btn);

    var _d = null;
    Object.defineProperty(this, "data", {
      get: function () {
        if (!_d)
          return null;
        if (options.array) {
          var v = [];
          for (var i = 0; i < _d.length; i++)
            v.push(_d[i]._id);
          return v;
        }
        return _d._id;
      },
      set: function (n) {
        _d = n;
        update_ui();
      }
    });

    function update_ui() {
      $info.empty();
      if (options.array)
        for (var i=0; i<_d.length; i++)
          get_upload_row(_d[i]);
        else
           get_upload_row(_d);
      if (_d)
        $btn.hide();
      else
        $btn.show();
    }

    function get_upload_row(row) {
      if (!row || !row.meta)
        return;
      var $e = $$('resource');
      $e.append('<img src="'+row.meta.thumb+'">');
      var $x = $("<div>x</div>");
      $x.click(function () {
        $$ajax(delete_url + row._id).done(function () {
          $btn.show();
          $info.empty();
        });
      })
      $e.append($x);
      $info.append($e);
    }


    $fileupload.fileupload({
      dataType: 'json',
      dropZone: $el,
      add: function (e, edata) {
        //if (data.valid && !edata.files[0].name.match(data.valid))
        //  return;
        $progress.show();
        $info.hide();
        $btn.hide();
        edata.submit();
      },
      progressall: function (e, edata) {
        var progress = parseInt(edata.loaded / edata.total * 100, 10);
        $progress.show();
        $info.hide();
        $btn.hide();
        $progressbar.css('width', progress + '%');
      },
      done: function (e, edata) {
        $progress.hide();
        $info.show();
        get_upload_row(edata.result);
        _d = edata.result;
        self.emit('change');
      },
      error: function (e) {
        console.log("ERR", e);
      }
    });
  },

  model_field: function (options) {
    var self = this;
    var $el = $$('model');
    form_make_listener(self);
    self.$el = function () {
      return $el;
    };

    var _d = null;
    Object.defineProperty(this, "data", {
      get: function () {
        return _d;
      },
      set: function (n) {
        _d = n;
        update_ui();
      }
    });
    function update_ui() {
      $el.empty();
      $el.append("<span class='nowrap'>"+_d.title+"</span>");
    }

    $el.dblclick(function () {
      console.log(self.data)
      self.emit('select', self.data);
    })
  },

  choose_create_field: function (options) {
    var self = this;
    var $el = $$();
    this.$el = function () {
      return $el;
    };

    var f = new form_fields.add_remove(form_fields.model_field);
    f.bubble_listener(self);
    $el.append(f.$el());

    Object.defineProperty(this, "data", {
      get: function () {
        return f.data;
      },
      set: function (n) {
        f.data = n;
      }
    });

    self.push = function(e){f.push(e);}
    self.update = function(e){f.update(e);}

  },

  many_reference_field: function ($el) {
    $el = form_field_create(self, $el);
    var f = new form_fields.add_remove(form_fields.model_field);
    $el.append(f.$el());
    this.$el = function () {
      return $el;
    };

    Object.defineProperty(this, "data", {
      get: function () {
        return f.data;
      },
      set: function (n) {
        f.data = n;
      }
    });
  },

  add_remove: function (clazz, options) {
    var self = this;
    form_make_listener(self);
    var $el = $$();
    this.$el = function () {
      return $el;
    };

    var $list = $("<div></div>");
    options = $.extend({add: true, browse: true}, options);
    var $actions = $("<div></div>");
    var $add = $("<span><i class='fa fa-plus-circle'></i> create</span>").css({'cursor': 'pointer'});
    var $browse = $("<span><i class='fa fa-play-circle '></i> browse</span>").css({'cursor': 'pointer'});
    if (options.add)
      $actions.append($add, '&nbsp;');
    if (options.browse)
      $actions.append($browse, '&nbsp;');
    $el.append($list);
    $el.append($actions);
    $add.click(function () {
      self.emit('add');
    });
    $browse.click(function () {
      self.emit('browse');
    });
    $list.sortable({change: function (event, ui) {
      self.emit('change');
    }});

    Object.defineProperty(this, "data", {
      get: function () {
        var vals = [];
        $list.children().each(function (i, e) {
          var o = $(e).data("__obj__");
          vals.push(o.data._id);
        });
        return vals;
      },
      set: function (o) {
        $list.empty();
        if (!o)
          return;
        for (var i = 0; i < o.length; i++) {
          self.push(o[i]);
        }
      }
    });

    self.push = function(data) {
      var d = new form_fields.deletable_row(clazz);
      d.data = data;
      d.bubble_listener(self);
      $list.append(d.$el());
      return d;
    }
    self.update = function(data) {
      // do all children (refs may have repeats)
        $list.children().each(function (i, e) {
          var o = $(e).data("__obj__");
          if (o.data._id == data._id)
            o.data = data;
        });
    }

  },

  deletable_row: function (clazz) {
    var self = this;
    form_make_listener(self);

    var $el = $("<div></div>").data("__obj__", this);
    this.$el = function () {
      return $el;
    }

    var $c = $("<span></span>").css({padding: '0 5px 0 0'});
    var c = new clazz();
    c.bubble_listener(self);
    c.$el().css({display: 'inline-block'})
    var $x = $("<span></span>").addClass("fa fa-times-circle");
    $el.append($c, $x);
    $c.append(c.$el());
    $x.click(function () {
      self.emit('change');
      $el.remove();
    });

    Object.defineProperty(this, "data", {
      get: function () {
        return c.data;
      },
      set: function (n) {
        c.data = n;
      }
    });


  },

//  group_field: function () {
//    var self = this;
//    var $el = $("<div></div>").addClass("group row");
//    this.$el = function () {
//      return $el;
//    }
//
//    var _d = {};
//    Object.defineProperty(this, "data", {
//      get: function () {
//        return _d;
//      },
//      set: function (n) {
//        _d = n;
//        update_ui();
//      }
//    });
//    function update_ui() {
//      for (var p in _c)
//        _c[p].data = _d[p];
//    }
//
//    var _c = {};
//    this.append = function (c) {
//      $el.append(c.$el());
//      _c[c.name] = _c;
//      c.change(function () {
//        _d[c.name] = c.data;
//        self.emit('change');
//      })
//    }
//
//  },
//
//  break_field: function () {
//    var $el = $("<div></div>").addClass("clearfix");
//    this.$el = function () {
//      return $el;
//    }
//
//    var _d = null;
//    Object.defineProperty(this, "data", {
//      get: function () {
//        return _d;
//      },
//      set: function (n) {
//        _d = n;
//        update_ui();
//      }
//    });
//    function update_ui() {
//    }
//
//  }
}


