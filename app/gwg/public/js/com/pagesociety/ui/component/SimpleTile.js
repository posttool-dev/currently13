vjo.ctype('com.pagesociety.ui.component.SimpleTile') //< public
   .needs('com.pagesociety.ui.component.Image') 
.inherits('com.pagesociety.ui.Component')
.satisfies('com.pagesociety.ui.component.ITile')

.props({
	
})
.protos({
	$title:null,//<org.jquery.jQuery
	img:null,//<Image
	$description:null,//<org.jquery.jQuery
	
	//>public constructor (Component parent)
	constructs: function(parent) 
	{
		var self = this;//<SimpleTile
		var options =  {tag: 'li', className: 'tile' };
		self.base(parent, options);
		self.setWidth(350);
	},

	
	//>public void data(Object data)
	data: function(data)
	{
		var self = this;//<SimpleTile
		self.base.data(data);
		self.element.empty();
		if (data.title != null)
		{
			self.$title = self.$div(self.element,'title');
			self.$title.html(data.title);
		}
		if (data.resource!=null)
		{
			self.img = new com.pagesociety.ui.component.Image(self, { 
				scale: com.pagesociety.ui.component.Image.FULL_BLEED, 
				preview_width: 500, 
				preview_height: 500,
				/* greyscale: true, */
				resource: data.resource});
			self.img.setWidth(340);
			self.img.setHeight(240);
			self.img.addListener('load', function(){ self.dispatch('load'); });
		}
		else
			self.dispatch('load');
		self.$description = self.$div(self.element,data.resource!=null?'description':'big_description');
		self.$description.html(data.description);
	},
	
	//>public void onscreen(boolean b)
	onscreen: function(b)
	{
		var self = this;//<SimpleTile
		if (self.img==null)
			return;
		if (b)
			self.img.load();
		else
			self.img.destroy();
	}
})
.endType();