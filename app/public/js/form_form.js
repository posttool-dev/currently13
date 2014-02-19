function FormForm(info)
{
    var field_map = {};
    function create_from_info(info, $target)
    {
        var field = new indicated_field($.extend(true, {}, info));
        field_map[info.name] = field;
        var $el = field.$el();
        if ($target)
            $target.append($el);
        if (info.children)
        {
            field.children = []
            var $group = $el.find('.group').first();
            for (var i=0; i<info.children.length; i++)
                field.children.push(create_from_info(info.children[i], $group));
        }
        return field;
    }

    function get_data(f, p)
    {
        for (var i=0; i< f.children.length; i++)
        {
            var fc = f.children[i];
            var name = fc.info.name;
            if (fc.info.type == 'group')
            {
                p[name] = {};
                get_data(fc, p[name]);
            }
            else
                p[name] = fc.data;
        }
    }


    //todo store fields in nested structure and resttore that way, instead of flat way im doing uit not
    function set_data(data, name)
    {
        if (typeof data == 'object')
        {
            for (var p in data)
                set_data(data[p], p);
        }
        else if (field_map[name])
        {
            field_map[name].data = data;
        }
    }


    // INIT
    var $workspace = $("#workspace");

    var root = {children:[]};
    for (var i=0; i<info.length; i++)
        root.children.push(create_from_info(info[i], $workspace));


   // public

    this.data = function(data)
    {
        if (typeof data == 'undefined')
        {
            var p = {};
            get_data(root, p);
            return p;
        }
        else
        {
            set_data(data);
        }
    }

};

