vjo.ctype('com.gwg.site.Portfolio') //< public
   .needs('com.pagesociety.ui.component.EndlessTiles') 
.inherits('com.pagesociety.ui.Component')

.props({
	
})
.protos({
	
	d:null,//<Component
	c:null,//<EndlessTiles
	
	//>public constructor (Component parent)
	constructs: function(parent) 
	{
		var self = this; //<Portfolio
		self.base(parent,{className:'portfolio'});
		self.c = new com.pagesociety.ui.component.EndlessTiles(self, {
			cell_renderer: function(p) { 
				var pt = new com.gwg.site.PortfolioTile(p); //<com.gwg.site.PortfolioTile
				pt.addListener('next', function(){ self.dispatch('next'); });
				return pt;
			},
			prev_renderer: function() { return self.$div(self.element, 'prev'); },
			next_renderer: function() { return self.$div(self.element, 'nextbg').append(self.$div(self.element, 'next')); },
			className: 'ps',
			margin: 37,
			xoffset: 37
		});
		self.c.setWidthDelta(-47);
		self.c.setHeightDelta(-120);
		self.css({'margin-top':'39px', 'background-color':'rgba(100,100,0,0)'});
		
		self.d = new com.pagesociety.ui.Component(self,{className:'description'});
		self.d.css({opacity:.5});
	},
	
	//>public void data(com.pagesociety.persistence.Entity node)
	data: function(node)
	{
		var self = this;//<Portfolio
		self.base.data(node);
		var images = node._attributes.data._attributes.images;
		var slide_data = [];
		for (var i=0; i<images.length; i++)
		{
			var image = images[i];
			slide_data.push({
					title: image._attributes.title, 
					resource: image._attributes.resource, 
					description: image._attributes.description,
					index: (i+1),
					count: images.length
				});
		}
		self.c.data(slide_data);		
	},
	
	select: function(idx)
	{
		var self = this;//<Portfolio
		self.application.menu.hide();
		self.c.select(idx);
		
		var data = self.user_object._attributes.data._attributes;
		var images = self.user_object._attributes.data._attributes.images;
		var image = null;
		if (idx<images.length)
			image = images[idx]._attributes;
		if (com.gwg.site.StyleProps.portfolioShowTitles && image != null)
			self.d.element.html(data.description+'<b>'+image.title+'</b>');
		else
			self.d.element.html(data.description);
	}

	
})
.endType();