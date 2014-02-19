
function indicated_field(info)//, settings_callback)
{
    var self = this;
    self.info = $.extend({label: true, columns: 1}, info);
    var $el = $("<div></div>").data("__obj__", this);
    $el.addClass('item');
    var $label = $('<label></label>').addClass('info').text(info.name);
    var field = field_factory(info);
    var $value = field.$el();
    $el.append($label, $value);

    self.$el = function() { return $el; }

    Object.defineProperty(this, "data", {
        get: function() {return field.data; },
        set: function(n) { field.data = n; }
    });

    var lastCols = null;
    function columns_update_ui()
    {
        $el.removeClass(lastCols);
        lastCols = 'col-1-' + self.info.columns;
        $el.addClass(lastCols);
    }
    Object.defineProperty(this, "columns", {
        get: function() {return  self.info.columns; },
        set: function(n) { self.info.columns = n; columns_update_ui(); }
    });
    self.columns = info.columns;


    function label_update_ui()
    {
        $label.text(self.info.name);
        if (self.info.label)
            $label.show();
        else
            $label.hide();
    }
    Object.defineProperty(this, "name", {
        get: function() {return  self.info.name; },
        set: function(n) { self.info.name = n; label_update_ui(); }
    });
    Object.defineProperty(this, "showLabel", {
        get: function() {return  self.info.label; },
        set: function(n) { self.info.label = n; label_update_ui(); }
    });

    Object.defineProperty(this, "field", {
        get: function() {return field; }
    });
    if (info.widget)
        field.widget = info.widget;
    if (info.properties)
        field.properties = info.properties;

}
