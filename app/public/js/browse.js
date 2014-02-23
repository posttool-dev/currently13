function browse_browse(type, filters, order, page, pagesize) {
  var schema;
  var bmeta;
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

  function init_ui() {
    if ($el)
      return $el;
    $el = $$('browser');
    $filters = $$('filters',{parent: $el});
    $results = $$('results',{parent: $el});
    $rhead = $$('header',{parent: $results});
    $rbody = $$('body',{parent: $results});
    $pager = $$('pager',{parent: $el});
    $$ajax('/cms/schema/' + type, null, 'post').done(function (o) {
      schema = o;
      bmeta = o.browser;
      init_ui2();
      update_data();
    });
    return $el;
  }

  function init_ui2() {
    var $r = $$('hrow');
    for (var i=0; i<bmeta.length; i++)
    {
      var $e = $$('hcol');
      $e.text(bmeta[i].name);
      $r.append($e);
    }
    $rhead.append($r);
  }

  function update_data() {
    var d = JSON.stringify({condition: filters});
    $$ajax('/cms/browse/' + type, d, 'post').done(function (o) {
      //could keep a memory copy of all results at offsets
      update_ui(o)
    });
  }

  function update_ui(results) {
    for (var i = 0; i < results.length; i++) {
      var $r = $$('crow');
      for (var j=0; j<bmeta.length; j++)
      {
        var $c = $$('ccol');
        $c.text(results[i][bmeta[j].name]);
        $r.append($c);
      }
      $rbody.append($r);
    }
  }
}