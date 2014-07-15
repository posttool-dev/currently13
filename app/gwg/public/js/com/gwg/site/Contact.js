vjo.ctype('com.gwg.site.Contact') //< public
.inherits('com.pagesociety.ui.Component')

.props({
	
})
.protos({
	
	t:null,//<org.jquery.jQuery
	
	//>public constructor (Component parent)
	constructs: function(parent) 
	{
		var self = this; //<Contact
		self.base(parent,{className:'contact'});
		self.t = self.$div(self.element,'ps_text');
	},
	
	//>public void data(com.pagesociety.persistence.Entity node)
	data: function(node)
	{
		var self = this;//<Contact
		var images = node._attributes.data._attributes.images;
		
		if (node._attributes.data._attributes.description != null)
			self.t.html(node._attributes.data._attributes.description);
		
	}

	
})
.endType();