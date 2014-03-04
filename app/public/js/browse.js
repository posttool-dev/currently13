function browse_browse(type) {
  var self = this;
  self.type = type;
  self.toString = function(){ return 'Browse '+type; }
  self.url = function() { return '/cms/browse/'+type; }
  var schema;
  var bmeta;
  var bmeta_idx;
  var row_height = zcookie.get('row-height-'+type, 40);;
  var filters = zcookie.get('filters-'+type, {});
  var page = zcookie.get('page-'+type, 0);
  var pagesize = zcookie.get('pagesize-'+type, 20);
  var order = zcookie.get('order-'+type, null);
  var total = 0;


  var p; // number of fields/90 (for initial cell percent width)
  //
  var $el;
  var $filters;
  var $filter_config;
  var $results;
  var $rhead;
  var $rbody;
  var $pager;
  self.$el = function () {
    return init_ui();
  }
  form_make_listener(self);

  function init_ui() {
    if ($el)
      return $el;
    $el = $$('browser');

    self.$controls = function () {
      var $controls = $$('browse-controls');
      // var $title = $$('title', {el: 'span', parent: $controls}).text('Browse ' + type);
      $filters = $$('filters', {parent: $controls});
      $pager = $$('pager', {parent: $controls});
//      var $create = $$('btn btn-right', {el: 'button', parent: $controls}).text('CREATE');
//      $create.click(function(){
//           location.href = '/cms/create/'+ type ;
//      });
      create_pager();
      update_filters();
      return $controls;
    }


    $filter_config = $$('filter-config', {parent: $el});
    $results = $$('results', {parent: $el});
    $rhead = $$('header', {parent: $results});
    $rbody = $$('body', {parent: $results});
    $$ajax('/cms/schema/' + type, null, 'post').done(function (o) {
      schema = o;
      bmeta = o.browser;
      bmeta_idx = {};
      for (var i=0; i<bmeta.length; i++)
        bmeta_idx[bmeta[i].name] = bmeta[i];
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
      total = o.count;
      update_ui(o.results)
      create_pager();
    });
  }

  function update_ui(results) {
    for (var i = 0; i < results.length; i++)
      $rbody.append(create_row(results[i]));
  }


  var $lh = null; // last header clicked
  function create_header_col(m) {
    var $e = $$('hcol nowrap');
    $e.css({width: p})
    $e.text(m.name);
    var hilight = function () {
      if (!order)
        return;
      if (order == m.name)
      {
        $e.addClass('order asc');
        $lh = $e;
      }
      else if (order.substring(1) == m.name)
      {
        $e.addClass('order desc');
        $lh = $e;
      }
    }
    hilight();
    $e.click(function () {
      if (order == m.name) {
        order = '-' + m.name;
      }
      else {
        order = m.name;
      }
      zcookie.set('order-'+type, order);
      if ($lh)
        $lh.removeClass('order asc desc');
      hilight();
      $lh = $e;
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
      var b = bmeta[j];
      var v = r[b.name];
      var $c = $$('ccol nowrap');
      $c.css({width: p});
      if (b.cell == 'image')
      {
        var u = find_thumb(v);;
        if (u)
          $c.append('<img src="'+u+'">');
      }
      else
        $c.text(v);
      $r.append($c);
    }
    return $r;
  }

  function find_thumb(v) {
    if (v == null)
      return null;
    if ($.isPlainObject(v)) {
      if (v.thumb)
        return v.thumb;
      for (var p in v) {
        var f = find_thumb(v[p]);
        if (f)
          return f;
      }
    } else if ($.isArray(v)) {
      for (var i = 0; i < v.length; i++) {
        var f = find_thumb(v[i]);
        if (f)
          return f;
      }
    } else {
      return null;
    }
  }

/* pager */

  function create_pager()
  {
//    $pager.append('<span> <button>&lt;</button>  </span>');
    $pager.empty();
    $pager.append('<span>'+ total +' total </span>');
    if (total > pagesize)
      for (var i = Math.max(0, page - 1); i < Math.min(page + 2, total / pagesize); i++)
        $pager.append(make_page(i, total));
//    $pager.append('<span> <button>&gt;</button>  </span>');
//    var top = Math.min(page*pagesize+pagesize, total);
//    $pager.append('<span>&nbsp;&nbsp;|&nbsp;&nbsp;'+(page*pagesize+1)+'-'+top+' of '+ total +'</span>');

  }

  var $lp = null; // last page clicked
  function make_page(i, total) {
    var $p = $$('page', {el: 'span'});
    if (i == page) {
      $p.addClass('selected');
      $lp = $p;
    }
    var top = Math.min(i*pagesize+pagesize, total);
    $p.text((i*pagesize+1)+'-'+top);
    $p.text(i+1);
    $p.click(function () {
      page = i;
      if ($lp)
        $lp.removeClass('selected');
      $lp = $p;
      $lp.addClass('selected');
      update_data();
    });
    return $p;
  }



  /* filters */

  var filters_open = false;

  function update_filters() {
    $filters.empty();
    var getfa = function () {
      return filters_open ? 'angle-up' : 'angle-down';
    };
    var $a = $$icon('filter-tag', {fa: getfa(), label: ' filter', parent: $filters});
    for (var p in filters)
      create_filter_tag(p);
    $a.click(function () {
      if (filters_open)
        $filter_config.empty();
      else
        create_filter_ui()
      filters_open = !filters_open;
      $a.setfa(getfa());
    })
  }

  function create_filter_tag(p) {
    var $e = $$('tag');
    var s = p + ': ';
    for (var q in filters[p])
      s += filters[p][q] + ' ';
    $e.text(s);
    var $a = $("<i class='fa fa-times-circle'></i>");
    $e.append($a);
    $a.click(function () {
      delete filters[p];
      zcookie.set('filters-'+type, filters);
      update_filters();
      update_data();
      if (filters_open)
        create_filter_ui();
    });
    $filters.append($e);
  }

  function create_filter_ui() {
    $filter_config.empty();
    var $x = $$('big', {parent: $filter_config});
//      var $apply = $$('btn',{el:'button', parent: $x}).text('apply');
//      var $cancel = $$('btn',{el:'button', parent: $x}).text('cancel');
    var $filter_rows = $$('filter-rows', {parent: $x});
    var c = 0;
    for (var p in filters) {
      $filter_rows.append(predicate_row(p, filters[p]));
      c++;
    }
    if (c == 0)
      $filter_rows.append(predicate_row());
    $filter_rows.find('input')
    var $add = $$icon('small', {fa: 'plus-circle', parent: $x, label: ' add condition'})
    $add.click(function () {
      $filter_rows.append(predicate_row());
    });
  }

  function get_data_from_ui_and_query()
  {
    page = 0;
    filters = {};
    var c = $filter_config.find('.filter-rows').children();
    for (var i=0; i< c.length; i++)
    {
      var $c = $(c[i]);
      var cc = $c.children();
      var name = $(cc[0]).val();
      var cond = $(cc[1]).val();
      var val = $(cc[2]).find('input').val(); // todo get val from component c.data
      filters[name] = {};
      filters[name][cond] = val;
    }
    zcookie.set('filters-'+type, filters);
    update_filters();
    update_data();
  }


  function predicate_row(p, r)
  {
    var $r = $$('pr');
    var $s = $$('name', {el:'select', parent: $r});
    for (var i=0; i< bmeta.length; i++)
      $s.append($("<option>"+ bmeta[i].name+"</option>"));
    if (p)
      $s.val(p);
    var $t = $$('comp', {el:'select', parent: $r});
    var $i = $$('i', {el: 'span', parent: $r});
    var $del = $$icon('', {fa: 'times-circle', parent: $r});
    $del.click(function(){
      $r.remove();
      get_data_from_ui_and_query();
    });
    $i.keyup(function(){
      get_data_from_ui_and_query();
    });
    function update_t_and_i(){
      $t.empty();
      var b = bmeta_idx[$s.val()];
      for (var i=0; i< b.filters.length; i++)
        $t.append($("<option>"+ b.filters[i]+"</option>"));
      var iv = null;
      if (r) {
        for (var q in r)
        {
          $t.val(q);
          iv = r[q];
        }
      }
      $i.empty();
      var $ic = $('<input type="text" class="small">')
      $i.append($ic);
      $ic.val(iv);
    }
    $s.change(update_t_and_i);
    update_t_and_i();
    return $r;
  }
}