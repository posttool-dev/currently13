vjo.ctype('com.gwg.site.InformationPage') //< public
.inherits('com.pagesociety.ui.Component')

.props({
	
})
.protos({
	
	imgs:null,//<Component
	t:null,//<Component
	
	//>public constructor (Component parent)
	constructs: function(parent) 
	{
		var self = this; //<InformationPage
		self.base(parent,{className:'info'});
		self.imgs = new com.pagesociety.ui.Component(self,{className: 'imgs'});
		self.t = new com.pagesociety.ui.Component(self,{className: 'ps_text'});
	},
	
	//>public void data(com.pagesociety.persistence.Entity node)
	data: function(node)
	{
		var self = this;//<InformationPage
		var images = node._attributes.data._attributes.images;
		for (var i=0; i<images.length; i++)
		{
			var img = new com.pagesociety.ui.component.Image(self.imgs,
				{
					resource: images[i]._attributes.resource,
					scale: com.pagesociety.ui.component.Image.FIT_HEIGHT,
					shrink: true,
					preview_width: 1500, 
					preview_height: 1000
				});
			img.setHeight(150);
			img.load();
		}
		if (images.length!=0)
			self.imgs.element.append('<br clear="all"/>');
		if (node._attributes.data._attributes.description != null)
			self.t.element.html(node._attributes.data._attributes.description);
		
	}

	
})
.endType();