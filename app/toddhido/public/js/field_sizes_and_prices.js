form_fields['sizes_and_prices_field'] = function (options) {
  var $el = $$('json');
  this.$el = function () {
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
    if (_d)
      $el.append('<pre>' + JSON.stringify(_d) + '</pre>');
    else
      $el.append('-none-');
  }
};
