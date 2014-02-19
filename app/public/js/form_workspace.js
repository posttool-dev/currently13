function FormWorkspace(schema)
{
    var info = schema.info;
//    var shiftDown = false;
//    var ctrlDown = false;
//    var altDown = false;

    $("#save").click(function(){
        $.ajax({
            data: {
                name: $("input[name=name]").val(),
                description: $("textarea[name=description]").val(),
                info: JSON.stringify(get_field_data())
            },
            method: 'post',
            success: function(o){
                console.log('saved');
            },
            error: function(o){
                console.error(o);
            }
        });
    });

    $( ".tool" ).draggable({
        cursor: "move",
        cursorAt: { top: -5, left: -5 },
        helper: function( event ) {
          $(event.currentTarget).removeClass('selected');
          var m = $(event.currentTarget).html();
          var $m = $("<div class='dragging'>"+m+"</div>" );
          $m.data("type", event.currentTarget.id);
          return $m;
        },
        start: start_tool,  drag: dragging_tool, stop: stop_tool
    });

    var dragging = false;
    function start_tool(event, ui)
    {
        dragging = true;
        select_field(null);
        $at_arrow.show();
    }

    var $over = null;
    var $at = null;
    var insert_after = false;
    var $at_arrow = $("<div><i class='fa fa-arrow-down fa-2x'></i></div>").addClass("drag-at").hide();
    $(document.body).append($at_arrow);

    function dragging_tool(event,ui)
    {
        if ($over)
            $over.removeClass('over');
        if ($at)
            $at.removeClass('at');

        var p = {x: ui.offset.left, y: ui.offset.top};
        $over = $.nearest(p, '.group');
        $over.last().addClass('over');

        $at = $.nearest(p, '#workspace .item');
        $at.addClass('at');
        if ($at.length != 0)
        {
            var $litem = $at.last();
            if ($over.length > 1)
            {
                var $lover = $over.last();
                // TODO check to see that drag is not over something that it contains!
                var over_something_in_me = false;
                if (over_something_in_me)
                {
                    return;
                }
                var common_parent = ($lover.parent().data('__obj__') == $litem.parent().parent().data('__obj__'));
                if (!common_parent)
                {
                    var lo = $lover.offset();
                    $at = $("");
                    $at_arrow.css({'top':lo.top-15+'px','left':lo.left-14+'px'});
                    return;
                }
            }
            var io = $litem.offset();
            var right = io.left + $litem.outerWidth() * .5;
            var bottom = io.top + $litem.outerHeight();
            if (p.x>right)
            {
                io.left += $litem.outerWidth();
                insert_after = true;
            }
            else
                insert_after = false;
            if (p.y>bottom)
                console.log("belooows")
            $at_arrow.css({'top':io.top-15+'px','left':io.left-14+'px'});
        }
    }

    var field_info = {
        "tool-boolean": {name: 'boolean', type: 'boolean', default: true, columns: 2},
        "tool-number": {name: 'number', type: 'number', default: 0, columns: 2},
        "tool-string": {name: 'text', type: 'string', default: "text", columns: 2},
        "tool-date": {name: 'date', type: 'date', default: new Date(), columns: 2},
        "tool-color": {name: 'color', type: 'color', default: {r: 255, g: 255, b: 255, a: 1}, columns: 2},
        "tool-resource": {name: 'resource', type: 'resource', columns: 2},
        "tool-reference": {name: 'reference', type: 'reference', columns: 2},
        "tool-group": {name: 'group', type: 'group', columns: 2},
        "tool-break": {name: 'break', type: 'break'}
    };

    function stop_tool(event,ui)
    {
        dragging = false;
        $at.removeClass('at');
        $at_arrow.hide();
        //
        var tool_type = ui.helper.data("type");
        var field = create_from_info(field_info[tool_type]);
        insert_at_drag_spot(field.$el());
        select_field(field);
    }

    function create_from_info(info, $target)
    {
        var field = new indicated_field($.extend(true, {}, info));
        var $el = field.$el();
        $el.mouseover(over_instance).mouseout(out_instance);
        $el.draggable({appendTo: 'body', helper: 'clone', start: start_instance, drag: dragging_tool, stop: stop_instance});
        $el.click(click_field);
        if ($target)
            $target.append($el);
        if (info.children)
        {
            var $group = $el.find('.group').first();//awkward! let group know its children...
            for (var i=0; i<info.children.length; i++)
                create_from_info(info.children[i], $group);
        }
        return field;
    }

    var $dragging_instance = null
    function start_instance(event, ui)
    {
        dragging = true;
        $dragging_instance = $(event.target);
        $dragging_instance.css({'opacity':.5});
        select_field(null);
        $at_arrow.show();
   }

    function stop_instance(event,ui)
    {
        dragging = false;
        insert_at_drag_spot($dragging_instance);
        select_field($dragging_instance.data('__obj__'));
        $dragging_instance.css({'opacity':1});
        $at_arrow.hide();
   }

    function insert_at_drag_spot($el)
    {
        if ($at.length != 0)
        {
            if (insert_after)
                $el.insertAfter($at.last());
            else
                $el.insertBefore($at.last());
        }
        else
        {
            var $target = $over.last();
            $target.removeClass('over');
            $target.append($el);
        }
    }

    function over_instance(event)
    {
        if (dragging)
        {
            out_instance(event);
            return;
        }
        var $over = $(event.currentTarget);
        $over.addClass('over');
        //var over = $over.data('__obj__');
        //console.log(over);
    }

    function out_instance(event)
    {
        var $out = $(event.currentTarget);
        $out.removeClass('over');
    }



    // selection
    var selected_field = null;
    function select_field(indicated_field)
    {
        if (selected_field)
            selected_field.$el().removeClass('selected');
        selected_field = indicated_field;
        if (selected_field)
            selected_field.$el().addClass('selected');
        update_properties();
    }

    // properties
    var $properties_root = $( "#properties" );
    var $path_root = $( "#path" );
    function update_properties()
    {
        if (selected_field)
        {
            $path_root.empty().append($ancestors());
            $properties_root.empty().append($properties());
        }
        else
        {
            var $s = $("<span>document</span>");
            $s.click(function(){ select_field(null);});
            $path_root.empty().append($s);
            $properties_root.empty().append("C");
        }
    }


    function $i(o,p)
    {
        var $i = $("<input type='text'/>");
        $i.val(o[p]);
        $i.keyup(function(){ o[p] = $i.val(); });
        return $i;
    }

    function $s(options, selected)
    {
        var $s = $("<select></select>");
        for (var i=0; i<options.length; i++)
        {
            var w = options[i];
            var $o = $("<option></option>").text(w);
            if (selected == w)
                $o.attr('selected','selected');
            $s.append($o);
        }
        return $s;
    }

    function $ancestors()
    {
        var a = get_ancestors();
        var $a = $("<div></div>");
        var $s = $("<span>document</span>");
        $s.click(function(){ select_field(null);});
        $a.append($s);
        for (var i=a.length-1; i!=0; i--)
        {
            $a.append(' <i class="fa fa-angle-right"></i> ');
            $s = $("<span>"+a[i].info.name+"</span>");
            $s.data('if', a[i]);
            $s.click(function(){ select_field($(this).data('if'));});
            $a.append($s);
        }
        $a.append(' <i class="fa fa-angle-right"></i>');
        return $a;
    }

    function $properties()
    {
        var $properties = $("<div></div>");
        var $name = $i(selected_field, 'name');
        var $cols = $s(['1','2','4'], selected_field.info.columns).change(function(){
            selected_field.columns = $cols.val();
        });
        var $browse = $s(['primary','secondary','hidden'], selected_field.info.browse).change(function(){
            selected_field.info.browse = $browse.val();
        });

        var $del = $("<button>del</button>").click(function(){
            selected_field.$el().remove();
        });
        $properties.append($name,$cols,$browse,$del);
        // widgets?
        if (selected_field.field.widgets)
        {
            var $wsel = $s(selected_field.field.widgets, selected_field.field.widget);
            $wsel.change(function(){
                selected_field.field.widget = $wsel.val();
                selected_field.info.widget = $wsel.val();
                refresh_wprops();
            });
            $properties.append($wsel);
            var $wprops = $("<div></div>");
            $properties.append($wprops);
            function refresh_wprops()
            {
                $wprops.empty();
                var wprops = selected_field.field.properties;
                var wdefaults = selected_field.field.widgetDefaults;
                if (wprops)
                {
                    for (var p in wdefaults)
                    {
                        if (typeof wdefaults[p] == 'function')
                        {//rethink... might be able to return many props
                            var f = wdefaults[p](schema);
                            f.data = wprops[p];
                            (function(p, f){
                                f.change(function(){
                                    wprops[p] = f.data;
                                });
                            })(p, f);
                            $wprops.append(f.$el());
                        }
                        else if ($.isArray(wdefaults[p]) )
                            $wprops.append($s(wprops[p], p));
                        else
                            $wprops.append($i(wprops, p));
                   }
                }
            }
            refresh_wprops();
        }
        return $properties;
    }

    function get_ancestors()
    {
        var a = [selected_field];
        var $p = selected_field.$el().parent();
        while ($p.length != 0)
        {
            var f = $p.data('__obj__');
            if (f)
                a.push(f);
            $p = $p.parent();
        }
        return a;
    }

    function get_field_data($t, a)
    {
        if (!$t) $t = $workspace;
        if (!a) a = [];
        var c = $t.children();
        for (var i=0; i < c.length; i++)
        {
            var $c = $(c[i]);
            var o = $c.data('__obj__');
            if (o)
            {
                o.info.properties = o.field.properties;
                a.push(o.info);
                if (o.info.type == 'group')
                {
                    o.info.children = [];
                    get_field_data($c.find('.group').first(), o.info.children);
                }
            }
        }
        return a;
    }

    function click_field(e)
    {
        var indicated_field = $(e.currentTarget).data('__obj__');
        select_field(indicated_field);
        return false;
    }


    /// the bg grid
    var $workspace = $("#workspace");
    $workspace.click(function(){select_field(null);});

    var $grid = $("<div></div>").css({'position':'absolute', 'z-index':1});
    $workspace.append($grid);

    function set_grid(n)
    {
        var w = $workspace.width();
        var h = $workspace.height();
        $grid.width(w);
        $grid.height(h);
        var s = w / n;
        $grid.empty();
        for (var i=1; i<n; i++)
        {
            var x = i * s;
            var $line = $("<div></div>").css({
                'border-left':'1px solid #38f',
                'width':'1px',
                'height':'100%',
                'position':'absolute',
                'top':0,
                'left':x+'px'});
            $grid.append($line);
        }
    }



    // INIT

    if (info)
    for (var i=0; i<info.length; i++)
        create_from_info(info[i], $workspace);

    $(window).resize(function(){set_grid(4);});
    set_grid(4);
    select_field(null);



};

