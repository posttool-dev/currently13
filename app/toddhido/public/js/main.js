$("li").click(function(evt){
  var $el = $(this);
  var tn = $el.next().prop("tagName");
  if (tn == "UL")
  {
    var $c = $($el.next());
    $c.css({position:"absolute", top: '16px', left: $el.position().left+"px"});
    $c.stop().fadeIn(100);
    evt.preventDefault();
  }
});

$("li").mouseover(function(evt){
  var $el = $(this);
  var tn = $el.next().prop("tagName");
  if (tn == "UL")
  {
    var $c = $($el.next());
    $c.css({position:"absolute", top: '16px', left: $el.position().left+"px"});
    $c.stop().fadeIn(100);
    evt.preventDefault();
  }
});

$("li").mouseout(function(evt){
  var $el = $(this);
  var tn = $el.next().prop("tagName");
  if (tn == "UL")
  {
    var $c = $($el.next());
    $c.stop().fadeOut(100);
    evt.preventDefault();
  }
});

$("ul > ul").mouseover(function(){
  $(this).stop().css({opacity: 1});
});
$("ul > ul").mouseout(function(){
  $(this).stop().fadeOut(100);
})