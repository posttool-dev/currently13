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
});


var $s = $("a[href='"+location.pathname+"']");
$s.addClass('selected');
$s.parent().parent().prev().find('a').addClass('selected');

var $ul = $s.parent().parent();
if ($ul.prop("tagName") == "UL") {
  position($ul);
  $ul.fadeIn(100);
}

function position($c) {
  if ($c.prev().length)
    $c.css({position:"absolute", top: '16px', left: $c.prev().position().left+"px"});
}