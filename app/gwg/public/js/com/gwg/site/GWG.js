vjo.ctype('com.gwg.site.GWG') //< public
   .needs('com.gwg.site.SocialButtons')
   .needs('com.gwg.site.StyleProps')
   .needs('com.pagesociety.ui.component.ExpandingMenu')
.inherits('com.postera.component.BasicSystem')

.props({

})
.protos({
	
	logo:null,//<com.gwg.site.Logo
	menu:null,//<ExpandingMenu
	footer:null,//<SocialButtons

 	//> public constructs(String base_url, String code_root, boolean in_styler) 
	constructs : function(base_url,code_root,in_styler)
	{
		var self = this; //<GWG

		self.base(base_url, code_root, in_styler,
				com.gwg.site, 
				com.gwg.site.StyleProps);
		
		self.logo = new com.gwg.site.Logo(this);
		self.logo.addListener('click', function(){ self.menu.show(); });
		
		// menus
		self.menu = new com.pagesociety.ui.component.ExpandingMenu(self, {className: 'main_menu'});
		self.menu.addListener('select', function(node) 
			{
				self.select_menu_item(node, 0, false); 
			});
		self.menu.hide();
		self.delay(function(){
			 self.menu.show();
		}, 5000);
		self.footer = new com.gwg.site.SocialButtons(self); 
		
		$(document.body).bind('orientationchange', function(e)
		{
			//update display on orientation change
			self.display_node(self.selected_node, self.selected_index);
		});
		
	},
	
	//>protected void on_init_system(com.pagesociety.persistence.Entity root)
	on_init_system:function(root)
	{
		var self = this; //<GWG
		self.base.on_init_system(root);
		self.menu.data(root);
	},

	//>protected void display_node(com.pagesociety.persistence.Entity node, int offset)
	display_node: function(node, offset)
	{
		var self = this; //<GWG
		self.base.display_node(node,offset);
		self.menu.select(node);
		self.footer.reset(node);
	}
	

})
.endType();