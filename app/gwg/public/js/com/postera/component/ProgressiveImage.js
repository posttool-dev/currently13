vjo.ctype('com.postera.component.ProgressiveImage') //< public
.inherits('com.pagesociety.ui.Component')

.props({
	
})
.protos({
	config:null,//<Object
	img:null,//<com.pagesociety.ui.component.Image
	img2:null,//<com.pagesociety.ui.component.Image

	//>public constructor (Component parent)
	//>public constructor (Component parent, String config)
	//>public constructor (Component parent, Object config)
	constructs: function(parent, type) 
	{
		var self = this; //<ProgressiveImage
		self.base(parent,{className:'imgs'});
		
		var base_config = {
		     scale: com.pagesociety.ui.component.Image.FULL_BLEED
		};
		if (type == null)
			self.config = base_config;
		else if (typeof(type)=='string')
			self.config = { scale: type };
		else
			self.config = type;
	},
	
	//>public void data(com.pagesociety.persistence.Entity node)
	data: function(resource)
	{
		var self = this;//<ProgressiveImage
		var lo_config = jQuery.extend({resource: resource, preview_width: 200, preview_height: 200, quality: 50 },self.config);
		var hi_config = jQuery.extend({resource: resource, preview_width: 1500, preview_height: 1000 },self.config);
		self.img = new com.pagesociety.ui.component.Image(self, lo_config);//<Image
		self.img.addListener('load', function()
		{ 
			self.dispatch('load'); 
			self.img2 = new com.pagesociety.ui.component.Image(self, hi_config);//<Image
				self.img2.addListener('load', function(){ 
					self.delay(function(){
						self.dispatch('load_high_res'); 
						self.img.hide(); 
					}, 100);
				});
				self.img2.load();
		});
		self.img.load();

	},
	
	//>public void onscreen(boolean b)
	onscreen: function(b)
	{
		var self = this;//<ProgressiveImage
		if (self.img2!=null)
			self.img2.onscreen(b);
		if (self.img!=null)
			self.img.onscreen(b);

	}
})
.endType();