

function layers_layers(){
  var self = this;
  var $el = $$('layers');
  self.$el = function(){
    return $el;
  }

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
    update_ui();
    history.pushState(f.url(), f.toString(), f.url());
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
    $el.children().last().remove();
    update_ui();
  }

  self.pop_to = function (url) {
    var i = self.find(url);
    var c = $el.children();
    var x = c.length - i - 1;
    console.log('popto', x);
    for (var i=0; i<x; i++)
      c.last().remove();
    update_ui();
  }

  function update_ui() {
    var c = $el.children();
    for (var i = 0; i < c.length; i++) {
      var $c = $(c[i]);
//      $c.find('.c').css({left: (i * 5) + '%', width: (100 - i * 5) + '%'});
      if (i == c.length - 1)
        $c.css({position: 'absolute'});
      else
        $c.css({position: 'fixed'});
    }

    var $x = $("#extra-options");
    $x.empty();
    for (var i = 0; i < c.length; i++)
    {
      var d = $(c[i]).data('__obj__');
      $x.append('<i class="fa fa-angle-right"></i> ' + d.toString() + ' ');
    }

    setTimeout(function () {
      update_ui();
    }, 1500);
  }
}