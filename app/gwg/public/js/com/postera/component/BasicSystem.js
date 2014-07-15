vjo.ctype('com.postera.component.BasicSystem') //< public
   .needs('com.pagesociety.util.TreeUtil')
   .needs('com.pagesociety.ui.Component')
   .needs('com.pagesociety.util.StringUtil')
.inherits('com.pagesociety.web.PosteraSystemsModule')

.props({

})
.protos({
	
	logo:null,//<org.jquery.jQuery 
	logotype:null,//<org.jquery.jQuery 
	content:null,//<Component
	content_view:null,//<Component
	view_package: null,//<Object
	style_props: null,//<Object
	portfolio_length_offset: 1, //<protected int

 	//> public constructs(String base_url, String code_root, boolean in_styler, Object view_package, Object style_props) 
	constructs : function(base_url,code_root,in_styler,view_package,style_props)
	{
		var self = this; //<BasicSystem
		self.base(base_url,code_root,in_styler,$("#system_root"));
		self.view_package = view_package;
		self.style_props = style_props;
		
		// component init, ... the logo
		self.logo = self.$div(self.element, 'logo'); 
		self.logotype = self.$div(self.logo, 'type'); 
		self.logotype.click(function()
			{
				self.select_menu_item(self.root_node, 0);
			});
		
		//content
		self.content = new com.pagesociety.ui.Component(self, { className: 'content'});
		
		$(document.body).bind('touchmove', function(e)
		{
			var touches = e.originalEvent.touches;
			if (!self.touchmove && touches.length==1)
				e.preventDefault();
			if (touches.length==2)
			{
				var center_x = touches[1].pageX + (touches[0].pageX - touches[1].pageX)*.5;
				var center_y = touches[1].pageY + (touches[0].pageY - touches[1].pageY)*.5;
				self.on_scale(center_x,center_y,e.originalEvent.scale);
				e.preventDefault();
			}
		});
//		$(document.body).bind('gesturechange', function(e)
//		{
//			if (!self.touchmove)
//				e.preventDefault();
//			console.log('gesure change')
//		});
//		$(document.body).bind('orientationchange', function(e)
//		{
//			//console.log(window.orientation);
//			console.log($(window).width());
//		});


		$(document.body).bind('orientationchange', function(e)
		{
			self.setWidth(document.documentElement.clientWidth);
			self.setHeight(document.documentElement.clientHeight);
			
			//update display on orientation change
			self.display_node(self.selected_node, self.selected_index);
		});
		
//		(function(w){
//		
//			// This fix addresses an iOS bug, so return early if the UA claims it's something else.
//			var ua = navigator.userAgent;
//			if( !( /iPhone|iPad|iPod/.test( navigator.platform ) && /OS [1-5]_[0-9_]* like Mac OS X/i.test(ua) && ua.indexOf( "AppleWebKit" ) > -1 ) ){
//				return;
//			}
//		
//		    var doc = w.document;
//		
//		    if( !doc.querySelector ){ return; }
//		
//		    var meta = doc.querySelector( "meta[name=viewport]" ),
//		        initialContent = meta && meta.getAttribute( "content" ),
//		        disabledZoom = initialContent + ",maximum-scale=1",
//		        enabledZoom = initialContent + ",maximum-scale=10",
//		        enabled = true,
//				x, y, z, aig;
//		
//		    if( !meta ){ return; }
//		
//		    function restoreZoom(){
//		        meta.setAttribute( "content", enabledZoom );
//		        enabled = true;
//		        self.content.element.show();
//		    }
//		
//		    function disableZoom(){
//		        meta.setAttribute( "content", disabledZoom );
//		        enabled = false;
//		        self.content.element.hide();
//		    }
//		
//		    function checkTilt( e ){
//				aig = e.accelerationIncludingGravity;
//				x = Math.abs( aig.x );
//				y = Math.abs( aig.y );
//				z = Math.abs( aig.z );
//		
//				// If portrait orientation and in one of the danger zones
//		        if( (!w.orientation || w.orientation === 180) && ( x > 7 || ( ( z > 6 && y < 8 || z < 8 && y > 6 ) && x > 5 ) ) ){
//					if( enabled ){
//						disableZoom();
//					}        	
//		        }
//				else if( !enabled ){
//					restoreZoom();
//		        }
//		    }
//		
//			w.addEventListener( "orientationchange", restoreZoom, false );
//			w.addEventListener( "devicemotion", checkTilt, false );
//		
//		})( window );
		
//		$(document.body).bind('gesturechange', function(e)
//		{
//			if (!self.touchmove)
//				e.preventDefault();
//			console.log('gesure change')
//		});

		
	},
	
	
	//>protected  void on_scale(int x, int y, Number s)
	on_scale:function(x,y,s)
	{
		//console.log(s+" "+$(document).css('-webkit-transform'));
		if (s<1)
			return;
		var ss = 'scale3d('+s+','+s+',1)';
		var to = x+'px '+y+'px';
		$("#wrap").css({
			'transform':ss,
			'-webkit-transform':ss,
			'-moz-transform':ss,
			'transform-origin':to,
			'-webkit-transform-origin':to,
			'-moz-transform-origin':to
		});
	},
	
	//>protected void on_init_system(com.pagesociety.persistence.Entity root)
	on_init_system:function(root)
	{
		var self = this; //<BasicSystem
		//console.log(root._attributes.data._attributes.title);
//		if (self.properties.logo != null)
//		{
//			var logo_id = Number(self.properties.logo);
//			self.do_module("PosteraSystemSupportResource/GetResourceURL",[logo_id], function(url)
//			{
//				var $logo = $('<img />');
//				$logo.attr('src',url);
//				$logo.load(function(){
//					self.resize();
//				});
//				self.logo.append($logo);
//			});
//		}
//		else
//		{
//			self.logotype.text(root._attributes.data._attributes.title);
//		}
	},
	
	
	//>protected void display_node(com.pagesociety.persistence.Entity node, int offset)
	display_node: function(node, offset)
	{
		var self = this; //<BasicSystem
	
		var a = com.pagesociety.util.TreeUtil.getAncestors(node);
		var at_root = a.length == 0 || node.eq(self.root_node);
		var leaf = com.pagesociety.util.TreeUtil.getFirstLeaf(node);
		var at_leaf = node == leaf;
		if (self.style_props.skipToLeaf && !at_root && !at_leaf)
			node = leaf;
		self.selected_node = node;
		
		var type = at_root ? 'Home' : node._attributes.data._type;
		if (type == 'ExternalLink')
		{
			window.open(node._attributes.data._attributes.url);
		}
		
		if (self.content_view != null)
		{
			if (self.content_view.user_object == node)
			{
				if (self.content_view['select']!=null)
					self.content_view['select'](offset);
				return;
			}
		}
		self.content.empty();
		if (self.view_package[type]==null)
		{
			throw new Error("Cannot find "+type);
		}
		self.content_view = new self.view_package[type](self.content);
		self.content_view.data(at_root ? self.root_node : node);
		if (self.content_view['select'] != null)
			self.content_view['select'](offset);
		self.content_view.addListeners('navigate', function(e) 
			{ 
				if (e.node == null)
					e.node = self.selected_node;
				if (e.index == null)
					e.index = 0;
				self.select_menu_item(e.node, e.index, false); 
			});
		self.content_view.addListeners('next', function(e) 
			{ 
				var prev = self.getNextNode(self.selected_node, self.selected_index);
				self.select_menu_item(prev.node, prev.idx);
			});
		self.content_view.addListeners('prev', function(e) 
			{
				var prev = self.getPrevNode(self.selected_node, self.selected_index);
				self.select_menu_item(prev.node, prev.idx);
			});
	},
	
	
	
	//>public Object getNext(com.pagesociety.persistence.Entity origin, int idx)
	getNextNode: function(origin,idx)
	{
		var self = this;
		if (origin._attributes.data._type=='Portfolio')
		{
			var children = origin._attributes.data._attributes.images;
			if (idx<children.length - self.portfolio_length_offset)
			{
				return {node: origin, idx: idx+1};
			}
		}
		//otherwise, get 'next' node
		var next = com.pagesociety.util.TreeUtil.getFirstChild(origin);
		if (next==null)
			next = com.pagesociety.util.TreeUtil.getSibling(self.root_node, origin);
		if (next==null)
			next = com.pagesociety.util.TreeUtil.getAncestorsSibling(self.root_node, origin);
		if (next==null)
			next = self.root_node;
			
		return {node: next, idx: 0};
	},
	
	//>public Object getPrevNode(com.pagesociety.persistence.Entity origin, int idx)
	getPrevNode: function(origin,idx)
	{
		//step thru images of portfolio
		var children;
		if (origin._attributes.data.type == 'Portfolio')
		{
			children = origin._attributes.data._attributes.images;
			if (idx>0)
			{
				self.select_menu_item(origin, idx -1);
				return;
			}
		}
		//otherwise, get 'previous' node
		var prev = com.pagesociety.util.TreeUtil.getPreviousSibling(self.root_node, origin);
		if (prev==null)
			prev = origin._attributes.parent_node;
		if (prev==null)
			prev = self.root_node;
		   
		var sel_idx=0;
		if (prev._attributes.data._type=='Portfolio')
		{
			children = prev._attributes.data._attributes.images;
			if (children!=null && children.length!=0)
				sel_idx = children.length - self.portfolio_length_offset;
		}
		
		return {node: prev, idx:sel_idx};
	}
	


})
.endType();