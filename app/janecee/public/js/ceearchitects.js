
janecee =
{
    palette:
    {
    	gray: ['010101', '333333', '4E4E4E', '676767', '818181', '848484', '989898', 'A1A1A1'],
    	colors: [
    	         ['FCF9CE', 'FBF49C', 'F6EC13', 'CCCB31']
    	],
    	selected: null


    },

	application: function()
	{
		var self 	= this;
		self.el 	=  $("#root").empty();
		self.root   = new janecee.root(self.el);
	},

	root: function(parent)
	{
		var self        = this;
		self.parent     = parent;
		self.bg         = $$div(parent, "bg");
		self.content    = $$div(parent, "content");
		self.world_map  = $$div(parent).attr('id','world_map');
		self.menu_bg    = $$div(parent, "menu_bg");
		self.menu_el    = $$div(parent, "menu_container");
		self.logo       = $$div(parent, "logo", function(){ navigate(self.tree_root,true); });
		self.logo.mouseover(function(){ self.logo.css('opacity',.3)});
		self.logo.mouseout(function(){ self.logo.css('opacity',1)});

		raphael_world_map.s = .77;
		raphael_world_map.ty = 10;

		self.set_value = function(value)
		{
      self.tree_root = value;

			self.menu_el.empty();
			self.content.empty();
			self.world_map.empty();

			var colors = find_node_by_id("/site_data/site_colors",value);
			var cities = find_node_by_id("/site_data/site_geo_data",value);
			if (colors!=null)
			{
				try {
				var c = strip_tags( colors.body[2] );
				c = JSON.parse('['+c+']');
				janecee.palette.colors = c;
				} catch(e){console.log(":ERROR",e);}
			}
			if (cities!=null)
			{
				try {
				var c = '{'+$(cities.body[2]).text()+'}';
          var c2 = '';
          for (var i=0; i< c.length; i++) {
            var cca = c.charCodeAt(i);
            if (cca>31 && cca<128)
              c2 += c.charAt(i);
          }
				c = JSON.parse(c2);
				world_map_cities = c;
				} catch(e){console.log(":ERROR",e,c);}
			}

			self.menu = new janecee.menu(self.menu_el, value);
			//try{
			raphael_world_map.init('world_map',{ "fill": "#e6e6e6", "stroke": "#a0a0a0", "stroke-width": 1, "stroke-linejoin": "round" });
			//!raphael_world_map.hide();
			raphael_world_map.set_value(value, function(node_list){ self.menu.create_subnav2(node_list); });
			//}catch(e){}//android and blackberry don't support raphael
		}

		self.navigate = function(node)
		{
      if ($.type(node) === "string")
        node = find_node_by_id(node, self.tree_root);
			janecee.palette.selected = janecee.palette.colors[ Math.floor(Math.random()*janecee.palette.colors.length) ];

			self.menu.navigate(node);

			self.bg.empty();
			self.menu_bg.hide();
			self.content.empty();
			raphael_world_map.hide();

			var c = function()
			{
				self.content.empty();
				self.menu_bg.show();
				self.menu_bg.css({'width':'420px'});
				if (node == self.tree_root)
					return new janecee.home(self.bg, node);

				self.menu_bg.css({'width':'100%'});

				var type = node.template;
				switch (type)
				{
					case "LandingPage":
						return new janecee.landing(self.content, node);
					case "Portfolio":
						return new janecee.portfolio(self.content, node);
					case "Contact":
						return new janecee.contact(self.content, node);
					case "InformationPage":
						var st = node.body[0].toLowerCase();
						switch (st)
						{
							case "map":
								return new janecee.map(self.content, node);
							default:
								return new janecee.info(self.content, node, self.menu.subnav_size!=1);
						}
					case "CVPage":
						return new janecee.cv(self.content, node);
				}
			}
			var a = function()
			{
				self.content.empty();
				$$div(self.content,'pattern1').css({'top': '0px','left':'-5px', 'height': '100%', 'opacity': .1}).fadeOut(220,c);
			}
			a();
		}
	},

	menu: function(parent,tree_root)
	{
		var self 		= this;
		self.parent 	= parent;
		self.tree_root 	= tree_root;
		self.max 		= 5;
		self.at 		= 0;

		self.navigate = function(node)
		{
			self.at = 0;
			self.init(node);
		};

		self.init = function(node)
		{
			self.parent.empty();
			var cc = function(m) { return $$div(self.parent, 'menu_'+m); }
			self.l0			= [ cc('l0a'), cc('l0b'), cc('l0c'), cc('l0d')  ];
			self.l1			= [ cc('l1a'), cc('l1b') ];
			self.l2			= cc('l2');

			var a = [];
			if (node != null)
			{
				a = ancestors(node);
				a.unshift(node);
			}

			//get level 0
			var level0 = tree_root.pages;
			var work_children = null;
			for (var i=0; i<level0.length; i++)
			{
				var n = level0[i];
				var title = n.title;
				if (title.toLowerCase() == "work") { work_children = n.pages; continue; } //grab 'work'
				if (i>=self.l0.length)
					continue;
				var mb = $$button(self.l0[i], title, n, function(e){  navigate(e.data); }, "menu_item");
				if (index_of(a,n)!=-1)
				{
					mb.addClass('selected');
					self.create_subnav(n,a);
				}
			}

			var wcl = work_children.length;
			var color = janecee.palette.selected[2];
			if (color=='F6EC13') color = janecee.palette.selected[3];
			$("a").globalcss("color","#"+color);
			for (var i=0; i<wcl; i++)
			{
				var n = work_children[i];
				var title = n.title;
				var c = Math.floor(i/(wcl/2));
				var wb = $$button(self.l1[c], "<b>"+title+"</b>", n, function(e){ navigate(e.data,true); }, "menu_item");
				if (a.length==2)
					wb.css('color','#ccc');
				else
					wb.css('color',"#"+color);
				if (index_of(a,n)!=-1)
				{
					wb.addClass('selected');
					self.create_subnav(n,a);
				}
			}
		}

		self.create_subnav = function(node,ancestors)
		{
			if (node == self.tree_root)
			{
				self.l2.empty();
				return;
			}
			var node_list = node.pages;
			var idx = index_of(node_list,ancestors[0]);
			if (idx==-1)
				self.at = 0;
			else
				self.at = Math.floor(idx/self.max) * self.max;
			self.create_subnav2(node_list, ancestors);
		};

		self.create_subnav2 = function(node_list,ancestors)
		{
			self.l2.empty();

			var i = 0;
			self.subnav_size = node_list.length;
			var seen = []

			for (i=self.at; i<self.at+self.max && i<self.subnav_size; i++)
			{
				var n = node_list[i];
				var title = n.title;
				if($.inArray(title, seen) != -1)
					continue;

				//if (seen.indexOf(title)!=-1)
				//	continue;
				seen.push(title);
				var sb = $$button(self.l2, title, n, function(e){ navigate(e.data); }, "menu_item");
				if (ancestors!=null && index_of(ancestors,n)!=-1)
					sb.addClass('selected');
			}
			if (i<self.subnav_size)
			{
				$$button(self.l2, "Next 5", null, function(e){
						self.at+=self.max; self.create_subnav2(node_list,ancestors); }, "menu_item menu_item_next");
			}
			if (self.at>0)
			{
				$$button(self.l2, "Previous 5", null, function(e){
						self.at-=self.max; self.create_subnav2(node_list,ancestors); }, "menu_item menu_item_prev");
			}

		}
	},

	home: function(parent,node)
	{
		var self        = this;

		self.img1 		= $$div(parent, "home1");
		self.img2 		= $$div(parent, "home2");
		self.pattern0 	= $$div(parent, "pattern0");
		self.pattern1 	= $$div(parent, "pattern1");
		//
		var imgs = [];
		for (var i=0; i<node.resources.length; i++)
			imgs[i] = node.resources[i];
		var s0 = Math.round(Math.random()*(imgs.length-1));
		var s1 = s0;
		while (s1 == s0)
			s1 = Math.round(Math.random()*(imgs.length-1));
		var r0 = imgs[s0];
		var r1 = imgs[s1];
		for (var i=0; i<10; i++)
		{
			$$image(self.img1, r0, {preview_width: 500, preview_height: 500,
				width: 205, height: 220, scale: 'full_bleed' })
				.css({position: "absolute", left: (i*210)+"px"});
		}
		for (var i=0; i<20; i++)
			$$image(self.img2, r1, {preview_width: 300, preview_height: 300,
				width: 100, height: 110, scale: 'full_bleed' })
				.css({position: "absolute", left: (i*105)+"px"});
	},

	landing: function(parent,node)
	{
		var self        = this;

		var p = $$div(parent,'landing_container');
		var b = 205;
		var l = 100;
		var g = 5;
		var bg = b+g;
		var lg = l+g;
		for (var i=0; i<4; i++)
			$$box(p,i*bg,0,b,b+15,janecee.palette.selected[i]);
		for (var i=0; i<8; i++)
			$$box(p,i*lg,bg+15,l,l+10,janecee.palette.gray[i]);

	},

	portfolio: function(parent,node)
	{
		var self        = this;

		var title 		= node.title;
		var description = node.body.replace(/<P> *\[.*\] *<\/P>/g,'');
		var images 		= node.resources;

		self.pattern 	= $$div(parent, "pattern2");
		self.col0 	= $$div(parent, "col0");
		self.col1 	= $$div(parent, "col1");

		for (var i=0; i<images.length; i++)
		{
			var img = images[i];
			$$image(self.col0, img, {preview_width: 415, preview_height: 1000});
			self.col0.append(img.description);
			self.col0.append('<br/>');
		}
		self.col1.html("<b>"+title+"</b><br/>"+description+"<br/>")
	},

	info: function(parent,node,show_title)
	{
		var self        = this;

		var d = "";
		for (var i=0; i<node.body.length; i++)
			d += node.body[i]+"<br/>";

		var title = show_title ? node.title : null;
		janecee.render_info(self,parent,title,d,node.resources);

	},

	map: function(parent,node)
	{
		var self        = this;

		$$div(parent, "map_bg");
		$$div(parent, "pattern3");

		raphael_world_map.show();
	},

	contact: function(parent,node)
	{
		var self        = this;

//		var d = "";
//		if (!empty(data.overview))
//			d += ""+data.overview;
//		if (!empty(data.directions))
//			d += ""+data.directions;
//		if (!empty(data.address_line_1))
//			d += data.address_line_1+"/><br/>";
//		if (!empty(data.address_line_2))
//			d += data.address_line_2+"<br/>";
//		if (!empty(data.city))
//			d += data.city+" ";
//		if (!empty(data.state))
//			d += data.state;
//		if (!empty(data.city) || !empty(data.state))
//			d += "<br/>";
//		if (!empty(data.country))
//			d += data.country;
//		if (!empty(data.phone_no))
//			d += "Phone "+data.phone_no+"<br/>";
//		if (!empty(data.fax_no))
//			d += "Fax "+data.fax_no+"<br/>";
//		if (!empty(data.mobile_no))
//			d += "Mobile "+data.mobile_no+"<br/>";

//		if (!empty(data.email))
//			d += "<a href='mailto:"+data.email+"'>"+data.email+"</a>";

		janecee.render_info(self,parent,data.title,d,data.images);

		var email_empty_txt = 'email address';
		var name_empty_txt = 'name';
		var send_label = 'SEND ME INFORMATION';
		self.col1.html("<b>"+data.title+"</b><br/>"+d+"<br/><form action=''>" +
				"<input type='text' value='"+email_empty_txt+"' id='contact_email'/><br/>" +
				"<input type='text' value='"+name_empty_txt+"' id='contact_name'><br/><br/>" +
				"<div id='contact_submit'>"+send_label+"</div>" +
				"</form><br/><br/>");

		$('#contact_email').focus(function(){
			if ($(this).val()==email_empty_txt)
				$(this).val('');
		}).blur(function(){
			if ($(this).val()=='')
				$(this).val(email_empty_txt);
		});
		$('#contact_name').focus(function(){
			if ($(this).val()==name_empty_txt)
				$(this).val('');
		}).blur(function(){
			if ($(this).val()=='')
				$(this).val(name_empty_txt);
		});
		$("#contact_submit").click(function(){
			var ev = $('#contact_email').val();
			var nv = $('#contact_name').val();
			
			var email_filter =  /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;			
			if (ev=='' || ev==email_empty_txt || !email_filter.test(ev))
			{
				alert('Please enter a valid email address');
				return;
			}
			self.col1.html("<b>Working...</b><br/><br/><br/><br/><br/>");
			send_message([ev,"Contact Cee Architects",nv+" "+ev+" wants info about "+escape(data.title)], function(){
				self.col1.html("<b>Thanks</b><br/>We will be in touch.<br/><br/><br/><br/><br/><br/>");
			})
		});
	},

	render_info: function(self,parent,title,descr,images)
	{
		self.pattern 	= $$div(parent, "pattern2");
		self.col0 	= $$div(parent, "col0");
		self.col1 	= $$div(parent, "col1");

		var b = 205;
		var l = 100;
		var g = 5;
		var bg = b+g;
		var lg = l+g;
		for (var i=0; i<2; i++)
		{
			var bb = $$box(self.col0,i*bg,0,b,b+15,janecee.palette.selected[i]);
			if (images.length>i)
			{
				var res = images[i];
				$$image(bb, res, {preview_width: 500, preview_height: 500,
					width: 206, height: 221, scale: 'full_bleed' })
			}
		}
		for (var i=0; i<4; i++)
			$$box(self.col0,i*lg,bg+15,l,l+10,janecee.palette.gray[i])

		var s = "";
		if (title!=null)
			s+= "<b>"+title+"</b><br/>";
		s += descr+"<br/>";
		self.col1.html(s);
	},

	cv: function(parent,node)
	{
		var self        = this;


	}


}






// utils // move?


function empty(o)
{
	if (o == null) return true;
	if (o instanceof Array && o.length==0) return true;
	if (o == "" || strip_tags(o) == "") return true;
	return false;
}
function get_resources(images)
{
	var res = [];
	if (images==null)
		return res;
	for (var i=0; i<images.length; i++)
		res.push(images[i]);
	return res;
}
function index_of(a,t)
{
	for (var i=0; i<a.length; i++)
	{
		if (a[i]==t)
			return i;
	}
	return -1;
}

