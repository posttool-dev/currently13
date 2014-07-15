vjo.ctype('com.gwg.site.CV') //< public
.inherits('com.pagesociety.ui.Component')

.props({
	
})
.protos({
	
	imgs:null,//<Component
	t:null,//<Component
	
	//>public constructor (Component parent)
	constructs: function(parent) 
	{
		var self = this; //<CV
		self.base(parent,{className:'cv'});
		self.imgs = new com.pagesociety.ui.Component(self,{className: 'imgs'});
		self.t = new com.pagesociety.ui.Component(self,{className: 'ps_text'});
	},
	
	//>public void data(com.pagesociety.persistence.Entity node)
	data: function(node)
	{
		var self = this;//<CV
		
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
		self.imgs.element.append('<br clear="all"/>');
		
		var summary = node._attributes.data._attributes.summary;
		var sections = jQuery.parseJSON(node._attributes.data._attributes.sections[0]);
		
		var s = summary;
		self.t.element.html(s);
		
		for (var i=0; i<sections.length; i++)
		{
			var $s = self.$el(self.t.element, 'table');
			$s.append('<tr><td colspan="2"><h4>'+sections[i].title+'</h4></td></tr>');
			for (var j=0; j<sections[i].data.length; j+=2)
			{
				$s.append('<tr valign="top"><td width="120">'+sections[i].data[j]+'</td><td>'+sections[i].data[j+1]+'</td></tr>');
			}
		}
		
		
	}

	
})
.endType();