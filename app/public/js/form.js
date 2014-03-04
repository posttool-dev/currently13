var upload_url = "/cms/upload";
var delete_url = "/cms/delete_resource/";

// TODO move to server config
var templates = {
  Artist: '<%= first_name %> <%= last_name %>',
  Inventory: '<%= title %>',
  Exhibition: '<%= title %>',
  Essay: '<%= title1 %>'
}

function form_form(type, id) {
  var self = this;
  self.type = type;
  self.toString = function(){ return 'Edit '+type; }

  var _meta = null;
  var _related = null;
  var _id = id;
  var _created = null;
  var _modified = null;
  var _idx = {};

  form_make_listener(self);

  var $el = $$('form');
  self.$el = function () {
    return $el;
  }

  var $controls = $$('form-controls');
  self.$controls = function () {
    update_controls();
    return $controls;
  }

  var $info = $$('form-info');
  self.$info = function(){
    update_info();
    return $info;
  }

  var $form = $$('form', {parent: $el});

  function update_form() {
    $form.empty();
    var $t = $form;
    var s = [];
    for (var i = 0; i < _meta.length; i++) {
      var d = _meta[i];
      if (d.begin) {
        s.push($t);
        var $x = $("<div></div>");
        if (d.options && d.options.className)
          $x.addClass(d.options.className);
        if ($t.data('float'))
          $x.css({'float':'left'});
        if (d.begin == 'row')
          $x.data('float',true);
        $t.append($x);
        $t = $x;
      }
      else if (d.end) {
        $t = s.pop();
      }
      else {
       var f = create_field(d);
        var $fel = f.$el();
        if ($t.data('float'))
          $fel.css({'float':'left'});
        $t.append($fel);
        _idx[d.name] = f;
      }
    }
    $t.append("<div style='clear:both;'></div>");
  }

  function create_field(d) {
    var f = new indicated_field(d);
    f.add_listener('change', function () {
      self.$save.prop('disabled', false);
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

  function update_controls()
  {
    $controls.empty();
        //  var $title = $$('title', {el: 'span', parent: $controls}).text(type);
    var $cancel = $$('btn btn-primary', {el: 'button', parent: $controls}).text('CLOSE');
    $cancel.click(function(){
      self.emit('close');
    });
    self.$save = $$('btn btn-primary', {el: 'button', parent: $controls}).prop('disabled', true).text('SAVE');
    self.$time = $$('time', {el: 'span', parent: $controls});
    self.$save.click(function () {
      $.ajax({
        url: self.url(),
        data: { val: JSON.stringify(self.data) },
        method: 'post',
        success: function (o) {
          if (o.name && o.name.indexOf("Error") != -1)
            self.error(o);
          else {
            self.update(o);
            history.pushState(self.url(), self.toString(), self.url());

          }
        },
        error: function (o) {
          console.error(o);
        }
      })
    });
    if (_modified)
      self.$time.text(' Last modified ' + timeSince(new Date(_modified)) + '.');
    else
      self.$time.text(' New record.');

  }

  function update_info() {
    $info.empty();
    var $info_date = $$('date', {parent: $info});
    var $info_rel = $$('related', {parent: $info});
    var $info_logs = $$('logs', {parent: $info});
    $info_date.append('<label>Created</label><br>'+formatDate(_created)+'<br><br><label>Modified</label><br>'+formatDate(_modified)+'<br><br>');
    var c = 0;
    for (var p in _related)
    {
      if (_related[p].length != 0)
      $info_rel.append('<h3>'+p+'</h3>');

      for (var i=0; i<_related[p].length; i++)
      {
        (function(type, r)
        {
          var f = new form_fields.model_field({type:type});
          f.data = r;
          var $m = f.$el();
          $m.dblclick(function () {
            console.log(r);
            self.emit('select', {type: type, id: r._id});
          });
          $info_rel.append($m);
          c++;
        })(p, _related[p][i]);
      }
    }
    if (c == 0)
    {
      var $delete = $$('delete', {el:'button'}).text('DELETE');
      $info_rel.append($delete);
    }
    else
    {
      var $delete = $$('delete', {el:'button'}).text('REMOVE REFERENCES');
      $info_rel.append($delete);
    }

    // logs

  }

  Object.defineProperty(self, "data", {
    get: function () {
      var d = {_id: _id, created: _created, modified: _modified};
      for (var p in _idx)
        d[p] = _idx[p].data;
      return d;
    },
    set: function (n) {
      if (n == null)
        return;
      _id = n._id;
      _created = n.created;
      _modified = n.modified;
      for (var p in n) {
        if (_idx[p])
          _idx[p].data = n[p];
      }
      update_ui();
    }
  });

  function update_ui()
  {
    update_controls();
    update_info();
  }


  self.error = function (o) {
      self.$time.text(' ERROR - see fields for details');
    _idx[o.path].error = JSON.stringify(o);
  }

  self.update = function (o) {
    self.data = o;
    self.$save.prop('disabled', true);

  }

  self.url = function()
  {
      var url = '/cms';
      if (_id)
        url += '/update/' + type + '/' + _id;
      else
        url += '/create/' + type;
    return url;
  }

  var url = '/cms/get/' + type;
  if (id)
    url += '/' + id;

  $$ajax(url).done(function (o) {
    _meta = o.form;
    _related =  o.related;
    _idx = {};
    update_form();
    self.data = o.object;
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

    var $progress = $$('progress');
    var $progressbar = $$('bar', { css: { width: '0%' }, parent: $progress });
    var $info = $$('multi-drop-area file-input-drop');
    var $btn = $$('btn btn-small file-input-button', {
      children: [ $('<span><i class="fa fa-arrow-circle-o-up"></i> Upload file...</span>') ] });
    var $fileupload = $$('multi_upload', { el: 'input', parent: $btn,
      data: { url: upload_url },
      attributes: { type: 'file', name: 'file', multiple: 'multiple' }});
    $el.append($progress, $info, $btn);

    var o = $.extend({add: false, browse: false}, options);
    var f = new form_fields.add_remove(form_fields.model_field, o);
    f.bubble_listener(self);
    $info.append(f.$el());

    Object.defineProperty(this, "data", {
      get: function () {
        return f.data;
      },
      set: function (n) {
        f.data = n;
        update_ui();
      }
    });

    function update_ui(){
      if (!options.array && f.data)
        $btn.hide();
      else
        $btn.show();

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
        if (options.array)
          f.push(edata.result);
        else
          f.update(edata.result);
        update_ui();
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
      if (templates[options.type])
      {
        var t = new EJS({text: templates[options.type]}).render(_d);
        if (t)
          $el.append('<div class="text">'+t+'</div>');
      }
      var thumb = find_thumb(_d);
      if (thumb)
        $el.append('<img src="'+thumb+'">');
    }

    $el.dblclick(function () {
      self.emit('select', self.data);
    })
  },

  choose_create_field: function (options) {
    var self = this;
    var $el = $$();
    this.$el = function () {
      return $el;
    };

    var f = new form_fields.add_remove(form_fields.model_field, options);
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

    options = $.extend({add: true, browse: true, array: true}, options);

    var $list = $("<div></div>");
    $el.append($list);
    $list.sortable({change: function (event, ui) {
      self.emit('change');
    }});

    if (options.add || options.browse)
    {
      var $actions = $("<div></div>");
      var $add = $("<span><i class='fa fa-plus-circle'></i> create</span>").css({'cursor': 'pointer'});
      var $browse = $("<span><i class='fa fa-play-circle '></i> browse</span>").css({'cursor': 'pointer'});
      if (options.add)
        $actions.append($add, '&nbsp;');
      if (options.browse)
        $actions.append($browse, '&nbsp;');
      $el.append($actions);
      $add.click(function () {
        self.emit('add');
      });
      $browse.click(function () {
        self.emit('browse');
      });
    }

    Object.defineProperty(this, "data", {
      get: function () {
        if (options.array) {
          var vals = [];
          $list.children().each(function (i, e) {
            var o = $(e).data("__obj__");
            vals.push(o.data._id);
          });
          return vals;
        } else {
          $list.children().each(function (i, e) {
            var o = $(e).data("__obj__");
            return o.data._id;
          });
        }
      },
      set: function (o) {
        $list.empty();
        if (!o)
          return;
        if (options.array)
          for (var i = 0; i < o.length; i++)
            self.push(o[i]);
        else
            self.push(o);
      }
    });

    self.push = function(data) {
      var d = new form_fields.deletable_row(clazz, options);
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

  deletable_row: function (clazz, options) {
    var self = this;
    form_make_listener(self);

    var $el = $$('deletable-row').data("__obj__", this);
    this.$el = function () {
      return $el;
    }

    var $c = $$('comp');
    var c = new clazz(options);
    c.bubble_listener(self);
    var $x = $$('del').addClass("fa fa-times-circle");
    $el.append($c, $x, $('<br clear="both">'));
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


