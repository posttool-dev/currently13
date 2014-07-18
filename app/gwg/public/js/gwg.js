

add_p($("#logo"));



function add_p($el) {
  $el.empty();
  var normal_el = $("<div></div>");
  var over_el = $("<div></div>");
  $el.append(normal_el);
  $el.append(over_el);

  var NL = 62;
  var NW = 614;
  var NH = 4;

  var normal = [
    [ 30, 0, 646, NH],
    [ 38, 0, 9, NH ],
    [ 46, 0, 9, NH ],
    [ 38, NL, NW, NH ],
    [ 46, NL, NW, NH ],
    [ 54, 0, 646, NH ],
    [ 62, NL, NW, NH ],
    [ 70, NL, NW, NH ],
    [ 78, 0, 32, NH ],
    [ 86, 0, 32, NH ],
    [ 98, 0, 9, NH ],
    [ 98, 46, 9, NH ],
    [ 98, NL, NW, NH ],
    [ 106, 0, 9, NH ],
    [ 106, 46, 9, NH ],
    [ 106, NL, NW, NH ],
    [ 114, 0, 9, NH ],
    [ 114, 46, 9, NH ],
    [ 114, NL, NW, NH ],
    [ 122, 0, 9, NH ],
    [ 122, 46, 9, NH ],
    [ 122, NL, NW, NH ],
    [ 130, 0, 9, NH ],
    [ 130, 46, 9, NH ],
    [ 130, NL, NW, NH ],
    [ 138, 39, 637, NH ],
    [ 146, 39, 637, NH ],
    [ 158, 0, 646, NH ],
    [ 166, 0, 9, NH ],
    [ 174, 0, 9, NH ],
    [ 166, NL, NW, NH ],
    [ 174, NL, NW, NH ],
    [ 182, 0, 646, NH ],
    [ 190, NL, NW, NH ],
    [ 198, NL, NW, NH ],
    [ 206, 0, 32, NH ],
    [ 214, 0, 32, NH ]
  ];

  for (var i = 0; i < normal.length; i++) {
    var l = normal[i];
    var $d = $("<div></div>").css({'width': l[2] + 'px', 'height': l[3] + 'px', 'background-color': '#000', 'position':'absolute'});
    move($d.get(0)).ease('out').to(l[1] ==0 ? 30 : l[1], l[0]).end();
    normal_el.append($d);
  }

  var OL = 72;
  var OW = 604;
  var OH = 4;
  var over = [
    [30, OL, OW, OH],
    [38, OL, OW, OH],
    [46, OL, OW, OH],
    [54, OL, OW, OH],
    [62, OL, OW, OH],
    [70, OL, OW, OH],
    [98, OL, OW, OH],
    [106, OL, OW, OH],
    [114, OL, OW, OH],
    [122, OL, OW, OH],
    [130, OL, OW, OH],
    [138, OL, OW, OH],
    [146, OL, OW, OH],
    [158, OL, OW, OH],
    [166, OL, OW, OH],
    [174, OL, OW, OH],
    [182, OL, OW, OH],
    [190, OL, OW, OH],
    [198, OL, OW, OH]
  ];

  for (var i = 0; i < over.length; i++) {
    var l = over[i];
    var $d = $("<div></div>").css({'width': l[2] + 'px', 'height': l[3] + 'px', 'position': 'absolute'}).addClass('pink-bar');
    move($d.get(0)).ease('out').to(l[1], l[0]).end();
    over_el.append($d);
  }
  over_el.hide();

  var $text = $("<div></div>").css({'position': 'absolute', 'top': '80px', 'left': '72px'}).text('178 Amber Drive San Francisco, California 94131');
  var $email = $("<div></div>").css({'position': 'absolute', 'top': '80px', 'left': '676px'}).html('<a href="mailto:worker@generalworkinggroup.com">worker(at)generalworkinggroup.com</a>');
  $el.append($text, $email);

  var click_area_0 = $("<div></div>").css({'position': 'absolute', 'top': '30px', 'left': 0, 'width': '100px', 'height': '260px', 'z-index': '20', 'background-color': 'rgba(1,0,0,0)'});
  var click_area_1 = $("<div></div>").css({'position': 'absolute', 'top': '30px', 'left': '100px', 'width': '600px', 'height': '70px', 'z-index': '20', 'background-color': 'rgba(1,0,0,0)'});
  var click_area_2 = $("<div></div>").css({'position': 'absolute', 'top': '70px', 'left': '100px', 'width': '600px', 'height': '210px', 'z-index': '0', 'background-color': 'rgba(0,255,0,0)'});
  var click_areas = [click_area_0, click_area_1, click_area_2];
  $el.append(click_areas);

  for (var i = 0; i < click_areas.length; i++) {
    var a = click_areas[i]
    a.mouseover(function () {
      over_el.show();
    }).mouseout(function () {
      over_el.hide();
    }).click(function(){
      toggle_menu();
    })
  }

}

function toggle_menu(){
  $(".main_menu").toggle();
}
console.log($(".main_menu nav li[depth='1']"))
$(".main_menu nav li[depth='1']").click(function(evt){
  evt.preventDefault();
  var $li = $(this);
  console.log($li.next())
  $li.next().show();
  return false;
})