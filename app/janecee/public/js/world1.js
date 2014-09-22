function render_map_set(R,map,attr)
{

	var s = R.set();
	render_map(R,map,{});
	for (var p in map)
		s.push(map[p])
	s.attr(attr)
	return s;
}

var world_map_cities = {}
var last_selected 		  = null;
var wm_label 			  = null;
var wm_click_label 		  = null;
var wm_click_selected 	  = null;
var wm_click_last	 	  = null;
var wm_city_rects 		  = null;
var wm_callback 		  = null;
var jlocs = null;
var raphael_world_map =
{
	tx: 0,
	ty: 0,
	s: 1,
	map: {},
	map_set:null,

	init: function(id,attr)
	{

		function get_intersecting_city_info(x,y)
		{
			var sx = 0;
			var sy = 0;
			var ltext = "";
			var intersectees = [];
			var selected = null;
			for(var i = 0;i < wm_city_rects.length;i++)
			{
				var R = wm_city_rects[i];
				if(x > R[0] && y > R[1] && x < R[2] && y < R[3])
					intersectees.push(R)
			}

			if(intersectees.length == 0)
			{
				return null;
			}
			else
			{
				if(intersectees.length == 1)
				{
					selected = intersectees[0][4];
					sx = intersectees[0][2] + 5;
					sy = parseInt(selected.css('top'),10) - 8 + (selected.height() *0.5);//intersectees[0][1] - 5;// - ((intersectees[0][3] - intersectees[0][1])*0.5)+2 ;
				}
				else
				{
					var smallest_size = 10000;
					var smallest_idx   = -1;
					for(var p = 0;p < intersectees.length;p++)
					{
						var size = intersectees[p][2] - intersectees[p][0];
						if(size < smallest_size)
						{
							smallest_size = size;
							smallest_idx = p;
						}
					}

					selected = intersectees[smallest_idx][4];
					sx = intersectees[smallest_idx][2] + 5;
					sy = parseInt(selected.css('top'),10)- 8 + (selected.height() *0.5)
				}

				return [selected,sx,sy];
			}
		}

		this.id = id;


		this.div = $$div($('#'+id));


		this.div.css({'width':'800px','height':'600px','top':'235px','left':'5px'});
		this.div.css({'position':'fixed','z-index':200});
		if (!IS_IOS)
		{
			this.div.mousemove(function(e){
				var cc = get_intersecting_city_info(e.pageX - this.offsetLeft,e.pageY - this.offsetTop);
				if(cc != null && cc[0] == wm_click_selected || cc == null && last_selected == wm_click_selected)
				{
					wm_label.css({'visibility':'hidden'})
					return;
				}

				if(last_selected != null && last_selected != wm_click_selected)
					last_selected.css({'opacity':0.5})

				if(cc == null)
				{
					wm_label.css({'visibility':'hidden'})
				}
				else
				{
					cc[0].css({'opacity':1})
					wm_label.css({'visibility':'visible','top':cc[2]+"px",'left':cc[1]+'px'})
					wm_label.text( world_map_cities[cc[0].obj][2]);

				}

				if(cc != null)
					last_selected = cc[0];
				else
					last_selected = null;
			});
		}
		this.div.click(function(e){

			var cc = get_intersecting_city_info(e.pageX - this.offsetLeft,e.pageY - this.offsetTop);

			if(cc)
				wm_click_selected = cc[0];

			if(wm_click_selected && cc != null && cc.length>2)
			{
				wm_callback(jlocs[wm_click_selected.obj].nodes);
				wm_click_selected.css({'opacity':1})
				wm_click_label.css({'visibility':'visible','top':cc[2]+"px",'left':cc[1]+'px'})
				wm_click_label.text( world_map_cities[wm_click_selected.obj][2]);

				if (wm_click_last!=null)
					wm_click_last.css({'opacity':0.5})
				wm_click_last = wm_click_selected;
			}


	});

		wm_label = $$div(this.div);
		wm_label.css({'position':'absolute','visibility':'hidden','z-index':250,'font-size':'10px','color':'#555','font-weight':'bold','margin':0,'padding':0})
		wm_click_label = $$div(this.div);
		wm_click_label.css({'position':'absolute','visibility':'hidden','z-index':250,'font-size':'10px','color':'#222','font-weight':'bold','margin':0,'padding':0})

	},

	set_value: function(value,callback)
	{
		var cities_xy = raphael_world_map.get_xy(world_map_cities);

		jlocs = get_locations(value);
		var mm = get_min_max(jlocs);
		wm_callback = callback;
		this.selected = null;
		wm_city_rects = [];
		for (var p in jlocs)
		{

			var v = (jlocs[p].count-mm[0])/(mm[1]-mm[0]);
			var s = (30*v+10);
			var o = (s*0.5);
			var c = cities_xy[p];

			if (c==null)
			{
				try { console.log('dont know '+p); } catch(e){}
				continue;
			}
			var self = this;

			var x1 = c.x-o;
			var y1 = c.y-o;

			var r = $$box(this.div,x1,y1,s,s,'90b3fd');
			r.css({'opacity':0.5});
			r.obj = p;
			wm_city_rects.push([x1,y1,x1+s,y1+s,r,p]);

		}
	},

	hide: function()
	{

		if (this.id==null)
			return;
		$("#"+this.id).hide();

		if(wm_click_label)
			wm_click_label.css({'visibility':'hidden'});
		if(wm_click_selected)
			wm_click_selected.css({'opacity':0.5});

	},

	show: function()
	{
		if (this.id==null)
			return;
		$("#"+this.id).show();
	},

	get_xy: function(o)
	{
		var f = 2.6938 * this.s;
		var xoffset = (465.4+this.tx) * this.s;
		var yoffset = (227.066+this.ty) * this.s;
		var lon2x = function (lon) { return (lon * f) + xoffset; }
		var lat2y = function (lat) { return (lat * -f) + yoffset; }
		var oxy = {};
		for (var p in o)
		{
			oxy[p] = { x: lon2x(o[p][0]), y: lat2y(o[p][1]) };
		}
		return oxy;
	}

}


//data util
function get_locations(node,map)
{
	if (map==null)
		map = {};
	var d = node._attributes.data._attributes.description;
	if (d!=null)
	{
		var b = d.indexOf("[");
		var e = d.indexOf("]");
	    if (b!=-1&&e!=-1&&b<e)
	    {
	    	var c = d.substring(b+1,e);
	    	var k = c;//.replace(/ /g,"_");
	    	if (map[k]==null)
	    		map[k] = { nodes: [node], count: 1, key: k };
	    	else
	    	{
	    		map[k].count++;
	    		map[k].nodes[map[k].nodes.length] = node;
	    	}
	    }
	}
	for (var i=0; i<node._attributes.children.length; i++)
		get_locations(node._attributes.children[i],map);
	return map;
}
function get_min_max(map)
{
	var min = 1000;
	var max = 0;
	for (var p in map)
	{
		max = Math.max(map[p].count,max);
		min = Math.min(map[p].count,min);
	}
	return [min,max];
}

