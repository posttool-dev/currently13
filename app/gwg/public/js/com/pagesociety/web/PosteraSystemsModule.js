vjo.ctype('com.pagesociety.web.PosteraSystemsModule') //< public abstract
   .needs('com.pagesociety.web.ModuleConnection')
   .needs('com.pagesociety.web.ResourceModule')
   .needs('com.pagesociety.persistence.Entity')
   .needs('com.pagesociety.util.TreeUtil')
   .inherits('com.pagesociety.ui.Root')
.props({
	
	
})
.protos({

	code_root:null,//<public String
	site:null,//<public Entity
	tree:null,//<public Entity
	root_node:null,//<public Entity
	address:null,//<public String
	selected_node:null,//<public Entity
	selected_index:0,//<public int
	properties:null,//<public Object
	properties_complete:null,//<public Object
	in_styler:false,//<public boolean
	touchmove:false,//<public boolean  


	//>public constructor(String base_url, String code_root, boolean in_styler)
	//>public constructor(String base_url, String code_root, boolean in_styler, org.jquery.jQuery $el)
	constructs: function(base_url, code_root, in_styler, $el)
	{
		var self = this; //<PosteraSystemsModule
		self.base($el);
		self.code_root = code_root;
		self.in_styler = in_styler;
		com.pagesociety.web.ModuleConnection.BASE_URL = base_url;
		com.pagesociety.web.ResourceModule.init([ 
			{ resource_module_name: "Resource", resource_entity_name: "Resource", resource_base_url: "http://postera.s3.amazonaws.com/" },
			{ resource_module_name: "PosteraSystems",resource_entity_name: "SystemResource", resource_base_url:  "http://postera.com/system_resources/" },
			{ resource_module_name: "PosteraSystemSupportResource", resource_entity_name: "SystemSupportResource", resource_base_url: "http://postera.s3.amazonaws.com/" }
		]);
		self.touchmove = false;
	},
	
	

	//>protected abstract void on_init_system(Entity root_node)
	on_init_system:null,

	//>protected abstract void display_node(Entity node, int idx)
	display_node: null,

	

	
	
	//>public void init(String type, Object id)
	init: function(type, id)
	{
		var self = this; //<PosteraSystemsModule
//		self.do_module("PosteraSystems/GetSiteBy"+type, [ id ], function(site)
//		{
//			self.site			= site;
//			self.tree			= site._attributes.published_tree;
////			var system			= site._attributes.system;
//			var system_data 	= site._attributes.system_data;
//			self.properties_complete = null;
//			if (system_data!=null)
//				self.properties_complete = jQuery.parseJSON(system_data);
//			self.properties = {};
//			self.flatten_props(self.properties_complete, self.properties);
			self.do_module("/pages", [ self.tree._attributes.root._id ], function(node)
			{
				com.pagesociety.util.TreeUtil.addParents(node);
				self.update_node_description(node);
				self.root_node = node;
				self.tree._attributes.root = node;
				self.on_init_system(self.root_node);
				self.system_hookup_deep_linking();
			});
//		});
	},
	
	system_hookup_deep_linking:function()
	{
		var self = this; //<PosteraSystemsModule
		SWFAddress.addEventListener(SWFAddressEvent.CHANGE, function(event) 
	    {
			self.system_display(event.path);
	    });
		self.system_display(SWFAddress.getPath());
	},
	
	//>private void system_display({Number|String} id)
	system_display:function(id)
	{
		var self = this; //<PosteraSystemsModule
		if (self.address == id)
			return;
		self.address = id;
		var n = null;
		var idx = 0;
		if (id==null || id=='/')
			n = self.root_node;
		else
		{
//			if (!isNaN(id))
//			{
//				if (id<1) throw new Error("?");
//				n = com.pagesociety.util.TreeUtil.findById(Number(id), self.tree._attributes.root);
//			}
			if (self.in_styler && id.indexOf("/style/")==0)
			{
				id = id.split("/")[2];
				n = com.pagesociety.util.TreeUtil.findById(Number(id), self.tree._attributes.root);
			}
			else //it must be the permalink, aka node_id
			{
				var s = id.split("/");
				idx = parseInt(s.pop());
				id = s.join("/");
				if (id.indexOf("/")==0) 
					id = id.substring(1);
			    n = com.pagesociety.util.TreeUtil.findByNodeId(id, self.tree._attributes.root);
			}
		}
	    if (n == null)
	        n = self.root_node;
	    self.selected_node = n;
	    self.selected_index = idx;
	    var a = com.pagesociety.util.TreeUtil.getAncestors(self.selected_node);
	    a.push(self.selected_node);
	    var t = '';
	    for (var i=0; i<a.length; i++)
	    {
	    	t += a[i]._attributes.data._attributes.title;
	    	if (i!=a.length-1) t += " / ";
	    }
//	    SWFAddress.setTitle(t);
//	    setTimeout(function(){
//			// Hide the address bar!
//			window.scrollTo(0, 1);
//		}, 0);
self.display_node(self.selected_node, idx); 
	},
	
	getSelectedNodeId:function()
	{
		var self = this; //<PosteraSystemsModule
		return self.selected_node._id;
	},
	
	//>public void selectNodeWithOffset(long node_id, int offset)
	selectNodeWithOffset:function(node_id,offset)
	{
		var self = this; //<PosteraSystemsModule
		var n = com.pagesociety.util.TreeUtil.findById(node_id, self.tree._attributes.root);
		if (n==null) n = self.tree._attributes.root;
		self.select_menu_item(n, offset);
	},
	
	//>protected void select_menu_item(Entity node, int offset)
	//>protected void select_menu_item(Entity node, int offset, boolean force)
	select_menu_item:function(tree_node,offset, force)
	{
		var self = this; //<PosteraSystemsModule
		self.in_styler = true;
		if (self.in_styler)
			self.system_display(tree_node._attributes.node_id+"/"+offset);  // SWFAddress.setValue('/style/'+tree_node._id); //
		else
		{
			var xtra = "";
			if (force != null && force)
				xtra = "?____m="+Math.random();
			SWFAddress.setValue(tree_node._attributes.node_id+"/"+offset+xtra);
		}
	},
	
	
	update_node_description: function(node)
	{
		var self = this; //<PosteraSystemsModule
		var d = node._attributes.data;
		if (d._attributes.description == null)
		{
			var s = '';
			switch (d._type)
			{
			case 'InformationPage':
				s += "<p><b>"+d._attributes.sections[0]+"</b></p>";
				s += d._attributes.sections[1];
				s += d._attributes.sections[2];
				s += d._attributes.sections[3];
				break;
			case 'Contact':
				s += "<p><b>"+d._attributes.title+"</b></p>";
				s += ""+d._attributes.overview+"";
				s += ""+d._attributes.directions+"";
				s += ""+d._attributes.address_line_1+"<br/>";
				s += ""+d._attributes.address_line_2+"<br/>";
				s += ""+d._attributes.city+" ";
				s += ""+d._attributes.state+" ";
				s += ""+d._attributes.country+" ";
				s += ""+d._attributes.zip+"<br/>";
				s += "<a href='mailto:"+d._attributes.email+"'>"+d._attributes.email+"</a><br/>";
				s += ""+d._attributes.phone_no+"<br/>";
				s += ""+d._attributes.fax_no+"<br/>";
				s += ""+d._attributes.mobile_no+"<br/>";
				break;
			}
			d._attributes.description = s;
		}
		for (var i=0; i<node._attributes.children.length; i++)
			self.update_node_description(node._attributes.children[i]);
	},
	
	//>public void setStyleProps(Object props)
	setStyleProps: function(p)
	{
		var self = this;//<PosteraSystemsModule
		self.properties = {};
		self.properties_complete = p;
		self.flatten_props(p,self.properties);
		self.on_update_style_props();//dispatch("update_props");
	},
	
	//>protected void on_update_style_props()
	on_update_style_props: function(){},
	
	//>private Object flatten_props(Object props, Object flat_props)
	flatten_props:function(props,flat_props)
	{
		var self = this; //<PosteraSystemsModule
		if (props==null)
			return flat_props;
		for (var p in props)
		{
			if (p == "version")
				continue;
			if (jQuery.isArray(props[p]))
			{
				for (var j=0; j<props[p].length; j++)
				{
					if (props[p][j].selected)
					{
						flat_props["selection_"+p] = j;
						self.add_props(flat_props, props[p][j].properties);
					}
				}
			}
			else if (props[p] != null)
			{
				self.add_props(flat_props, props[p].properties);
			}
		}
		return flat_props;
	},
	
	add_props: function(o, props)
	{
		for (var s in props)
		{
			o[s] = props[s];
		}
	},
	
	// in style of cms

	//>protected void initJsStyler(long node_id, int image_idx) 
	initJsStyler:function(node_id,image_idx)
	{
		var self = this; //<PosteraSystemsModule
		if (image_idx < 0)
			image_idx = 0;
		self.do_module("PosteraSystems/GetCurrentEditSystem", [], function(edit_sys)
		{
			self.site			= edit_sys._attributes.site;
			var system_data 	= self.site._attributes.system_data;
			self.properties_complete = null;
			if (system_data!=null)
				self.properties_complete = jQuery.parseJSON(system_data);
			self.properties = {};
			self.flatten_props(self.properties_complete, self.properties);
			self.do_module("PosteraTreeModule/GetEditTree",[], function(edit_tree)
			{
				self.tree			 	= edit_tree;
				self.do_module("PosteraTreeModule/FillSystemNode", [self.tree._attributes.root._id ], function(node)
				{
					com.pagesociety.util.TreeUtil.addParents(node);
					self.update_node_description(node);
					self.root_node = node;
					self.tree._attributes.root = node;
					if (self.on_init_system)
						self.on_init_system(self.root_node);
					self.selectNodeWithOffset(node_id,image_idx);
				});
			});
		});
	}
	



})
.endType();