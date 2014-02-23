// Avoid `console` errors in browsers that lack a console.
(function() {
    var noop = function noop() {};
    var methods = [
        'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
        'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
        'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
        'timeStamp', 'trace', 'warn'
    ];
    var length = methods.length;
    var console = window.console || {};

    while (length--) {
        // Only stub undefined methods.
        console[methods[length]] = console[methods[length]] || noop;
    }
}());

// Local Storage
var zcookie = {
    exists: (typeof (Storage) !== "undefined" && window['localStorage'] !== null && window['localStorage'] !== undefined)? true: false,
    set: function(key,val){
        if(!this.exists) return null;
        localStorage.setItem( key, JSON.stringify(val) );
        return true;
    },
    get: function(key, default_if_null){
        if(!this.exists) return null;
        var value = localStorage.getItem(key);
        if (default_if_null && !value)
            return default_if_null;
        return value && JSON.parse(value);
    },
    remove: function(key){
        if(!this.exists) return null;
        localStorage.removeItem(key);
        return true;
    },
    destroy: function(){
        if(!this.exists) return null;
        localStorage.clear();
    }
};
//        console.log('window.location.pathname',window.location.pathname)

var obj_to_attr = function(obj){
    var str = ' ';
    for( var p in obj ){
        str += p +'="'+ obj[p] + '" ';
    }
    return str;
}

// Place any jQuery/helper plugins in here.

var $$ = function(className, options)
{
    options = $.extend({
        el: 'div',
        attributes: {},
        css: {},
        parent: null,
        children: [],
        data: {}
    }, options);

     /* Unfortunately, jquery doesn't seem to like to set some attributes as DOM properties. (Notably href for off-DOM objects!!)
        Converting the attributes to a string and making that part of the $el constructor forces jquery to use innerHTML for atts. Yes, slower.
        If there's any problem constructing elements, use the following line:*/
    //  var $el = $( '<'+ options.el + obj_to_attr(options.attributes) +' />' ).css( options.css );
    var $el = $( '<'+ options.el +' />', options.attributes ).css( options.css );

    $el.addClass(className);

    if (options.parent!=null)
        options.parent.append($el);
    for (var i=0; i<options.children.length; i++)
        $el.append(options.children[i]);
    for (var p in options.data)
        $el.attr('data-'+p, options.data[p]);
    return $el;
}

function $$ajax(url,data,type)
{
  console.log(data);
    return $.ajax({
        crossDomain:false,
        method: type ? type : 'get',
        url: url,
        dataType: "json",
        contentType: "application/json",
        processData: false,
        data: data ? data : ""
    }).fail(function(e){
            console.log("ERROR",e.responseText);
        });
}
