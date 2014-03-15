
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
        if (n)
          _d = n.substring(0,10);
        else
          _d = '';
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
    $el.append($progress, $info, '<br clear="both">', $btn);

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
      var t = render_template(options.type, _d);
      if (t)
        $el.append('<div class="text">'+t+'</div>');
      if (options.type == 'Resource')
      {
        if (_d.mime.indexOf('image') == 0){
          var thumb = find_thumb(_d);
          if (thumb)
            $el.append('<img src="'+thumb+'">');
        } else if (_d.mime.indexOf('audio') == 0) {
          var src = '/cms/download/'+_d._id;
          $el.append('<audio controls><source src="'+src+'" type="'+_d.mime+'"></audio>');
        } else if (_d.mime.indexOf('video') == 0) {
          var src = '/cms/download/'+_d._id;
          $el.append('<video controls><source src="'+src+'" type="'+_d.mime+'"></video>');
        } else {
          $el.append('<a href="/cms/download/'+_d._id+'">'+_d.path+"</a>");

        }
      }
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
      var $actions = $("<div style='clear:both;'></div>");
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
          var val = null;
          $list.children().each(function (i, e) {
            var o = $(e).data("__obj__");
            val = o.data._id;
          });
          return val;
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
      return self.push(data);
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

