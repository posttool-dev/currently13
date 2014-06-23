$("li").click(function(evt){
  var $el = $(this);
  var tn = $el.next().prop("tagName");
  if (tn == "UL")
  {
    var $c = $($el.next());
    $c.toggle();
    evt.preventDefault();
  }
})