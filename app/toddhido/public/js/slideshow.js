function slideshow($el, page) {
  $el.empty();
  $el.click(function () {
    imgs[idx].fadeOut(200);
    idx++;
    imgs[idx].fadeIn(200);
    render();
  });
  var imgs = [];
  var load_idx = 0;
  var idx = -1;

  function load(resource) {
    var $img = $("<img/>");
    $img.load(function () {
      render();
      load_idx++;
      load_next();
    });
    $img.attr("src", bp + "w_950,h_950,c_fit/" + resource.meta.public_id + ".jpg");
    $img.hide();
    imgs.push($img);
    $el.append($img);
  }

  function load_next() {
    if (load_idx == page.resources.length) {
      //comspl
    } else {
      load(page.resources[load_idx]);
    }
  }

  function render() {
    if (load_idx == 0 && idx == -1) {
      idx = 0;
      imgs[0].fadeIn(200);
    }
    resize();
  }

  function resize() {
    var $img = imgs[idx];
    var w = $(window).width() - 280;
    var h = $(window).height() - 150;
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
    $img.css({
      position: 'absolute',
      top: (80 + (h-sh) *.5) +'px',
      left: '230px',
      width: sw+'px',
      height: sh+'px'
    });
  }

  if (page.resources.length) {
    load_next();
    $(window).resize(resize);
  }
}