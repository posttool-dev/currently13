function layers_layers(){
  var self = this;
  var $el = $$('layers');
  self.$el = function(){
    return $el;
  }

  self.add_layer = function(f)
  {
    var $layer = $$('layer');
    var $lens = $$('lens');
    var $c = $$('c');
    $c.append(f.$el());
    $layer.append($lens, $c);
    $el.append($layer);
    update_ui();
  }

  self.pop_layer = function()
  {
    $el.children().last().remove();
  }

  function update_ui()
  {
    var c = $el.children();
    for (var i=0; i<c.length; i++)
    {
      var $c = $(c[i]);
      $c.find('.c').css({left: (i*5)+'%', width: (100-i*5)+'%'})
    }
  }
}