vjo.ctype('com.pagesociety.ui.Root') //< public 
   .needs('com.pagesociety.web.ModuleConnection')
.inherits('com.pagesociety.ui.Component')

.props({
	
})
.protos({
	
	ua:null,//<String
	is_android:false,//<public boolean
	is_ipad:false,//<public boolean
	is_iphone:false,//<public boolean
	is_ios:false,//<public boolean
	is_webkit:false,//<public boolean

	takeover_wrap:null,//<org.jquery.jQuery
	takeover_gauze:null,//<org.jquery.jQuery
	takeover_content:null,//<org.jquery.jQuery
	debug: null,//<public org.jquery.jQuery


	//>public constructor()
	//>public constructor(org.jquery.jQuery el)
	constructs: function(el) 
	{
		var self = this;//<Root
		self.base(self,{});
		self.application = this;
		self.ua = navigator.userAgent;
		self.is_android =  /iPad/i.test(self.ua);
		self.is_ipad =  /iPad/i.test(self.ua);
		self.is_iphone = /iPhone/i.test(self.ua);
		self.is_ios =  self.is_ipad || self.is_iphone; 
		self.is_webkit =  self.is_ios || /webkit/i.test(self.ua);

		if (el==null)
			el = $(document.body);
		el.append(self.element);
		self.takeover_wrap = self.$div(el, 'takeover');
		self.takeover_wrap.hide();
		self.takeover_gauze = self.$div(self.takeover_wrap, 'gauze');
		self.takeover_gauze.css('opacity',.85);
		self.takeover_content = self.$div(self.takeover_wrap, 'content');
		self.debug = self.$div(el,'debug');
		$(window).resize(function(){ self.resize(); });
	},
	
	//>public Number getWidth()
	getWidth: function()
	{
		return $(document).width();
	},
	
	//>public Number getHeight()
	getHeight: function()
	{
		return $(document).height();
	},
	
	//>public void do_module(String moduleMethod, Array args, Function callback)
	//>public void do_module(String moduleMethod, Array args, Function callback, Function err_callback)
	do_module:function(moduleMethod,args,callback,err_callback)
	{
		var self = this; //<Root
		com.pagesociety.web.ModuleConnection.doModule(moduleMethod,args,callback, err_callback?err_callback:function(e){ self.on_error(e); });
	},
	
	//>public void on_error(Error e)
	on_error: function(e)
	{
		var self = this;//<Root
		self.dialog("ERROR",e.message,true);
	},

	//>public void dialog(String title, String msg)
	//>public void dialog(String title, String msg, boolean closable)
	dialog: function(title,msg,closable)
	{
		var self = this;//<Root
		closable = closable ? closable : true;
		var $dialog = self.$div(null,'dialog');
		self.$div($dialog,'title').text(title); 
		self.$div($dialog,'message').html(msg);
		if (closable)
		{
			var cf = function(){ self.hide_takover(); };
			var $bb = self.$div($dialog,'button_bar');
			self.$el($bb,'button').text('OK').click(cf);
			self.takeover_gauze.bind('click', cf);
		}
		else
		{
			self.takeover_gauze.unbind('click');
		}
		self.takeover($dialog);
	},
	
	//>public void takeover(org.jquery.jQuery $content)
	takeover: function($content)
	{
		var self = this;//<Root
		self.takeover_content.empty();
		self.takeover_content.append($content);
		self.takeover_wrap.fadeTo(300,1);
	},
	
	//>public void hide_takover()
	hide_takover: function()
	{
		var self = this;//<Root
		self.takeover_wrap.fadeTo(100,0, function(){ self.takeover_wrap.hide(); });
	}
})
.endType();