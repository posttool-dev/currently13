form_fields["rich_text_cee_field"] = function (options) {
  var self = this;
  var $el = $$('field rich-text');
  self.$el = function () {
    return $el;
  };
  var is_array = false;

  var $w = $("<textarea></textarea>");
  $el.append($w);
  var _ck = CKEDITOR.replace($w[0]);

  var _s = "";
  Object.defineProperty(self, "data",
    {
      get: function () {
        if (is_array)
          return _s.split("---");
        return _s;
      },
      set: function (n) {
        if (!n) n = "";
        is_array = $.isArray(n);
        if (is_array) {
          n = n.join("---\n");
        }
        _s = n.replace(/<[\/]{0,1}(root|ROOT)[^><]*>/g, "");
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


}