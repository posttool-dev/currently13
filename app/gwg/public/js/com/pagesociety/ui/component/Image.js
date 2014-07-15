vjo.ctype('com.pagesociety.ui.component.Image') //< public
   .needs('com.pagesociety.web.ResourceModule')
.inherits('com.pagesociety.ui.Component')

.props({
	// image scaling & alignment
	NONE: 'none',//<public String
	FIT: 'fit',//<public String
	FIT_WIDTH: 'fit_width',//<public String
	FIT_HEIGHT: 'fit_height',//<public String
	FULL_BLEED: 'full_bleed',//<public String
	ALIGN_LEFT: 'left',//<public String
	ALIGN_RIGHT: 'right',//<public String
	ALIGN_CENTER: 'center',//<public String
	ALIGN_TOP: 'top',//<public String
	ALIGN_BOTTOM: 'bottom',//<public String
	// state
	STATE_INIT: 0,//<public int
	STATE_REQUESTING_PREVIEW: 1,//<public int
	STATE_LOADING: 2,//<public int
	STATE_LOADED: 3,//<public int
	STATE_DESTROYED: 4,//<public int
	STATE_ERROR: 5,//<public int
	
	//queueing
	Q: [],//<private Image[]
	QLOADING: [],//<private Image[]
	QUEUE_MAX_SIMULATANEOUS_LOAD: 2,//<public static final int
	
	QUEUE_LOAD: function(r)
	{
		var i = jQuery.inArray(r,com.pagesociety.ui.component.Image.Q);
		if (i != -1)
			return;
		com.pagesociety.ui.component.Image.Q.push(r);
		com.pagesociety.ui.component.Image.QUEUE_DO_LOAD();
	},
	
	QUEUE_DO_LOAD: function()
	{
		if (com.pagesociety.ui.component.Image.Q.length==0)
			return;
		var s = Math.min(com.pagesociety.ui.component.Image.QUEUE_MAX_SIMULATANEOUS_LOAD - com.pagesociety.ui.component.Image.QLOADING.length,  com.pagesociety.ui.component.Image.Q.length);
		for (var i = 0; i < s; i++)
		{
			com.pagesociety.ui.component.Image.QLOADING.push(com.pagesociety.ui.component.Image.Q[i]);
			com.pagesociety.ui.component.Image.Q[i].do_load();
		}
	},

	QUEUE_COMPLETE: function(r)
	{
		var i = jQuery.inArray(r,com.pagesociety.ui.component.Image.Q);
		if (i==-1)
			throw new Error(r.resource._attributes['path-token']+" WAS NOT IN THE QUEUE");
		com.pagesociety.ui.component.Image.Q.splice(i,1);
		var load_idx = jQuery.inArray(r, com.pagesociety.ui.component.Image.QLOADING);
		if (load_idx != -1)
		{
			com.pagesociety.ui.component.Image.QLOADING.splice(load_idx, 1);
			com.pagesociety.ui.component.Image.QUEUE_DO_LOAD();
		}
	},
	
	QUEUE_CANCEL: function(r)
	{
		var load_idx = jQuery.inArray(r, com.pagesociety.ui.component.Image.QLOADING);
		if (load_idx != -1)
			return;
		var i = jQuery.inArray(r, com.pagesociety.ui.component.Image.Q);
		if (i!=-1)
			com.pagesociety.ui.component.Image.Q.splice(i,1);
	}

})
.protos({
	resource:null,//<com.pagesociety.persistence.Entity
	
	preview_width:-1,//<Number
	preview_height:-1,//<Number
	greyscale:false,//<boolean
	jpegQuality:null,//<int
	shrink:false,//<boolean
	fade_in_speed:100,//<int
	state:0,//<int
	os:true,//<boolean
	fit_info:null,//<Object

	$img:null,//<org.jquery.jQuery
	$wrap:null,//<org.jquery.jQuery
	$wrap_loading:null,//<org.jquery.jQuery
	
	wrap_classname:null,//<String
	loading_classname:null,//<String

	//>public constructor(Component parent, Object options)
	constructs: function(parent,options)
	{
		var self = this;//<Image
		if (options.className == null)
			options.className = "image";
		self.base(parent,options);
		self.state = com.pagesociety.ui.component.Image.STATE_INIT;
		
		if (options.resource == null)
			throw new Error("REQUIRES options.resource");
			
		self.resource       = options.resource;
		self.preview_width  = options.preview_width ? options.preview_width : -1;
		self.preview_height = options.preview_height ? options.preview_height: -1;
		self.greyscale		= options.greyscale ? options.greyscale : false;
		self.jpegQuality	= options.jpegQuality ? options.quality : null;
		self.shrink			= options.shrink ? options.shrink : false;
		self.fade_in_speed  = options.fade_in_speed ? options.fade_in_speed : 100;
		
		self.wrap_classname  	= options.wrap_classname ? options.wrap_classname : 'ps_image_wrap';
		self.loading_classname  = options.loading_classname ? options.loading_classname : 'ps_image_loading';
		
		self.$wrap 				= self.$div(self.element, self.wrap_classname).css({'overflow':'hidden', 'position':'relative'});
		self.$wrap_loading  	= self.$div(self.$wrap, self.loading_classname);
		self.update_size();
		
	},
	
	//>public void onscreen(boolean b)
	onscreen: function(b)
	{
		var self = this;//<Image
		self.os = b;
		if (self.os)
			self.load();
		else 
			com.pagesociety.ui.component.Image.QUEUE_CANCEL(self);
	},

	
	//>public void load()
	load: function()
	{
		var self = this;//<Image
		if (self.isLoading() || self.isLoaded())
			return;
		
		self.state = com.pagesociety.ui.component.Image.STATE_INIT;
		com.pagesociety.ui.component.Image.QUEUE_LOAD(self);
	},
	
	do_load: function()
	{
		var self = this;//<Image
		self.state = com.pagesociety.ui.component.Image.STATE_LOADING;
		if (self.$img != null)
			self.$img.remove();
		
		self.$img = $(new Image());
		self.$img.css({position:'absolute'});
		self.$img.load(function(e)
		{
			com.pagesociety.ui.component.Image.QUEUE_COMPLETE(self);		
			self.state = com.pagesociety.ui.component.Image.STATE_LOADED;
			
			if(self.options.img_loaded_callback)
				self.options.img_loaded_callback(self);

			self.$wrap.empty();
			self.$wrap_loading = null;
			self.update_size();
			self.$img.hide();
			self.$wrap.append(self.$img);
			self.$img.fadeIn(self.fade_in_speed);
			self.dispatch('load',null);
		});

		var c = 0;
		var img_options = 
		{
			width: self.preview_width+"", 
			height: self.preview_height+""
		};
		if (self.greyscale)
			img_options.grayscale = "true";
		if (self.jpegQuality)
			img_options.quality = self.jpegQuality;
		self.$img.error(function()
		{
			if (c!=0)
			{
				self.state = com.pagesociety.ui.component.Image.STATE_ERROR;
				console.log("SERVER DID NOT CREATE PREVIEW");
				return;
			}
			c++;
			self.state = com.pagesociety.ui.component.Image.STATE_REQUESTING_PREVIEW;
			com.pagesociety.web.ResourceModule.getPreviewSrc(self.resource, img_options, function(p)
			{
				self. $img.attr('src', p);
			});
		});
		var path = com.pagesociety.web.ResourceModule.getPath(self.resource, img_options);
		self.$img.attr('src', path);
	},

	//>public void destroy()
	destroy: function()
	{
		var self = this;//<Image
		//we don't call the superclass, making this component reusable...
		//html won't really let us stop a loading image, so we don't
		if (self.isLoading())
			return;
		
		if (self.$img != null)
		{
			self.$img.remove();
			self.$wrap.empty();
			self.$wrap_loading = self.$div(self.$wrap, self.loading_classname);
		}
		com.pagesociety.ui.component.Image.QUEUE_CANCEL(self);		
		self.state = com.pagesociety.ui.component.Image.STATE_DESTROYED;
	},
	
	//>public boolean isLoading()
	isLoading: function()
	{
		var self = this;//<Image
		return (self.state == com.pagesociety.ui.component.Image.STATE_REQUESTING_PREVIEW || self.state == com.pagesociety.ui.component.Image.STATE_LOADING);
	},

	//>public boolean isLoaded()
	isLoaded: function()
	{
		var self = this;//<Image
		return (self.state == com.pagesociety.ui.component.Image.STATE_LOADED);
	},
	
	//>public boolean isLoaded()
	isDestroyed: function()
	{
		var self = this;//<Image
		return (self.state == com.pagesociety.ui.component.Image.STATE_DESTROYED);
	},

	update_size: function()
	{
		var self = this;//<Image
		self.fit_info = self.fit_to_size();
		self.$wrap.css({'width':self.getWidth()+'px','height':self.getHeight()+'px'});
		if(self.$img != null)
			self.$img.css({'top':self.fit_info.top+'px','left':self.fit_info.left+'px','width':self.fit_info.width+'px','height':self.fit_info.height+'px'});
	},

	//>protected void updatew()
	updatew: function()
	{
		this.base.updatew();
		this.update_size();
	},
	
	//>protected void updateh()
	updateh: function()
	{
		this.base.updateh();
		this.update_size();
	},


	fit_to_size: function()
	{
		var self = this; //<Image
	
		var model   = self.options.scale;
		var cues    = self.options.scale_cues ? self.options.scale_cues : { align: 'center', valign: 'center' };
		var orig_w  = self.resource._attributes != null ? self.resource._attributes.width : 100;
		var orig_h  = self.resource._attributes != null ? self.resource._attributes.height : 100;
		    
		var fit_w   = self.getWidth();
	    var fit_h   = self.getHeight();
	    
		var sx = fit_w/orig_w,
	        sy = fit_h/orig_h;
	        
		var sw=0, sh=0, ot=0, ol=0;
	
		var do_fit_height = function()
		{
			sw = orig_w*sy;
			sh = orig_h*sy;
		};
		var do_fit_width = function()
		{
			sw = orig_w*sx;
			sh = orig_h*sx;
			if (self.shrink)
			{
				cues.align = com.pagesociety.ui.component.Image.ALIGN_TOP;
				self.height.setAbsolute(sh);
			}
		};
		
		switch (model)
		{
			case com.pagesociety.ui.component.Image.NONE:
				sw = orig_w;
				sh = orig_h;
				break;
			case com.pagesociety.ui.component.Image.FIT:
				if ( sx < sy )
					do_fit_width();
				else
					do_fit_height();
				break;
			case com.pagesociety.ui.component.Image.FIT_HEIGHT:
				do_fit_height();
				break;
			case com.pagesociety.ui.component.Image.FIT_WIDTH:
				do_fit_width();
				break;
			case com.pagesociety.ui.component.Image.FULL_BLEED:
				if ( sx > sy )
				{
					sw = orig_w*sx;
					sh = orig_h*sx;
				}
				else
				{
					sw = orig_w*sy;
					sh = orig_h*sy;
				}
				break;
		}
		
		var do_shrink_width = function()
		{
			cues.align = com.pagesociety.ui.component.Image.ALIGN_LEFT;
			self.width.setAbsolute(sw);
			self.element.width(sw);
		};
		var do_shrink_height = function()
		{
			cues.align = com.pagesociety.ui.component.Image.ALIGN_TOP;
			self.height.setAbsolute(sh);
			self.element.height(sh);
		};
		
		if (self.shrink)
		{
			switch (model)
			{
				case com.pagesociety.ui.component.Image.FIT:
					do_shrink_height();
					do_shrink_width();
					break;
				case com.pagesociety.ui.component.Image.FIT_HEIGHT:
					do_shrink_height();
					break;
				case com.pagesociety.ui.component.Image.FIT_WIDTH:
					do_shrink_width();
					break;
				case com.pagesociety.ui.component.Image.FULL_BLEED:
					break;
			}
			
		}
		
		switch(cues.align)
		{
			case com.pagesociety.ui.component.Image.ALIGN_LEFT:
				ol = 0;
				break;
			case com.pagesociety.ui.component.Image.ALIGN_CENTER:
				ol = (fit_w - sw)/2;
				break;
			case com.pagesociety.ui.component.Image.ALIGN_RIGHT:
				ol = fit_w - sw;
				break;
			default:
				ol = 0;
				break;
		}
		switch(cues.valign)
		{
			case com.pagesociety.ui.component.Image.ALIGN_TOP:
				ot = 0;
				break;
			case com.pagesociety.ui.component.Image.ALIGN_CENTER:
				ot = (fit_h - sh)/2;
				break;
			case com.pagesociety.ui.component.Image.ALIGN_BOTTOM:
				ot = fit_h - sh;
				break;
			default:
				ot = 0;
				break;
		}
		return {top:Math.floor(ot), left:Math.floor(ol), width:Math.floor(sw),height:Math.floor(sh)};
		
	}
	

})
.endType();