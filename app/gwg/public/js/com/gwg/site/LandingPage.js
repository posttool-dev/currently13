vjo.ctype('com.gwg.site.LandingPage') //< public
   .needs('com.pagesociety.ui.component.Image')
.inherits('com.pagesociety.ui.Component')

.props({
	
})
.protos({
	
	t:null,//<org.jquery.jQuery
	pimg:null,//<com.postera.component.ProgressiveImage
	
	//>public constructor (Component parent)
	constructs: function(parent) 
	{
		var self = this; //<LandingPage
		self.base(parent,{className:'landing'});
		self.pimg = new com.postera.component.ProgressiveImage(self);
		self.pimg.setWidthDelta(-230);
		self.t = self.$div(self.element,'ps_text');
	},
	
	//>public void data(com.pagesociety.persistence.Entity node)
	data: function(node)
	{
		var self = this;//<LandingPage
		var data = node._attributes.data._attributes;
		var images = data.images;
		if (images!=null && images.length!=0)
		{
			self.pimg.data( images[0]._attributes.resource );
			self.pimg.addListener('click', function(){
				self.pimg.dispatch('next');
			});
		}
		if (!com.pagesociety.util.StringUtil.empty(data.description))
		{
			self.t.html(data.description);
			self.pimg.opacity(.3);
		}
			
	}

})
.endType();