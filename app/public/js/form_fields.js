function field_factory(info)
{
    if (!field_components[info.type+"_field"])
        throw Error("no field for "+info.type);
    var f = new field_components[info.type+"_field"]();
    return f;
}

var field_components = {

    create: function(self, $el, tag_name)
    {
        if (typeof $el != 'undefined' && $el != null)
            return $el;
        tag_name = tag_name || "div";
        $el = $("<"+tag_name+"/>");
        $el.data('__obj__', self);
        return $el;
    },

    boolean_field : function ($el)
    {
        var self = this;
        $el = field_components.create(self, $el);
        $el.addClass('field boolean');

        var $c = $("<i class='fa fa-check-square-o'></i>");
        var $d = $("<span>description</span>");
        $el.append($c, $d);
        self.$el = function() { return $el; }

        var _b = false;
        Object.defineProperty(self, "data", {
            get: function() {return _b; },
            set: function(n) { _b = n; update_ui(); }
        });
        function update_ui()
        {
            if (_b) $c.removeClass('fa-square-o').addClass('fa-check-square-o');
            else $c.removeClass('fa-check-square-o').addClass('fa-square-o');
        }
        $c.click(function(){ self.data = !self.data; update_ui(); });
    },

    number_field : function ($el)
    {
        var self = this;
        $el = field_components.create(self, $el);
        $el.addClass('field number');

        var $c = $("<input type='number'/>").addClass("form-control");
        $el.append($c);
        this.$el = function() { return $el; }

        var _n = 0;
        Object.defineProperty(this, "data", {
            get: function() {return _n; },
            set: function(n) { _n = n; update_ui(); }
        });
        function update_ui() { $c.val(_n); }
        $c.change(function(){ self.data = $c.val(); });
    },

    string_field : function ($el, widget, props)
    {
        var self = this;
        $el = field_components.create(self, $el);
        $el.addClass('field string');

        self.$el = function() { return $el; }

        var _s = "";
        Object.defineProperty(self, "data", {
            get: function() { return _s; },
            set: function(n) { _s = n; update_ui(); }
        });
        function update_ui() {
            if (_f)
                _f.data = _s;
            else if (_ck)
                _ck.setData(_s);
            else if (_nic)
                _nic.nicInstances[0].setContent(_s);
            else if (_cm)
                _cm.setValue(_s);
            else
                $w.val(_s);
        }

        self.cb = [];
        self.change = function(callback) { self.cb.push(callback);  }
        function fire_change()
        {
            for (var i=0; i<self.cb.length; i++)
                self.cb[i]();
        }



        var _widgets = ['input','option','input_array','textarea','ckeditor','niceditor','codemirror'];
        var _widget_properties = {
            input: {},
            option: {options:['add one...', 'add another']},
            input_array: {},
            textarea: {},
            ckeditor: {},
            codemirror: {mode:'javascript', lineNumbers:true}
        }
        var _w = null;
        var _properties = {};
        var $w = null;
        var _ck = null;
        var _nic = null;
        var _cm = null;
        var _f = null;
        function reset_props()
        {
            _properties = $.extend({}, self.widgetDefaults);
        }
        function render_widget()
        {
            if (_f)
                _f = null;
            if (_cm)
                _cm = null;
            if (_nic)
                _nic = null;
            if (_ck)
            {
                _ck.destroy();
                _ck = null;
            }
            $el.empty();
            switch (_w)
            {
                case 'input':
                    $w = $("<input type='text'/>").addClass("form-control");
                    $w.change(function(){ _s = $w.val(); fire_change();})
                    $el.append($w);
                    break;
                case 'option':
                    $w = $("<select></select>").addClass("form-control");
                    for (var i=0; i<_properties.options.length; i++)
                    {
                        var $o = $("<option>"+_properties.options[i]+"</option>");
                        $w.append($o);
                    }
                    $w.change(function(){ _s = $w.val(); fire_change();})
                    $el.append($w);
                    break;
                case 'input_array':
                    _f = new field_components.add_remove($el, field_components.string_field, {browse:false});
                    _f.change(function(){ _s = _f.data; fire_change();})
                    $w = _f.$el();
                    $el.append($w);
                    break;
                case 'textarea':
                    $w = $("<textarea></textarea>").addClass("form-control");
                    $w.change(function(){ _s = $w.val(); fire_change();})
                    $el.append($w);
                    break;
//                case 'niceditor':
//                    $w = $("<textarea></textarea>");
//                    $el.append($w);
//                    _nic = new nicEditor({fullPanel : true});
//                    _nic.panelInstance($w[0],{hasPanel : true});
////                    _nic.on('change', function(){ _s = _nic.getContent(); fire_change();});
//                    break;
                case 'ckeditor':
                    $w = $("<textarea></textarea>");
                    $el.append($w);
                    _ck = CKEDITOR.replace($w[0]);
                    _ck.on('change', function(){ _s = _ck.getData(); fire_change();});
                    break;
                case 'codemirror':
                    $w = $("<textarea></textarea>").addClass("form-control");
                    $el.append($w); //code mirror requires the appending before...
                    _cm = CodeMirror.fromTextArea($w[0], $.extend({}, _properties));
                    _cm.on('change', function(){ _s = _cm.getValue(); });
                    break;
            }
            update_ui();
        }
        Object.defineProperty(self, "widgets", {
            get: function() {return _widgets; }
        });
        Object.defineProperty(self, "widgetDefaults", {
            get: function() {return _widget_properties[_w]; }
        });
        Object.defineProperty(self, "widget", {
            get: function() {return _w; },
            set: function(n) { _w = n; reset_props(); render_widget(); }
        });
        Object.defineProperty(self, "properties", {
            get: function() {return _properties; },
            set: function(p) { _properties = p; render_widget(); }
        });


        // init
        if (widget)
            this.widget = widget;
        else
            this.widget = _widgets[0];

        if (props)
            this.properties = props;

    },

    date_field : function ($el)
    {
        $el = field_components.create(self, $el);
        $el.addClass('field date');

        var $c = $("<input type='date'/>").addClass("form-control");
        $el.append($c);
        this.$el = function() { return $el; }

        var _d = new Date();
        Object.defineProperty(this, "data", {
            get: function() {return _d; },
            set: function(n) { _d = n; update_ui(); }
        });
        function update_ui() { $c.val(_d); }
        $c.change(function(){ this.data = $c.val(); });
    },

    resource_field : function ($el)
    {
        $el = field_components.create(self, $el);
        $el.addClass('field resource');

        var $c = $("<input type='file'/>").addClass("form-control");
        $el.append($c);
        this.$el = function() { return $el; }

        var _d = null;
        Object.defineProperty(this, "data", {
            get: function() {return _d; },
            set: function(n) { _d = n; update_ui(); }
        });
        function update_ui(){}
    },

    reference_field : function ($el)
    {
        var self = this;
        $el = field_components.create(self, $el);
        $el.addClass('field reference');
        this.$el = function() { return $el; }

        var _d = null;
        Object.defineProperty(this, "data", {
            get: function() {return _d; },
            set: function(n) { _d = n; update_ui(); }
        });
        function update_ui() { _f.data = _d; }

        var _widgets = ['one','many'];
        var _widget_properties = {
            one: {reference: show_references, ref_field: show_fields },
            many: {reference: show_references, ref_field: show_fields }
        }
        var _f = null;
        var _w = null;
        var _properties = {};
        function reset_props(){
            _properties = $.extend({}, self.widgetDefaults);
            for (var p in _properties)
                if (typeof _properties[p] == 'function')
                    delete _properties[p];
        }
        function render_widget()
        {
            switch (_w)
            {
                case 'one':
                    _f = new field_components.one_reference_field();
                    break;
                case 'many':
                    _f = new field_components.many_reference_field();
                    break;
            }
            $el.empty().append(_f.$el());
            //_f.change(function(){ _s = $w.val(); })
            update_ui();
        }

        var site = null;
        function get_by_name(name){
            for (var i=0; i<site.schemata.length; i++)
                if (site.schemata[i].name == name)
                    return site.schemata[i];
            return null;
        }
        function get_fields(schema1, schema2)
        {
            var f = [];
            for (var i=0; i<schema1.info.length; i++)//need recur
            {
                if (schema1.info[i].type != 'reference')
                    continue;
                if (schema1.info[i].properties.reference == schema2.name)
                    f.push(schema1.info[i].name);
            }
            return f;
        }
        var ref_name;
        var ref_fields;
        function show_references(schema)
        {
            ref_name = new field_components.string_field(null, 'option');
            ref_name.change(function(){
                var s2 = get_by_name(ref_name.data);
                var fields = get_fields(s2, schema);
                fields.unshift('none');
                ref_fields.properties = {options: fields};
            });
            $.ajax({
                url: '/schema/'+schema._id+'/references',
                method: 'get',
                success: function(o){
                    site = JSON.parse(o);
                    var a = [];
                    for (var i=0; i< site.schemata.length; i++)
                        a.push(site.schemata[i].name);
                    ref_name.properties = {options: a};
                    var s2 = get_by_name(ref_name.data);
                    var fields = get_fields(s2, schema);
                    fields.unshift('none');
                    ref_fields.properties = {options: fields};
                },
                error: function(o){
                    console.error(o);
                }
            });
            return ref_name;
        }

        function show_fields()
        {
            ref_fields = new field_components.string_field(null, 'option', {options: ['none']});
            return ref_fields;
        }

        Object.defineProperty(self, "widgets", {
            get: function() {return _widgets; }
        });
        Object.defineProperty(self, "widgetDefaults", {
            get: function() {return _widget_properties[_w]; }
        });
        Object.defineProperty(self, "widget", {
            get: function() {return _w; },
            set: function(n) { _w = n; reset_props(); render_widget(); }
        });
        Object.defineProperty(self, "properties", {
            get: function() {return _properties; },
            set: function(p) { _properties = p; render_widget(); }
        });
        this.widget = _widgets[0];
    },

    model_field: function($el)
    {
        $el = field_components.create(self, $el, 'span');
        this.$el = function() { return $el; }

        var _d = null;
        Object.defineProperty(this, "data", {
            get: function() {return _d; },
            set: function(n) { _d = n; update_ui(); }
        });
        function update_ui(){
            $el.empty();
            $el.text(_d);
        }
    },

    one_reference_field : function ($el)
    {
        $el = field_components.create(self, $el);
        var f = new field_components.add_remove($el, field_components.model_field);
        $el.append(f.$el());
        this.$el = function() { return $el; }

        Object.defineProperty(this, "data", {
            get: function() {return f.data; },
            set: function(n) {f.data = n; }
        });

    },

    many_reference_field : function ($el)
    {
        $el = field_components.create(self, $el);
        var f = new field_components.add_remove($el, field_components.model_field);
        $el.append(f.$el());
        this.$el = function() { return $el; }

        Object.defineProperty(this, "data", {
            get: function() {return f.data; },
            set: function(n) {f.data = n; }
        });
    },

    add_remove: function ($el, clazz, options)
    {
        var self = this;
        $el = field_components.create(self, $el);
        this.$el = function() { return $el; }
        var $list = $("<div></div>");
        options = $.extend({add:true, browse:true}, options);
        var $actions = $("<div></div>");
        var $add = $("<span><i class='fa fa-plus'></i> add</span>").css({'cursor':'pointer'});
        var $browse = $("<span><i class='fa fa-plus'></i> browse</span>").css({'cursor':'pointer'});
        if (options.add)
            $actions.append($add, '&nbsp;');
        if (options.browse)
            $actions.append($browse, '&nbsp;');
        $el.append($list);
        $el.append($actions);
        $add.click(function() { $list.append(add_one().$el()); });
        $list.sortable({handle:'.sort'});

        Object.defineProperty(this, "data", {
            get: function()
            {
                var vals = [];
                $list.children().each(function(i,e){
                    var o = $(e).data("__obj__");
                    vals.push(o.data);
                });
                return vals;
            },
            set: function(o)
            {
                $list.empty();
                if (!o)
                    return;
                for (var i=0; i< o.length; i++)
                {
                    $list.append(add_one(o[i]).$el());
                }
            }
        });

        function add_one(data)
        {
            var d = new field_components.deletable_row(clazz);
            d.data = data;
            d.change(function(){ self.callback(); });
            return d;
        }

        this.change = function(callback)
        {
            this.callback = callback;
        }

    },

    deletable_row: function(clazz)
    {
        var $el = $("<div></div>").data("__obj__", this);
        var $h = $("<span></span>").addClass("fa fa-sort sort");
        var $c = $("<span></span>").css({padding:'0 5px 0 5px'});
        var c = new clazz();
        c.$el().css({display:'inline-block'})
        var $x = $("<span></span>").addClass("fa fa-times-circle");
        $el.append($h, $c, $x);
        $c.append(c.$el());
        $x.click(function(){
           $el.remove();
        });

        Object.defineProperty(this, "data", {
            get: function() {return c.data; },
            set: function(n) { c.data = n; }
        });

        this.$el = function()
        {
            return $el;
        }

        this.change = function(callback)
        {
            c.change(callback);
        }
   },

    group_field : function ()
    {
        var self = this;
        var $el = $("<div></div>").addClass("group row");
        this.$el = function() { return $el; }

        var _d = {};
        Object.defineProperty(this, "data", {
            get: function() {return _d; },
            set: function(n) { _d = n; update_ui(); }
        });
        function update_ui(){
            for (var p in _c)
                _c[p].data = _d[p];
        }
        var _c = {};
        this.append = function(c)
        {
            $el.append(c.$el());
            _c[c.name] = _c;
            c.change(function(){ _d[c.name] = c.data; fire_change(); })
        }
        this.change = function(c)
        {
            self.change_callback = c;
        }
        function fire_change()
        {
            if (self.change_callback)
                self.change_callback();
        }
    },

    break_field : function ()
    {
        var $el = $("<div></div>").addClass("clearfix");
        this.$el = function() { return $el; }

        var _d = null;
        Object.defineProperty(this, "data", {
            get: function() {return _d; },
            set: function(n) { _d = n; update_ui(); }
        });
        function update_ui(){}

    }
}


