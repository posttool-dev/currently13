vjo.ctype('com.pagesociety.util.NodeDict') //< public

.props({
	
})
.protos({
	_map:null,//<Object
	
	//>public constructor()
	constructs: function()
	{ 
		this._map = {}; 
	},
	
	//>public void put(com.pagesociety.persistence.Entity node, Object o)
	put: function(node,o)
	{ 
		this._map[node._attributes.node_id] = o; 
	},
	
	//>public Object get(com.pagesociety.persistence.Entity node)
	get: function(node)
	{ 
		return this._map[node._attributes.node_id]; 
	}
})
.endType();