var IS_IOS = false;


// find_node_by_node_id
function find_node_by_id(id, node) {
  if (node.url == id)
    return node;
  for (var i=0; i<node.pages.length; i++)
  {
    var n = find_node_by_id(id, node.pages[i]);
    if (n)
      return n;
  }
  return null;
}

function add_parents(node){
  for (var i=0; i<node.pages.length; i++)
  {
    var c = node.pages[i];
    c.parent = node;
    add_parents(c);
  }
}

// ancestors(node)
function ancestors(node){
  var p = node;
  var a = [];
  while (p.parent) {
    a.push(p);
    p = p.parent;
  }
  return a;
}

// send_message(title,body,cb)
function send_message(from, body,complete){
  $.ajax({url: "/contact-email", method: "POST", data: { from: from, body: body}}).done(function(r){
    console.log(r);
    complete();
  });
}

// get_path(resource, w, h)
function get_path(resource, w, h) {
  if (resource.url.indexOf(".gif") != -1)
    return resource.url;
  else
    return "http://res.cloudinary.com/ceearchitects/image/upload/w_"+w+",c_fit/" + resource.public_id + ".jpg";



}

// get_preview_url(res, w, h, cb)
function get_preview_url(resource, w, h, complete) {

}

//strip tags
var stripper = /(<([^>]+)>)/ig;
function strip_tags(html_str) {
  return html_str.replace(stripper, '');
}