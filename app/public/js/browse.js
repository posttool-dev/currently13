function browse_browse(type, filters, order, page, pagesize) {
  var self = this;
  self.type = type;
  self.toString = function(){ return 'Browse '+type; }
  self.url = function() { return '/cms/browse/'+type; }
  var schema;
  var bmeta;
  var bmeta_idx;
  var row_height = 40;
  if (!page)
    page = 0;
  if (!pagesize)
    pagesize = 20;
  var p; // number of fields/90 (for initial cell percent width)
  var filters = [];
  //
  var $el;
  var $filters;
  var $filter_config;
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

    var $controls = $$('browse-controls', {parent: $(document.body)});
//    var $title = $$('title', {el: 'span', parent: $controls}).text('Browse ' + type);

    $filters = $$('filters', {parent: $controls});
    $pager = $$('pager', {parent: $controls});
    var $create = $$('btn btn-right', {el: 'button', parent: $controls}).text('CREATE');
    $create.click(function(){
         location.href = '/cms/create/'+ type ;
    })

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
    update_filters();
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
    create_pager(total);
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
      var b = bmeta[j];
      var v = r[b.name];
      var $c = $$('ccol nowrap');
      $c.css({width: p});
      if (bmeta[j].cell == 'image')
      {
        var u;
        if (Array.isArray(v) && v.length != 0)
          u = v[0].meta.thumb;
        else if (v.meta)
          u = v.meta.thumb;
        $c.append('<img src="'+u+'">');
      }
      else
        $c.text(v);
      $r.append($c);
    }
    return $r;
  }

/* pager */
//
//  function create_pager2(total) {
//    $pager.append('<span>Show rows: <input class="small" value="' + pagesize + '"></span>');
//    $pager.append('<span>Go to: <input class="small" value="' + page + '"></span>');
//    var top = Math.min(page * pagesize + pagesize, total);
//    $pager.append('<span>' + (page * pagesize) + '-' + top + ' of ' + total + '</span>');
//    $pager.append('<button>p</button>');
//    $pager.append('<button>n</button>');
//  }

  function create_pager(total)
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
    $p.click(function () {
      page = i;
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
      update_filters();
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