vjo.ctype('com.gwg.site.Home') //< public
.inherits('com.pagesociety.ui.Component')

.props({
	
})
.protos({
	
	
	//>public constructor (Component parent)
	constructs: function(parent) 
	{
		var self = this; //<Home
		self.base(parent);
	},
	
	//>public void data(com.pagesociety.persistence.Entity node)
	data: function(node)
	{
		var data = node._attributes.data._attributes;
		var images = data.images;
		if (images!=null && images.length!=0)
		{
			var p = com.pagesociety.web.ResourceModule.getPath(images[0]._attributes.resource)
			//self.element.css({'background':'url('+p+')', 'width':'100%', 'height':'100%'});
			$("#system_root").css({'background':'url('+p+')'});
		}
	},
	
	//>public void destroy()
	destroy: function()
	{
		this.base.destroy();
		$("#system_root").css({'background':'none'});
	}

})
.endType();