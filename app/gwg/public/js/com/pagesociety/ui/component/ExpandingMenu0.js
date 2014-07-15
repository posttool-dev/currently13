vjo.ctype('com.pagesociety.ui.component.ExpandingMenu0') //< public
   .needs('com.pagesociety.persistence.Entity')
   .needs('com.pagesociety.util.TreeUtil')
   .needs('com.pagesociety.util.NodeDict')
.inherits('com.pagesociety.ui.Component')

.props({
	
})
.protos({
	
	selected_node:null,//<Entity
	li_map:null,//<private NodeDict
	navstack:null,//<private Array
	
	//>public constructor (Component parent)
	//>public constructor (Component parent, Object options)
	constructs: function(parent, options) 
	{
		var self = this;//<ExpandingMenu0
		self.base(parent, options);
	},
	
	//>public void data(Entity root)
	data: function(root)
	{
		var self = this;//<ExpandingMenu0
		self.li_map = new com.pagesociety.util.NodeDict();
		self.navstack = [];
		self.element.empty();
		self.make_nav(root);
	},
	
	//>public void select(Entity node)
	select: function(node)
	{
		var self = this;//<ExpandingMenu0
		if (self.selected_node != null && self.selected_node._id == node._id)
			return; // the click must have handled it, cause i am here already!
		else
		{ 
//			self.do_click(node);
//			return;
			// this is a 'deep' link, so expand the whole path.. hideall first...todo hideallnow!
			if (self.selected_node!=null) 
				self.li_map.get(self.selected_node).removeClass('selected');
			if (self.li_map.get(node)==null)
			{
				self.hideall(0,function(){});
				return;
			}
			self.selected_node = node;
			self.hideall(0,function(){
				var a = com.pagesociety.util.TreeUtil.getAncestors(node);
				for (var i=0; i<a.length; i++)
				{
					var $li = self.li_map.get(a[i]);
					if ($li!=null)
						self.toggle($li.next());
				}
				var has_children = node._attributes.children != null && node._attributes.children.length != 0;
				if (has_children)
					self.toggle(self.li_map.get(node).next());
				self.li_map.get(node).addClass('selected');
			});
		}
	},
	
	//>private org.jquery.jQuery make_nav(Entity root)
	make_nav: function(root)
	{
		var self = this;//<ExpandingMenu0
		var $nav = self.$el(self.element,'nav');
		var $root_ul = self.$el($nav,'ul').attr({"depth":0, "expanded":true});
		self.each(root._attributes.children, function(child_node){
			self.make_ul($root_ul, child_node, 1);
		});
		return $nav;
	},

	
	//>private void make_ul(org.jquery.jQuery $parent, Entity node, int level)
	make_ul: function($parent, node, level)
	{
		var self = this;//<ExpandingMenu0
		var has_children = node._attributes.children != null && node._attributes.children.length != 0;
		var $li = $("<li>"+node._attributes.data._attributes.title+"</li>");
		self.li_map.put(node, $li);
		$li.click(function() { self.do_click(node); });
		$parent.append($li);
		if (has_children)
		{
			$li.addClass("branch");
			var $ul = $("<ul></ul>").attr({"depth":level, "expanded":false});
			$ul.hide();
			$parent.append($ul);
			self.each(node._attributes.children, function(child_node){
				self.make_ul($ul, child_node, level+1);
			});
		}
		
	},
	
	
	//>private void do_click(Entity node)
	do_click: function(node)
	{
		var self = this;//<ExpandingMenu0
		var has_children = node._attributes.children != null && node._attributes.children.length != 0;
		var $branch = self.li_map.get(node);//<org.jquery.jQuery
		var level = $branch.parent().attr("depth");
		if (has_children)
		{
			var $children = $branch.next();//<org.jquery.jQuery
			if (level < self.navstack.length)
				self.hideall(level, 
					function(){ self.toggle($children); });
			else
				self.toggle($children);
		}
		else
		{
			if (level < self.navstack.length)
				self.hideall(level);
		}
		if (self.selected_node != null)
			self.li_map.get(self.selected_node).removeClass('selected'); // get $li by node
		self.selected_node = node;
		$branch.addClass('selected');
		self.dispatch('select', node)
	},
	
	//>private void hideall(int len)
	//>private void hideall(int len, Function on_complete)
	hideall: function(l, on_complete)
	{
		var self = this;//<ExpandingMenu0
		if (self.navstack.length == l || self.navstack.length == 0)
		{
			if (on_complete)
				on_complete();
			return;
		}
		var $$ = self.navstack.pop();
		$$.attr('expanded',false);
		$$.hide(111,function()
		{ 
			self.hideall(l, on_complete); 
		});
	},
	//>private void toggle(org.jquery.jQuery $$)
	toggle: function($$)
	{
		var self = this;//<ExpandingMenu0
		var expanded = $$.attr('expanded')=='true';
		if (expanded)
		{
			$$.hide(111);
			$$.attr('expanded',false);
			self.navstack.pop();
		}
		else
		{
			$$.show(111);
			$$.attr('expanded',true);
			self.navstack.push($$);
		}
	}

	
	
})
.endType();


	





