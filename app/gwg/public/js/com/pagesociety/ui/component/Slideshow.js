vjo.ctype('com.pagesociety.ui.component.Slideshow') //< public
   .needs('com.pagesociety.ui.component.SimpleTile')
.inherits('com.pagesociety.ui.Component')

.props({
	
})
.protos({
	fade_on_load:true,//<boolean
	fade_speed:200,//<int
	fade_min_opacity:.2,//<Number
	fade_max_opacity:1,//<Number

	content: null,//<Component
	prev_button: null,//<org.jquery.jQuery
	next_button: null,//<org.jquery.jQuery
	
	cell_renderer_f:null,//<Function
	idx:0,//<protected int

	//>public constructor(Component parent)
	//>public constructor(Component parent, Object options)
	constructs: function(parent,options)
	{
		var self = this;//<Slideshow
		options = self.extend({ fade_on_load:true,fade_speed:200,fade_min_opacity:.2,fade_max_opacity:1, className: 'slideshow' }, options);
		self.base(parent,options);
		self.cell_renderer_f = self.options.cell_renderer == null 
				? function(parent) { return new com.pagesociety.ui.component.SimpleTile(parent, null); }
				: self.options.cell_renderer;
		self.content = new com.pagesociety.ui.Component(self);
//		self.fade_on_load = self.options.fade_on_load;
//		self.fade_speed = self.options.fade_speed;
//		self.fade_min_opacity = self.options.fade_min_opacity;
//		self.fade_max_opacity = self.options.fade_max_opacity;
		self.create_prev_next();
	},
	
	create_prev_next: function()
	{
		var self = this;//<Slideshow
		self.prev_button = self.$div(self.element, 'prev').html('&#8249;').css({'opacity':.7});
		self.prev_button.mousedown(function(){ self.prev(); });
		self.prev_button.hide();
		self.next_button = self.$div(self.element, 'next').html('&#8250;').css({'opacity':.7});
		self.next_button.mousedown(function(){ self.next(); });
		self.next_button.hide();
	},
	
	//>public void data(Array slides)
	data: function(slides)
	{
		var self = this;//<Slideshow
		self.base.data(slides);
		self.content.empty();
		self.select(0);
	},
	
	//>private Component create_slide(Entity slide)
	create_slide: function(slide)
	{
		var self = this;//<Slideshow
		var c = self.cell_renderer_f(self.content);//<Component
		c.hide();//otherwise it flickers on the ipad
		c.data(slide);
		c.show();
		return c;
	},
	
	get_left: function()
	{
		var self = this;//<Slideshow
		return 0;
	},

	get_right: function()
	{
		var self = this;//<Slideshow
		return $(window).width();
	},
	

	
	
	
	//>public void next()
	next: function()
	{
		var self = this;//<Slideshow
		self.select(self.idx+1);
		self.dispatch('select', self.idx);
	},
	
	//>public void prev()
	prev: function()
	{
		var self = this;//<Slideshow
		self.select(self.idx-1);
		self.dispatch('select', self.idx);
	},
	
	
	//>public void select(int idx)
	select: function(idx)
	{
		var self = this;//<Slideshow
		if (idx >= self.user_object.length)
			idx = self.user_object.length-1;
		if (idx < 0)
			idx = 0;
		self.idx = idx;
		self.next_button.hide();
		self.prev_button.hide();
		if (self.user_object.length>1)
		{
			if (idx<self.user_object.length-1)
				self.next_button.show();
			if (idx!=0)
				self.prev_button.show();
		}
		self.content.empty();
		self.create_slide(self.user_object[self.idx]);
	}

})
.endType();