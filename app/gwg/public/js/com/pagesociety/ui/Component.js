vjo.ctype("com.pagesociety.ui.Component")//<public
   .needs("com.pagesociety.ui.ComponentDimension")
.protos({
	
	application:null,//<protected com.pagesociety.ui.Root
	parent: null, //<protected Component
	options: null,
	children: null, //<public Component[]
	
	// renderer & event mechanism provided by css & jquery 
	element: null, //<public org.jquery.jQuery
	// except width & height which don't work so well w/ css
	width:null, //<protected ComponentDimension
	height:null, //<protected ComponentDimension
	listeners:null,//<Object
	user_object:null,//<public Object
	
	//>public constructor (Component parent)
	//>public constructor (Component parent, Object options)
	constructs: function(parent, options) 
	{
		var self = this; //<Component
		if (parent == null)
			throw new Error("Cannot create a component without a parent!");
		
		self.options = self.extend({ tag: 'div', parent: null }, options);
		//logical parent/app
		self.parent = parent;
		if (parent.application)
			self.application = parent.application;
		self.children = [];
		self.listeners = {};
		//jquery element
		self.element = self.$el(self.options.parent,self.options.tag,self.options.className,self.options.click,self.options.type);
		if (self.parent != this)
			self.parent.append(self);
		if (self.options.css!=null)
			self.css(self.options.css);
		//component size model
		self.width = new com.pagesociety.ui.ComponentDimension(com.pagesociety.ui.ComponentDimension.WIDTH);
		self.height = new com.pagesociety.ui.ComponentDimension(com.pagesociety.ui.ComponentDimension.HEIGHT);
		// callback
		if (self.parent!=null && self.parent.options.onaddchild!=null)
			self.parent.options.onaddchild(self);
		// set data callback
		if (self.options.data)
			if (typeof(self.options.data)=='function')
				self.options.data(function(r){ self.data(r); });
			else
				self.data(self.options.data);
	},
	
	//>public void append(Component c)
	append: function(c)
	{
		var self = this; //<Component
		if (c.element.parent().length == 0)
			self.element.append(c.element);
		self.children.push(c);
	},
	
	//>public void destroy()
	destroy: function()
	{
		var self = this; //<Component
		for (var i=0; i<self.children.length; i++)
			self.children[i].destroy();
		self.element.empty();
		self.element.remove();
		self.element = null;
		var idx = self.parent.children.indexOf(self);
		if (idx != -1)
			self.parent.children.splice(idx, 1);
		self.application = null;
		self.parent = null;
		self.listeners = null;
		self.user_object = null;
	},
	
	//>public void data(Object data)
	data: function(o)
	{
		var self = this; //<Component
		self.user_object = o;
		// by convention, render_element_from_model should be called
	},

	//>public void addListener(String type, Function callback)
	addListener: function(type,callback)
	{
		var self = this; //<Component
		if (self.is_native_event(type))
			self.element.bind(type,callback);
		else
		{
			var listeners = self.listeners[type];//<Array
			if (listeners == null)
				listeners = [];
			if (listeners.indexOf(callback)==-1)
			{
				listeners.push(callback);
				self.listeners[type] = listeners;
			}
		}	               
	},
	
	//>public void addListener(String type, Function callback)
	addListeners: function(type,callback)
	{
		var self = this; //<Component
		self.addListener(type, callback);
		for (var i=0; i<self.children.length; i++)
			self.children[i].addListener(type,callback);
	},
	
	//>public void removeListeners(String type)
	removeListeners: function(type)
	{
		var self = this; //<Component
		if (self.is_native_event(type))
			self.element.unbind(type);
		else
			self.listeners[type] = null;
	},
	
	//>public void dispatch(String event_type)
	//>public void dispatch(String event_type, Object data)
	dispatch: function(type,data)
	{
		var self = this; //<Component
		if (self.listeners == null)//destroyed
			return;
		var listeners = self.listeners[type];//<Array
		if (listeners == null)
			return;
		for (var i=0; i<listeners.length; i++)
			listeners[i](data);
	},
	
	//>private boolean is_native_event(String type)
	is_native_event: function(type)
	{
		return ["click","mousedown","mouseup","mouseover","mousemove"].indexOf(type) != -1;
	},
	
	
	//>public void each(Array arr, Function closure)
	each: function(arr,f)
	{
		for (var i=0; i<arr.length; i++)
			if (f(arr[i],i)) break
	},
	
	delays: [],
	//>public int delay(Function closure, int duration)
	delay: function(closure,duration)
	{
		var id = setTimeout(closure,duration);
		this.delays.push(id);
		return id;
	},
	
	//>public void cancelDelay()
	//>public void cancelDelay(int id)
	cancelDelay: function(id)
	{
		if (id==null)
		{
			for (var i=0; i<this.delays.length; i++)
				clearTimeout(this.delays[i]);
			this.delays = [];
		}
		else
		{
			var idx = jQuery.inArray(id, this.delays);
			if (idx!=-1)
			{
				this.delays.splice(idx,1);
				clearTimeout(idx);
			}
		}
	},
	
	/**
	 * creates a new object and adds props of both. 
	 * does not modify either a or b
	 */
	//>public Object extend(Object a, Object b)
	extend: function(a,b)
	{
		var o = {};
		if (a!=null)
			for (var p in a)
				o[p] = a[p];
		if (b!=null)
			for (var p in b)
				o[p] = b[p];
		return o;
	},
	
	/* display */
	//>public Number getTop()
	getTop: function()
	{
		return this.element.position().top;
	},
	
	//>public Number getLeft()
	getLeft: function()
	{
		return this.element.position().left;
	},
	
	
	//>public void setWidth(float w)
	setWidth: function(w)
	{
		this.width.setAbsolute(w);
		this.updatew();
	},
	
	//>public void setWidthPercent(Number w)
	//>public void setWidthPercent(Number w, Number d)
	setWidthPercent: function(w,d)
	{
		this.width.setPercent(w/100, d);
		this.updatew();
	},
	
	//>public void setWidthDelta(Number d)
	setWidthDelta: function(d)
	{
		this.width.setDelta(d);
		this.updatew();
	},
	
	//>public void unsetWidth()
	unsetWidth: function()
	{
		this.width.unset();
		this.updatew();
	},
	
	//>protected void updatew()
	updatew: function()
	{
		if (this.width.isUnset())
			return;
		this.element.width(this.getWidth());
	},
	
	//>public Number getWidth()
	getWidth: function()
	{
		return this.width.getValue(this);
	},
	
	//>public void setHeight(float w)
	setHeight: function(w)
	{
		this.height.setAbsolute(w);
		this.updateh();
	},
	
	//>public void setHeightPercent(Number w)
	//>public void setHeightPercent(Number w, Number d)
	setHeightPercent: function(w,d)
	{
		this.height.setPercent(w/100, d);
		this.updateh();
	},
	
	//>public void setHeightDelta(Number d)
	setHeightDelta: function(d)
	{
		this.height.setDelta(d);
		this.updateh();
	},
	
	//>public void unsetHeight()
	unsetHeight: function()
	{
		this.height.unset();
		this.updateh();
	},
	
	//>protected void updateh()
	updateh: function()
	{
		if (this.height.isUnset())
			return;
		this.element.height(this.getHeight());
	},
	
	//>public Number getHeight()
	getHeight: function()
	{
		return this.height.getValue(this);
	},
	
	//>public void resize()
	resize: function()
	{
		var self = this; //<Component
		self.updateh();
		self.updatew();
		for (var i=0; i<self.children.length; i++)
		{
			self.children[i].resize();
		}
	},
	
	//>public void empty()
	empty: function(o) 
	{ 
		var self = this; //<Component
		for (var i=0; i<self.children.length; i++)
			self.children[i].destroy();
		self.children = [];
		self.element.empty();
	},
	
	//>public void onscreen(boolean b)
	onscreen: function(b)
	{
		
	},
	
	//>public Component bgcolor(String c)
	bgcolor: function(c)
	{
		var self = this; //<Component
		self.css({'background-color':c});
		return self;
	},

	//>public void opacity(float o)
	opacity: function(o)
	{
		this.css({'opacity':o});
	},

	//>public void attr(Object o)
	attr: function(o) { this.element.attr(o); },

	//>public void css(Object o)
	css: function(o) { this.element.css(o); },
	
	//>public void hasClass(Object o)
	hasClass: function(o) { this.element.hasClass(o); },
	
	//>public void addClass(Object o)
	addClass: function(o) { this.element.addClass(o); },
	
	//>public void show()
	show: function(){ this.element.show(); },
	
	//>public void hide()
	hide: function(){ this.element.hide(); },
	
	//>public void hideAll()
	hideAll: function()
	{
		var self = this; //<Component
		for (var i=0; i<self.children.length; i++)
			self.children[i].hide();
	},
	
	/* jQuery factory */
	//>protected org.jquery.jQuery $div()
	//>protected org.jquery.jQuery $div(org.jquery.jQuery $p)
	//>protected org.jquery.jQuery $div(org.jquery.jQuery $p, String class_name)
	//>protected org.jquery.jQuery $div(org.jquery.jQuery $p, String class_name, Function click_callback)
	$div: function($parent, class_name, click_callback)
	{
		return this.$el($parent,'div',class_name,click_callback);
	},

	//>protected org.jquery.jQuery $el(org.jquery.jQuery $p, String tag_name)
	//>protected org.jquery.jQuery $el(org.jquery.jQuery $p, String tag_name, String class_name)
	//>protected org.jquery.jQuery $el(org.jquery.jQuery $p, String tag_name, String class_name, Function click_callback)
	//>protected org.jquery.jQuery $el(org.jquery.jQuery $p, String tag_name, String class_name, Function click_callback, String type)
	$el: function($parent, tag_name, class_name, click_callback, type)
	{
		var $c = $('<'+tag_name+(type==null?'':' type="'+type+'"')+'></'+tag_name+'>');
		if (class_name!=null)
			$c.addClass(class_name)
		if (click_callback!=null)
			$c.click(click_callback);
		if($parent != null)
			$parent.append($c);
		return $c;
	},
	//>public boolean is_on_screen()
	is_on_screen: function() 
	{
		var self = this; //<Component
		var t = self.options.threshold ? self.options.threshold : 10;
		var by = $(window).height() + $(window).scrollTop();
		var ty = $(window).scrollTop();
		var rx = $(window).width() + $(window).scrollLeft();
		var lx = $(window).scrollLeft();
		var belowthefold = by <= self.element.offset().top - t;
		var rightoffold = rx <= self.element.offset().left - t;
		var abovethetop = ty >= self.element.offset().top  + self.element.height() + t;
		var leftofleft = lx >= self.element.offset().left + self.element.width() + t;
		return !belowthefold && !rightoffold && !abovethetop && !leftofleft;
    },
    
	//>protected void go(org.jquery.jQuery $el, Number x, Number y)
	//>protected void go(org.jquery.jQuery $el, Number x, Number y, int ms)
	//>protected void go(org.jquery.jQuery $el, Number x, Number y, int ms, String easing)
	//>protected void go(org.jquery.jQuery $el, Number x, Number y, int ms, String easing, Function on_complete)
	go_el: function($el,x,y,ms,easing,on_complete)
	{
		ms = ms ? ms : 0;
		if (easing==null)
			easing = 'default';
		var a = 'webkitTransitionEnd mozTransitionEnd oTransitionEnd msTransitionEnd transitionend';
		$el.unbind(a);
		$el.bind(a, function(ae) { 
			if (ae.target!=$el[0])
				return;
			if (on_complete)
				   on_complete();
		});
		var t = 'all '+(ms/1000)+'s ease-out';
		$el.css({
			'-webkit-transition': t,
			'-ms-transition': t, //sph: don't think this means anything until IE10. IE 9 doesn't support transitions
			'-moz-transition': t,
			'-o-transition': t,
			'transition': t
		});
	//	if (self.has3d)
	//	{
			var s =  'translate3d('+x+'px,0,0)' ;
			$el.css({
				'-webkit-transform':s, 
				'-moz-transform':s,
				'-ms-transform':s // this is meaningless, i think
				});
	//	}
	//	else
	//	{
	//		var s =  'translate('+(self.x + self.xoffset)+'px,0)';
	//		self.content.css({
	//			'-moz-transform':s,
	//			'-ms-transform':s, // IE9 partial bug fix. images don't slide, but they do appear (usually)
	//			'transform': s
	//			});
	//	}
	}
    
   
	
})
.endType();