function slideshow($el, resources, options) {
  $el.empty();
  $el.click(next);
  if (options.$info)
    options.$info.hide();
  var imgs = [];
  var load_idx = 0;
  var idx = -1;

  function load(resource) {
    var $img = $("<img/>");
    $img.data("description", resource.description);
    $img.load(function () {
      render();
      load_idx++;
      load_next();
    });
    $img.hide();
    $img.attr("src", bp + "/w_1950,h_1450,c_fit/" + resource.meta.public_id + ".jpg");
    imgs.push($img);
    $el.append($img);
  }

  function load_next() {
    if (load_idx == resources.length) {
      //comspl
    } else {
      load(resources[load_idx]);
    }
  }

  function next(){
    if (idx >= load_idx - 1) {
      if (idx == imgs.length - 1)
      {
        navigate_next();
        return;
      } else {
        idx = load_idx -1;
        return;
      }
    }
    //imgs[idx].fadeOut(200);
    move(imgs[idx].get(0)).to(-$(window).width(),0).duration(500).end();
    idx++;
    imgs[idx].fadeIn(100);
    imgs[idx].css({left: $(window).width()})
    move(imgs[idx].get(0)).to(0,0).duration(500).end();
    render();
  }

  function render() {
    if (load_idx == 0 && idx == -1) {
      idx = 0;
      imgs[0].fadeIn(200);
    }
    resize();
    var $img = imgs[idx];
    if (options.$info){
      options.$info.html($img.data("description"));//todo callback
      var $a = $("<a href='#'>"+(idx+1)+" of "+imgs.length+"</a>");
      $a.click(next);
      options.$info.append($a);
      options.$info.css({top: ($img.height()+10)+'px', position: 'absolute'});
      options.$info.fadeIn(150);
    }
  }



  function resize() {
    var $img = imgs[idx];
    var w = $(window).width() - options.widthDelta;
    var h = $(window).height() - options.heightDelta;
    var iw = $img.width();
    var ih = $img.height();
    var sx = w / iw;
    var sy = h / ih;
    var sw, sh;
    if (sx < sy) {
      sw = iw * sx;
      sh = ih * sx;
    }
    else {
      sw = iw * sy;
      sh = ih * sy;
    }
    if (options.alignCenter) {
      $img.css({
        position: 'absolute',
        top: (options.yOffset + (h-sh) *.5) +'px',
        left: options.xOffset +'px',
        width: sw+'px',
        height: sh+'px'
      });
    } else {
       $img.css({
        position: 'absolute',
        top: 0 +'px',
        left: 0 +'px',
        width: sw+'px',
        height: sh+'px'
      });
    }
  }

  if (resources.length) {
    load_next();
    $(window).resize(render);
  }
}