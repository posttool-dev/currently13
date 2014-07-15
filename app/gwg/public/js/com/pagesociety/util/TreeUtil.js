vjo.ctype('com.pagesociety.util.TreeUtil') //< public
   .needs('com.pagesociety.persistence.Entity')
.props({
	
	//>public static Entity findByNodeId(String id, Entity node)
	findByNodeId: function(id,node)
	{
	    if (node==null)
	        return null;
	    if (node._attributes.node_id==id)
	        return node;
		for (var i=0; i<node._attributes.children.length; i++)
		{
			var nn = com.pagesociety.util.TreeUtil.findByNodeId(id,node._attributes.children[i]);
			if (nn!=null)
				return nn;
		}
		return null;
	},
	
	//>public static Entity findById(Number id, Entity node)
	findById: function(id,node)
	{
	    if (node==null)
	        return null;
	    if (node._id==id)
	        return node;
		for (var i=0; i<node._attributes.children.length; i++)
		{
			var nn = com.pagesociety.util.TreeUtil.findById(id,node._attributes.children[i]);
			if (nn!=null)
				return nn;
		}
		return null;
	},
	
	//>public static Object findByImage(Entity img, Entity node, boolean skip)
	findByImage: function(img,node,skip)
	{
	    if (node==null)
	        return null;
	    if (!skip && node._attributes.data._attributes.images)
	    {
	    	var ii = node._attributes.data._attributes.images;
	    	for (var i=0; i<ii.length; i++)
	    	{
	    		if (img._attributes.resource.equals(ii[i]._attributes.resource))
	    			return { node: node, index: i };
	    	}
	    }
		for (var i=0; i<node._attributes.children.length; i++)
		{
			var nn = com.pagesociety.util.TreeUtil.findByImage(img,node._attributes.children[i],false);
			if (nn!=null)
				return nn;
		}
		return null;
	},
	
	//>public static void addParents(Entity node)
	addParents: function(node)
	{
	    if (node==null)
	        return;
		for (var i=0; i<node._attributes.children.length; i++)
		{
			var nn = node._attributes.children[i];
			nn._attributes.parent_node = node;
			nn._attributes.parent = node;
			com.pagesociety.util.TreeUtil.addParents(nn);
		}
	},
	
	//>public static Array getAncestors(Entity node)
	getAncestors: function(node)
	{
		var a = [];
		var p = node._attributes.parent;
		while (p!=null)
		{
			a.unshift(p);
			p = p._attributes.parent;
		}
		return a;
	},
	
	//>public static Entity getFirstLeaf(Entity node)
	getFirstLeaf: function(node)
	{
		var c = node._attributes.children;
		while (c!=null && c.length!=0)
		{
			node = c[0];
			c = node._attributes.children;
		}
		return node;
	},
	
	//>public static boolean atHome(Entity node)
	atHome: function(node)
	{
		return node._attributes.parent_node==null;
	},
	
	
	
	//>public static Entity getById(Entity root, Number id)
	getById: function(root,id)
	{
		if (root==null)
			return null;
		return com.pagesociety.util.TreeUtil.get_by_id(root, id, 0);
	},
	
	//>private static Entity getById(Entity n, Number id, int depth)
	get_by_id: function(n, id, depth)
	{
		if (n._id == id)
			return n;
		if (n._attributes.children != null)
			for (var i=0; i<n._attributes.children.length; i++)
			{
				var nc = com.pagesociety.util.TreeUtil.get_by_id(n._attributes.children[i], id, depth+1);
				if (nc != null)
					return nc;
			}
		return null;
	},
	
	//>public static Entity getByPermalink(Entity root, String pl)
	getByPermalink: function(root,pl)
	{
		if (root==null)
			return null;
		if (pl=="" || pl=="/")
			return root;
		return com.pagesociety.util.TreeUtil.get_by_pl(root, pl, 0);
	},
	
	//>private static Entity get_by_pl(Entity n, String pl, int depth)
	get_by_pl: function(n,pl,depth)
	{
		if (n._attributes.node_id == pl)
			return n;
		var chl = n._attributes.children;
		if (chl != null)
			for (var i=0; i<chl.length; i++)
			{
				var nc = com.pagesociety.util.TreeUtil.get_by_pl(chl[i], pl, depth+1);
				if (nc != null)
					return nc;
			}
		return null;
	},
	
	//>public static Entity getByType(Entity root, String type)
	getByType: function(root, type)
	{
		var a = com.pagesociety.util.TreeUtil.getAllByType(root,type);
		if (a.length==0)
			return null;
		else
			return a[0];
	},
	
	//>public static Entity getAllByType(Entity root, String type)
	getAllByType: function(root, type)
	{
		var a = [];
		if (root==null)
			return a;
		com.pagesociety.util.TreeUtil.get_by_type(root, type, a);
		return a;
	},
	
	//>public static void get_by_type(Entity root, String type, Array a)
	get_by_type: function(n, type, a)
	{
		if (n._attributes.data._type == type)
			a.push(n);
		if (n._attributes.children != null)
			for (var i=0; i<n._attributes.children.length; i++)
				com.pagesociety.util.TreeUtil.get_by_type(n._attributes.children[i], type, a);
	},
	
	////////
	//>public static Entity getFirstChild(Entity node)
	getFirstChild: function(node)
	{
		var c = node._attributes.children;
		if (c==null||c.length==0)
			return null;
		return c[0];
	},
		
		
	//>public static Entity getSibling(Entity root,Entity node)
	getSibling: function(root,node)
	{
		if (node._attributes.parent_node==null)
			return null;
		var parent = node._attributes.parent_node;
		var siblings = parent._attributes.children;
		var index = this.getIndex(node,parent)+1;
		if (index>siblings.length-1)
			return null;
		return siblings[index];
	},
		
		
	//>public static Entity getAncestorsSibling(Entity root,Entity node)
	getAncestorsSibling: function(root,node)
	{
		var p = node._attributes.parent_node;
		while (p!=null)
		{
			var s = this.getSibling(root,p);
			if (s!=null)
				return s;
			p = p._attributes.parent_node;
		}
		return null;
	},
	
	//>public static Entity getPreviousSibling(Entity root,Entity node)
	getPreviousSibling: function(root,node)
	{
		if (node._attributes.parent_node==null)
			return null;
		var parent = node._attributes.parent_node;//<Entity
		var siblings = parent._attributes.children;//<Entity[]
		var index = this.getIndex(node,parent)-1;
		if (index<0)
			return null;
		return siblings[index];
	},
	
	//>public static int getIndex(Entity node,Entity parent)
	getIndex: function(node,parent)
	{
		var pc = parent._attributes.children;//<Entity[]
		var s = pc.length;
		for (var i=0; i<s; i++)
		{
			if (pc[i].eq(node))
				return i;
		}
		return -1;
	}
			

	
})
.protos({
	
})
.endType();