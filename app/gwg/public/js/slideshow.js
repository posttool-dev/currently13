function slideshow($el, resources, options) {
  $el.empty();
  $el.click(function () {
    imgs[idx].fadeOut(200);
    idx++;
    if (idx<imgs.length)
      imgs[idx].fadeIn(200);
    else
      navigate_next();
    render();
  });
  var imgs = [];
  var load_idx = 0;
  var idx = -1;

  function load(resource) {
    var $img = $("<img/>");
    $img.data("name", resource.name);
    $img.load(function () {
      render();
      load_idx++;
      load_next();
    });
    console.log(resource)
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

  function render() {
    if (load_idx == 0 && idx == -1) {
      idx = 0;
      imgs[0].fadeIn(200);
    }
    var $img = imgs[idx];
    if (options.$info)
      options.$info.text($img.data("description"));//todo callback
    resize();
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
    $(window).resize(resize);
  }
}