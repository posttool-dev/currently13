vjo.ctype('com.postera.component.MainMenu') //< public
   .needs('com.pagesociety.persistence.Entity')
.inherits('com.pagesociety.ui.Component')

.props({
	
})
.protos({

	$last_li: null,//<org.jquery.jQuery

	//>public constructor (Component parent)
	//>public constructor (Component parent, Object options)
	constructs: function(parent, options) 
	{
		var self = this;//<MainMenu
		self.base(parent, options);
	},
	
	//>public void data(Entity[] nodes)
	data: function(nodes)
	{
		var self = this;//<MainMenu
		self.base.data(nodes);
		self.element.empty();
		var $nav = self.$el(self.element, 'nav');
		var $ul = self.$el($nav, 'ul');
		self.each(nodes, function(node,i)
		{
			var $li = self.$el($ul, 'li');
			if (node==null)
				return;
			$li.text(node._attributes.data._attributes.title);
			$li.click(function(){ self.dispatch('select',node); });
			$li.attr('id', '__mm'+node._attributes.node_id);
		});
	},
	
	//>public void select(Entity node)
	select: function(node)
	{
		var self = this;//<MainMenu
		if (node==null)
			return;
		if (self.$last_li!=null)
			self.$last_li.removeClass('selected');
		var $li = self.element.find('#__mm'+node._attributes.node_id);
		$li.addClass('selected');
		self.$last_li = $li;
	}
})
.endType();