vjo.ctype('com.pagesociety.ui.component.EndlessTiles') //< public
   .needs('com.pagesociety.ui.component.SimpleTile')
.inherits('com.pagesociety.ui.Component')

.props({
	
})
.protos({

	content: null,//<org.jquery.jQuery
	prev_button: null,//<org.jquery.jQuery
	next_button: null,//<org.jquery.jQuery

	slides:null,//<protected Array
	cells:null,//<protected Array
    x: 0,//<Number
    xoffset: 0,//<Number
    idx:0,//<Number
	margin:0,//<<protected Object
	next_speed:0,//<<protected Number
	
	cell_renderer_f:null,//<Function
	prev_renderer_f:null,//<Function
	next_renderer_f:null,//<Function

	//>public constructor(Component parent)
	//>public constructor(Component parent, Object options)
	constructs: function(parent,options)
	{
		var self = this;//<EndlessTiles
		self.base(parent,options);
		self.cell_renderer_f = self.options.cell_renderer == null 
				? function(parent) { return new com.pagesociety.ui.component.SimpleTile(parent); }
				: self.options.cell_renderer;
		self.prev_renderer_f = self.options.prev_renderer == null 
				? function(){ return self.$div(self.element, 'prev').css({'opacity':.7}); }
				: self.options.prev_renderer;
		self.next_renderer_f = self.options.next_renderer == null 
				? function(){ return self.$div(self.element, 'next').css({'opacity':.7}); }
				: self.options.next_renderer;
		self.content = self.$el(self.element, 'ul', 'wrap');
		self.xoffset = self.options.xoffset || 0;
		self.x = 0;
		self.idx = 0;
		self.margin = options.margin || 0;
		self.next_speed = options.next_speed || 150;
		self.init_scroll();
		self.create_prev_next(); //sph: these buttons are not visible! should they be?
	},

		
	//>public void append(Component c)
	append: function(c)
	{
		var self = this; //<EndlessTiles
		self.content.append(c.element);
		self.children.push(c);
	},
	
	create_prev_next: function()
	{
		var self = this;//<EndlessTiles
		self.prev_button = self.prev_renderer_f();
		self.prev_button.bind(self.START_EV,function(){ self.prev(); }); //assumes init_scroll has been called
		self.prev_button.hide();
		self.next_button = self.next_renderer_f();
		self.next_button.bind(self.START_EV,function(){ self.next(); });
		self.next_button.hide();
	},
	
	//>public void data(Array slides)
	data: function(slides)
	{
		var self = this;//<EndlessTiles
		for (var i=0; i<self.children.length; i++)
		{
			self.children[i].onscreen(false);
			self.children[i].destroy();
		}
		self.base.data(slides);
		self.content.empty();
		self.children = [];
		self.slides = slides;
		self.cells = [];
		for (var i=0; i<self.slides.length; i++)
		{
			self.slides[i].idx = i; // add idx to slide
			self.create_slide(self.slides[i]);
		}
		self.do_layout();
		self.update_ui();
	},
	
	//>public void resize()
	resize: function() 
	{
		this.base.resize();
		this.do_layout();
	},
	
	do_layout: function()
	{
		var self = this;//<EndlessTiles
		var p = 0;
		var min = self.get_left();
		var max = self.get_right() + 15;
		if (self.children.length != 0 && self.children.length > self.idx)
		{
			self.go(-self.children[self.idx].getLeft(),0);
			//console.log(">"+self.idx+" "+self.children[self.idx].getLeft());
		}
		for (var i=0; i<self.children.length; i++)
		{
			var c = self.children[i];
			c.css({'left': p+'px'});
			var w = c.getWidth();
			var l = p + self.x;
			var os = l+w >= min && l <= max;
			//console.log("   "+i+" "+os);
			c.onscreen(os);
			p += w + self.margin;
		}
	},
	
	update_ui: function()
	{
		var self = this;//<EndlessTiles
		if (self.idx == self.children.length-1)
			self.next_button.hide();
		else
			self.next_button.show();
			
		if (self.idx == 0)
			self.prev_button.hide();
		else
			self.prev_button.show();
	},
	
	//>protected void updatew()
	updatew: function()
	{
		this.base.updatew();
		this.do_layout();
	},
	
	//>protected void updateh()
	updateh: function()
	{
		this.base.updateh();
		this.do_layout();
	},
	
	//>private Component create_slide(Entity slide)
	create_slide: function(slide)
	{
		var self = this;//<EndlessTiles
		if (slide == null)
			return;
		var c = self.cell_renderer_f(self);//<Component
		c.hide();//otherwise it flickers on the ipad
		c.css({ position: 'absolute', '-webkit-transform': 'translate3d(0, 0, 0)' });
		c.data(slide);
		c.show();
		return c;
	},
	
	get_left: function()
	{
		//var self = this;//<EndlessTiles
		return 0;
	},

	get_right: function()
	{
		var self = this;//<EndlessTiles
		return self.element.width();
	},
	
	
// horz scrolling stuff

    has3d: false,
    hasTouch: false,
    START_EV:null,
	MOVE_EV:null,
	END_EV:null,
	CANCEL_EV:null, 

    startX:0,//<Number
    pointX:0,//<Number
    dx:0,//<Number
    startTime:0,//<Number
	
	//>public void init_scroll()
	init_scroll: function()
	{
		var self = this;//<EndlessTiles
		
		self.has3d = 'WebKitCSSMatrix' in window && 'm11' in new WebKitCSSMatrix();
		self.hasTouch = 'ontouchstart' in window;
		
		var pos = self.element.css('position');
		if (pos != 'relative' && pos != 'absolute')
			self.element.css('position', 'relative');
		self.content.css({
			'position': 'absolute', 
			'top':0+'px',
			'-webkit-perspective': 1000,
			'-webkit-backface-visibility': 'hidden'
		});
		self.go(0,0,0);
		
		if (self.hasTouch)
		{
			self.START_EV = 'touchstart';
			self.MOVE_EV = 'touchmove';
			self.END_EV = 'touchend';
			self.CANCEL_EV = 'touchcancel';
			
			self.content.bind(self.START_EV,function(e)
			{
				self._start(e);
			});
		}
		else
		{
			self.START_EV = 'click';
			if (self.options.add_default_click_handler)
				self.content.bind(self.START_EV, function(){ 
					self.next();//)dispatch('next');
				});//could be self.next if we deal w/ the last child
		}

	},
	

	_start: function(jqe)
	{
		var self = this;//<EndlessTiles
		var e = jqe.originalEvent;
		if (e.touches.length!=1)
			return;
			
		var point = e.touches[0];

		self.startX = self.pointX = point.pageX;
		self.dx = 0;
		self.startTime = new Date().getTime();

		self.application.element.bind(self.MOVE_EV, function(e){ self._move(e); });
		self.application.element.bind(self.END_EV, function(e){ self._end0(e); });
		self.application.element.bind(self.CANCEL_EV, function(e){ self._end0(e); });
	},
	

	_move: function(jqe)
	{
		var self = this;//<EndlessTiles
		var e = jqe.originalEvent;
		var point = e.touches[0];
		var deltaX = point.pageX - self.pointX;
		self.dx += deltaX;
		self.pointX = point.pageX;
		if (deltaX!=0)
			self.go(self.x + deltaX, 0);
	},
	
	_end0: function(e)
	{
		var self = this;//<EndlessTiles
		self.application.element.unbind(self.MOVE_EV);
		self.application.element.unbind(self.END_EV);
		self.application.element.unbind(self.CANCEL_EV);

		var s = 50;//Math.abs(self.speed);
		var dx = self.dx * .5; //s == 0 ? 0 : (1/self.speed) * 50;
		
		self.go(self.x + dx, 0, s, 'linear', function(){ self._end(); });
	},
	
	_end: function()
	{
		var self = this;//<EndlessTiles

		//var t = new Date().getTime();
		var last_idx = self.idx;
		
		if (self.dx>0)
			self.idx = Math.max(0, self.idx-1);
		else if (self.dx<0)
			self.idx = Math.min(self.children.length-1, self.idx+1);
	
		var d = self.children[self.idx].getLeft();
		self.go(-d, 0, 150, null, function(){ self.do_layout(); });
		self.update_ui();
		if (self.idx != last_idx)
			self.delay(function(){
				self.dispatch('navigate', { index: self.idx });
			}, 200);
	},
	
	//>public void next()
	next: function()
	{
		var self = this;//<EndlessTiles
        self.do_next();
        self.dispatch('navigate', { index: self.idx });
	},

	do_next: function()
	{
		var self = this;//<EndlessTiles
		if (self.idx < self.slides.length -1)
			self.idx++;
		self.go(-self.children[self.idx].getLeft(), 0, self.next_speed, null, function(){ self.do_layout(); });
		self.update_ui();
	},

	//>public void prev()
	prev: function()
	{
		var self = this;//<EndlessTiles
		self.do_prev();
		self.dispatch('navigate', { index: self.idx });
	},

	do_prev: function()
	{
		var self = this;//<EndlessTiles
		if (self.idx > 0)
			self.idx--;
		self.go(-self.children[self.idx].getLeft(), 0, self.next_speed, null, function(){ self.do_layout(); });
		self.update_ui();
	},

	//>public void go(Number x, Number y)
	//>public void go(Number x, Number y, int ms)
	//>public void go(Number x, Number y, int ms, String easing)
	//>public void go(Number x, Number y, int ms, String easing, Function on_complete)
	go: function(x,y,ms,easing,on_complete)
	{
		var self = this;//<EndlessTiles
		ms = ms ? ms : 0;
		self.x = x ;
		self.go_el(self.content, self.x + self.xoffset, y, ms, easing, on_complete);

	}, 
	
	
	//>public void select(int idx)
	select: function(idx)
	{
        //console.log("endless @select: idx",idx)
		var self = this;//<EndlessTiles
		if (idx == self.idx)
			return;
		if (idx == self.idx + 1)
		{
			self.do_next();
			return;
		}
		if (idx !=0 && idx == self.idx - 1) //sph: added condition for 0; else, if only two items, it just slides back and forth.
		{
			self.do_prev();
			return;
		}
		self.idx = idx;
		self.do_layout();
		self.update_ui();
	}

})
.endType();