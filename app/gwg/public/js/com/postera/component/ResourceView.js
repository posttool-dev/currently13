vjo.ctype('com.postera.component.ResourceView') //< public
.inherits('com.pagesociety.ui.Component')

.props({
	
})
.protos({
	img:null,//<com.postera.component.ProgressiveImage

	//>public constructor (Component parent)
	//>public constructor (Component parent, Object config)
	constructs: function(parent,config) 
	{
		var self = this; //<ResourceView
		self.base(parent,config);
//		if (config.resource)
//			self.data(config);
	},
	
	//>public void data(Object data)
	data: function(data)
	{
		var self = this;//<ResourceView
		
		self.base.data(data);
		self.empty();

		if (data.resource==null)
			return;
			
		var type = data.resource._attributes['simple-type'];
		switch (type)
		{
			case 'VIDEO':
				var $vc = self.$div(self.element);
				$vc.attr('id','pt'+Math.random());
	
				var id="flashcontent";
				var flashvars = { 
					flv: com.pagesociety.web.ResourceModule.getPath(data.resource,{}),
					play: "yes",
					swf: "static/js/lib/psvideo/PSVideo.swf"
				};
				var params = { allowScriptAccess: "always" };
				var attributes = { id: "swf"+id };
				swfobject.embedSWF("static/js/lib/psvideo/Bootstrap.swf", $vc.attr('id'), "100%", "100%", "9.0.0", 
					null, flashvars, params, attributes);
				self.dispatch('load');
				break;
				
			case 'IMAGE':
				self.img = new com.postera.component.ProgressiveImage(self, data); 
				self.img.addListener('load', function() {  self.dispatch('load'); });
				self.img.addListener('load_high_res', function() {  self.dispatch('load_high_res'); });
				self.img.data(data.resource);
				break;
		//todo add support for other file types (pdf,doc,etc)
			default:
				self.dispatch('load');
				break;
		}
		

	},
	

	
	//>public void onscreen(boolean b)
	onscreen: function(b)
	{
		var self = this;//<ResourceView
		if (self.img!=null)
			self.img.onscreen(b);

	}
})
.endType();