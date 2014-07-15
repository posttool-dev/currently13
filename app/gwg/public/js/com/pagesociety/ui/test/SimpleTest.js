vjo.ctype('com.pagesociety.ui.test.SimpleTest') //< public
   .needs('com.pagesociety.ui.Component')
   .needs('com.pagesociety.ui.component.Image')
   .needs('com.pagesociety.web.ModuleConnection')
   .needs('com.pagesociety.web.ResourceModule')
   .needs('com.pagesociety.ui.test.SimpleComponent')
   .inherits('com.pagesociety.ui.Root')

.props({
	
})
.protos({
	//>public constructor ()
	constructs: function() 
	{
		var self = this;//<SimpleTest
		self.base(); // ie super()
		
		com.pagesociety.web.ModuleConnection.BASE_URL = 'http://postera.com';//TODO init like Resource util (or init whole app at once!)
		com.pagesociety.web.ResourceModule.init([ 
	      { resource_module_name: "Resource", resource_entity_name: "Resource", resource_base_url: "http://postera.s3.amazonaws.com/" }
	    ]);
		
		var c = self.simple_comp(self);//<SimpleComponent
		c.bgcolor("#f0c");
		c.setWidthPercent(100,-10);
		c.setHeightPercent(50);
		c.something();
		
		self.application.do_module("PosteraSystems/GetSiteByUserName", [ "jgabbard" ], function(site)
		{
		    self.application.do_module('PosteraTreeModule/FillSystemNode',[site._attributes.published_tree._attributes.root._id],function(data)
		    {
		    	var imgs = data._attributes.data._attributes.images;
				self.rect(c, 0, 150, 100, 40, '#fff');
				self.rect(c, 0, 200, 100, 20, '#f03');
				self.each(imgs, function(img,i){
						var img0 = self.img(c, { 
							scale: "full_bleed", 
							preview_width: 500, 
							preview_height: 500,
							resource: img._attributes.resource,
							css: { position:'absolute', top:'100px', left:(100+i*50)+'px'}});//<Component
						img0.addListener('click',function(){img0.hide();});
					});
				
			});    
		});

	},
	
	simple_comp: function(p)
	{
		return  new com.pagesociety.ui.test.SimpleComponent(p);
	},
	
	comp: function(p,o)
	{
		return new com.pagesociety.ui.Component(p,o);
	},
	
	rect: function(p,x,y,w,h,bgcolor)
	{
		var self = this; //<SimpleTest
		var css = { position: 'absolute' };
		if (x!=null)
			css.left = x+'px';
		if (y!=null)
			css.top = y+'px';
		if (bgcolor!=null)
			css['background-color'] = bgcolor;
		var c = self.comp(p,{css:css});
		if (w!=null)
			c.setWidth(w);
		if (h!=null)
			c.setHeight(h);
		return c;
	},
	
	img: function(p,o)
	{
		return  new com.pagesociety.ui.component.Image(p,o);
	}
	
	


})
.endType();



