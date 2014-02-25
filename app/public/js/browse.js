function browse_browse(type, filters, order, page, pagesize) {
  var self = this;
  var schema;
  var bmeta;
  var row_height = 30;
  if (!page)
    page = 0;
  if (!pagesize)
    pagesize = 20;
  var p; // number of fields/90 (for initial cell percent width)
  //
  var $el;
  var $filters;
  var $results;
  var $rhead;
  var $rbody;
  var $pager;
  this.$el = function () {
    return init_ui();
  }
  form_make_listener(self);

  function init_ui() {
    if ($el)
      return $el;
    $el = $$('browser');

    $filters = $$('filters', {parent: $el});
    $pager = $$('pager', {parent: $el});
    $results = $$('results', {parent: $el});
    $rhead = $$('header', {parent: $results});
    $rbody = $$('body', {parent: $results});
    $$ajax('/cms/schema/' + type, null, 'post').done(function (o) {
      schema = o;
      bmeta = o.browser;
      p = Math.floor(90 / bmeta.length) + '%';
      init_ui2();
      update_data();
    });
    return $el;
  }


  function init_ui2() {
    var $r = $$('hrow nowrap');
    for (var i = 0; i < bmeta.length; i++)
      $r.append(create_header_col(bmeta[i]));
    $rhead.append($r);
  }


  function update_data() {
    $rbody.empty();
    $pager.empty();
    var d = JSON.stringify({condition: filters, order: order, offset: page * pagesize, limit: pagesize});
    $$ajax('/cms/browse/' + type, d, 'post').done(function (o) {
      //could keep a memory copy of all results at offsets
      update_ui(o.results, o.count)
    });
  }

  function update_ui(results, total) {
    for (var i = 0; i < results.length; i++)
      $rbody.append(create_row(results[i]));
    $pager.append('<span>'+total+' total</span>')
    if (total > pagesize)
      for (var i = 0; i < total / pagesize; i++)
        $pager.append(make_page(i));
  }


  var $lh = null; // last header clicked
  function create_header_col(m) {
    var $e = $$('hcol nowrap');
    $e.css({width: p})
    $e.text(m.name);
    $e.click(function () {
      if ($lh)
        $lh.removeClass('order asc desc');
      $lh = $e;
      if (order == m.name) {
        $lh.addClass('order desc');
        order = '-' + m.name;
      }
      else {
        $lh.addClass('order asc');
        order = m.name;
      }
      update_data();
    });
    return $e;
  }


  function create_row(r) {
    var $r = $$('crow nowrap');
    $r.hover(function () {
        $r.addClass('over');
      },
      function () {
        $r.removeClass('over');
      });
    $r.click(function () {
      self.emit('select', r);
    });
    $r.height(row_height);
    for (var j = 0; j < bmeta.length; j++) {
      var $c = $$('ccol nowrap');
      $c.css({width: p});
      $c.text(r[bmeta[j].name]);
      $r.append($c);
    }
    return $r;
  }


  var $lp = null; // last page clicked
  function make_page(i) {
    var $p = $$('page', {el: 'span'});
    if (i == page) {
      $p.addClass('selected');
      $lp = $p;
    }
    $p.text(i + 1);
    $p.click(function () {
      page = i;
      $lp.removeClass('selected');
      $lp = $p;
      $lp.addClass('selected');
      update_data();
    });
    return $p;
  }

}