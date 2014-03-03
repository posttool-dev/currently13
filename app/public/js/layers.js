function layers_layers(){
  var self = this;
  var $el = $$('layers');
  self.$el = function(){
    return $el;
  }
  init_nav();

  self.add_layer = function(f)
  {
    var $layer = $$('layer');
    $layer.data('__obj__', f);
    var $lens = $$('lens');
    $lens.click(function(){
      if ($el.children().length == 1)
        return;
      self.pop_layer();
      //emit close

    })
    var $c = $$('c');
    $c.append(f.$el());
    $layer.append($lens, $c);
    $el.append($layer);
    $layer.transition({x: 0});
    history_push();
    update_ui();

  }

  self.size = function()
  {
    return $el.children().length;
  }

  self.is_empty = function()
  {
    return $el.children().length == 0;
  }

  self.find = function (url) {
    var c = $el.children();
    for (var i = 0; i < c.length; i++) {
      var $c = $(c[i]);
      var f = $c.data('__obj__');

      if (url == f.url()) {
        return i;
      }
    }
    return -1;
  }

  self.clear_layers = function()
  {
    $el.empty();
    update_ui();
  }


  self.pop_layer = function()
  {
    pop_child();
    history_push();
    update_ui();
  }

  self.pop_to = function (url) {
    var i = self.find(url);
    var x = $el.children().length - i - 1;
    for (var i=0; i<x; i++)
      pop_child();
    history_push();
    update_ui();
  }

  function update_ui() {
    var c = $el.children();
    for (var i = 0; i < c.length; i++) {
      var $c = $(c[i]);
      if (i == c.length - 1)
        $c.css({position: 'absolute'});
      else
        $c.css({position: 'fixed'});
      $c.css({x: 0});
    }

    var $x = $("#extra-options");
    $x.empty();
    for (var i = 0; i < c.length; i++) {
      var f = $(c[i]).data('__obj__');
      (function (f) {
        var $r = $('<span class="nav-item"><i class="fa fa-angle-right"></i> ' + f.toString()+'</span>');
        $r.click(function () {
          self.pop_to(f.url())
        });
        $x.append($r);
      })(f);
    }

    $("#control-bar").empty();
    var f = $el.children().last().data('__obj__');
    if (f)
      $("#control-bar").append(f.$controls());
    $("#control-bar").css({x: 0});
  }

  function history_push()
  {
    var f = $el.children().last().data('__obj__');
    history.pushState(f.url(), f.toString(), f.url());
  }

  function pop_child()
  {
    var $c = $($el.children().last());
    $c.remove();
  }

  function init_nav()
  {
    dhova(400, $("#tool-bar"), function () {
        var c = $el.children();
        for (var i = 0; i < c.length; i++) {
          var $c = $(c[i]);
          $c.transition({x: i * 100});
        }
        $("#control-bar").transition({x: (i-1) * 100});
      },
      function () {
        var c = $el.children();
        for (var i = 0; i < c.length; i++) {
          var $c = $(c[i]);
          $c.transition({x: 0});
        }
        $("#control-bar").transition({x: 0});
      });
  }

  //
  function dhova(entasis, $e, a, b) {
    var id = -1;
    $e.hover(function () {
        if (id != -1)
          return;
        id = setTimeout(function () {
          id = -1;
          a();
        }, entasis);
      },
      function () {
        if (id != -1) {
          clearTimeout(id);
          id = -1;
          return;
        }
        b();
      })
  }
}