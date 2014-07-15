vjo.ctype('com.gwg.site.PortfolioTile') //< public
   .needs('com.postera.component.ResourceView')
.inherits('com.pagesociety.ui.Component')


.props({
	
})
.protos({
	$title:null,//<org.jquery.jQuery
	img:null,//<ResourceView
	$description:null,//<org.jquery.jQuery
	
	//>public constructor (Component parent)
	constructs: function(parent,$parent) 
	{
		var self = this;//<PortfolioTile
		var options =  {tag: 'li', className: 'fbtile' };
		self.base(parent, options);
	},
	
	//>public void data(Object data)
	data: function(data)
	{
		var self = this;//<PortfolioTile
		self.base.data(data);
		self.empty();
//		if (data.title != null)
//		{
//			self.$title = self.$div(self.element,'title');
//			self.$title.html(data.title);
//		}
		self.img = new com.postera.component.ResourceView(self);//<Image
		self.img.setWidthDelta(-150);
		self.img.setHeightDelta(-150);
		self.img.css({'position':'absolute','top':'35px','left':'35px','background-color':"#fff"});
		self.img.data({ 
			scale: com.pagesociety.ui.component.Image.FIT,
			scale_cues: { 
				align: com.pagesociety.ui.component.Image.ALIGN_LEFT, 
				valign: com.pagesociety.ui.component.Image.ALIGN_TOP },
			shrink: true,
			resource: data.resource});
		self.img.addListener('click',function(e){
			self.dispatch('next');
		});
		self.$description = self.$div(self.element,'description');
		self.$description.html(data.description);
		if (data.index == data.count)
		{
			var $t = $('<span>'+data.index+' of '+data.count+'</span>');
			var $a = $('<a href="">Next project</a>');
			$a.click(function(e){
				self.dispatch('next');
				e.preventDefault();
			});
			self.$description.append($t,'&nbsp;',$a);
		}
		else
		{
			var $a = $('<a href="">'+data.index+' of '+data.count+'</a>');
			$a.click(function(e){
				self.dispatch('next');
				e.preventDefault();
			});
		}
		self.$description.append($a);
		var tp = (self.img.img != null) ? self.img.img.img.getHeight()+50 : self.img.getHeight()+50;
		self.$description.css({'position':'absolute','top':tp+'px', 'left':'30px'});
	},

	
	//>public void onscreen(boolean b)
	onscreen: function(b)
	{
		var self = this;//<PortfolioTile
		if (self.img != null)
			self.img.onscreen(b);
	}
	
	
})
.endType();