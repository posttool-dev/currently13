vjo.ctype('com.pagesociety.ui.component.ExpandingMenu') //< public
   .needs('com.pagesociety.persistence.Entity')
   .needs('com.pagesociety.util.TreeUtil')
.inherits('com.pagesociety.ui.Component')

.props({
	
})
.protos({
	
	selected_node:null,//<Entity
	$nav:null,//<org.jquery.jQuery
	
	//>public constructor (Component parent)
	//>public constructor (Component parent, Object options)
	constructs: function(parent, options) 
	{
		var self = this;//<ExpandingMenu
		self.base(parent, options);
	},
	
	//>public void data(Entity root)
	data: function(root)
	{
		var self = this;//<ExpandingMenu
		self.user_object = root
		self.element.empty();
		self.$nav = self.make_nav(root);
	},
	
	//>public void select(Entity node)
	select: function(node)
	{
		var self = this;//<ExpandingMenu
		self.data(self.user_object);
		var $sel = self.element.find('#n'+node._id);
		$sel.addClass('selected');
		if ($sel.attr('depth')!=0)
			self.toggle($sel);
		var $p = $sel.parent();
		if (!$p.attr('depth'))
			return;
		while ($p.length!=0 && $p.attr('depth')!=0)
		{
			self.toggle($p);
			$p.prev().addClass('selected');
			$p = $p.parent();
		}
	},
	
	//>private org.jquery.jQuery make_nav(Entity root)
	make_nav: function(root)
	{
		var self = this;//<ExpandingMenu
		var $nav = self.$el(self.element,'nav');
		self.make_ul($nav, root, 0);
		return $nav;
	},
	
	//>private org.jquery.jQuery make_ul(org.jquery.jQuery $parent, Entity node, int level)
	make_ul: function($parent, node, level)
	{
		var self = this;//<ExpandingMenu
		var $ul = self.$el($parent,'ul').attr({"depth":level, "expanded":(level==0), 'id':'n'+node._id});
		self.each(node._attributes.children, function(child_node){
			self.make_li($ul, child_node, level+1);
		});
		return $ul;
	},
	
	//>private void make_li(org.jquery.jQuery $parent, Entity node, int level)
	make_li: function($parent, node, level)
	{
		var self = this;//<ExpandingMenu
		var $li = self.$el($parent,'li').attr({"depth":level,  'id':'n'+node._id});
		$li.text(node._attributes.data._attributes.title);
		$li.click(function() { self.do_click(node); });
		var has_children = node._attributes.children != null && node._attributes.children.length != 0;
		if (has_children)
		{
			$li.addClass("branch");
			var $ul = self.make_ul($parent,node,level);
			$ul.hide();
		}
	},
 	
	//>private void do_click(Entity node)
	do_click: function(node)
	{
		var self = this;//<ExpandingMenu
		self.dispatch('select', node);
	},
	
	
	//>private void toggle(org.jquery.jQuery $ul)
	toggle: function($ul)
	{
		var self = this;//<ExpandingMenu
		var expanded = $ul.attr('expanded')=='true';
		if (expanded)
		{
			$ul.hide();
			$ul.attr('expanded',false);
		}
		else
		{
			$ul.show();
			$ul.attr('expanded',true);
		}
	}

	
	
})
.endType();


	





